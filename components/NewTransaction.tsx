
import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, Info, ShieldCheck, Wallet, ChevronRight, Loader2, CheckCircle2, DollarSign, Activity, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NewTransactionProps {
  userId: string;
}

/**
 * Componente NewTransaction: Tela de criação de novos Swaps.
 * Restaurada para o visual "perfeito" conforme solicitado pelo usuário.
 */
const NewTransaction: React.FC<NewTransactionProps> = ({ userId }) => {
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [success, setSuccess] = useState(false);
  const [usdtPrice, setUsdtPrice] = useState(5.26);
  const [showFixedFeeInfo, setShowFixedFeeInfo] = useState(false);

  // Busca cotação real da Binance
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoadingQuote(true);
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL');
        const data = await response.json();
        if (data.price) {
          // Cotação oficial + Spread vindo das configurações
          const realPrice = parseFloat(data.price);

          const { data: spreadData } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'spread')
            .single();

          const currentSpread = spreadData ? Number(spreadData.value) : 0.05;
          setUsdtPrice(realPrice + currentSpread);
        }
      } catch (err) {
        console.error('Erro ao buscar cotação USDT:', err);
      } finally {
        setLoadingQuote(false);
      }
    };

    fetchQuote();
    // Atualiza a cada 30 segundos
    const interval = setInterval(fetchQuote, 30000);
    return () => clearInterval(interval);
  }, []);

  // Lógica de cálculo baseada na cotação dinâmica
  const usdtQuote = usdtPrice;
  const depixToUsdt = 1 / usdtQuote; // 1 BRL = X USDT

  const numericAmount = parseFloat(amount) || 0;
  const fee1Percent = numericAmount * 0.01;
  const fixedFee = (numericAmount > 0 && numericAmount < 100) ? 5.00 : 0.00;
  const amountAfterFees = Math.max(0, numericAmount - fee1Percent - fixedFee);

  const usdtReceived = amountAfterFees / usdtQuote;

  // Validação de carteira EVM (Polygon)
  const isValidWallet = (address: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isWalletValid = wallet === '' || isValidWallet(wallet);

  /**
   * Executa a criação do Swap no Supabase
   */
  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || !wallet || !isValidWallet(wallet) || loadingQuote) return;

    setLoading(true);
    try {
      const txId = `TX-${Math.floor(Math.random() * 90000) + 10000}`;

      const { error } = await supabase.from('transactions').insert([
        {
          id: txId,
          user_id: userId,
          amount_depix: numericAmount,
          amount_usdt: usdtReceived,
          wallet_address: wallet,
          status: 'pending'
        }
      ]);

      if (error) throw error;

      setSuccess(true);
      setAmount('');
      setWallet('');
    } catch (err) {
      console.error('Erro ao realizar swap:', err);
      alert('Erro ao processar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-50">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-4 tracking-tight">Solicitação Enviada!</h2>
        <p className="text-gray-500 font-medium mb-10 leading-relaxed px-8">Seu swap está sendo processado. Em breve os ativos estarão na sua carteira. Acompanhe pelo extrato.</p>
        <button
          onClick={() => setSuccess(false)}
          className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
        >
          Fazer Novo Swap
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Nova Transação</h2>
        <p className="text-gray-500 font-medium">Preencha os dados abaixo para converter seus ativos de forma rápida e segura.</p>
      </div>

      {/* Form Card */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
        {/* Inputs Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-600 ml-1">Quantos DePix você vai enviar?</label>
            <div className="relative group">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border-none focus:ring-4 focus:ring-indigo-500/10 rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 transition-all outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase rounded-lg">DEPIX</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-600 ml-1">USDT Polygon a Receber</label>
            <div className="relative">
              <input
                disabled
                type="text"
                value={usdtReceived.toFixed(2)}
                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-5 text-lg font-bold text-gray-800 outline-none cursor-not-allowed"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg">USDT</span>
            </div>
          </div>
        </div>

        {/* Wallet Input */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-600 ml-1">Endereço Wallet Usdt Polygon</label>
          <div className="relative">
            <Wallet
              size={20}
              className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${!isWalletValid ? 'text-pink-500' : (wallet !== '' ? 'text-emerald-500' : 'text-gray-300')
                }`}
            />
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Ex: 0x123...456"
              className={`w-full bg-gray-50 border-none focus:ring-4 rounded-2xl pl-14 pr-6 py-5 text-sm font-medium text-gray-800 transition-all outline-none placeholder:text-gray-300 ${!isWalletValid ? 'ring-4 ring-pink-500/10' : (wallet !== '' ? 'ring-4 ring-emerald-500/10' : 'focus:ring-indigo-500/10')
                }`}
            />
          </div>
          {!isWalletValid && (
            <p className="text-[10px] font-bold text-pink-500 ml-1 animate-in fade-in slide-in-from-top-1">
              Endereço de carteira inválido. Certifique-se de que é um endereço da rede Polygon (0x...).
            </p>
          )}
          <p className="text-[10px] text-gray-400 ml-1 flex items-center">
            <Info size={10} className="mr-1 opacity-50" />
            É de sua responsabilidade informar um endereço valido e correto para rede polygon
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VALOR ENVIADO</p>
          <p className="text-xl font-black text-gray-800">R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TAXA (1%)</p>
          <p className="text-xl font-black text-pink-500">R$ {fee1Percent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm relative overflow-visible">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center justify-between">
            <span className="flex items-center">
              TAXA FIXA
              <button
                onClick={() => setShowFixedFeeInfo(!showFixedFeeInfo)}
                className="ml-1 text-amber-400 hover:text-amber-500 transition-colors"
              >
                <HelpCircle size={10} />
              </button>
            </span>
            {fixedFee === 0 && <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-[8px]">ISENTO</span>}
          </p>
          <p className="text-xl font-black text-indigo-600">R$ {fixedFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

          {showFixedFeeInfo && (
            <div className="absolute bottom-full mb-2 left-0 w-48 bg-gray-900 text-white text-[10px] p-3 rounded-xl shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-200">
              Essa taxa se aplica a transações abaixo de R$ 100,00.
              <div className="absolute top-full left-4 border-8 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-50 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VALOR APÓS TAXAS</p>
          <p className="text-xl font-black text-gray-800">R$ {amountAfterFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Total Received Banner (Green) */}
      <div className="bg-emerald-500 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-emerald-100 group">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2">VOCÊ RECEBERÁ</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-5xl font-black tracking-tight leading-none">
              {loadingQuote ? '...' : usdtReceived.toFixed(2)}
            </p>
            <span className="text-2xl font-medium opacity-80">USDT</span>
          </div>
        </div>
        <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
          <DollarSign size={40} className="text-white" />
        </div>
      </div>

      {/* Market Info */}
      <div className="bg-white p-8 rounded-[2rem] border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-indigo-600">
            <Activity size={20} />
            <span className="font-bold text-sm tracking-tight">Informações da Rede e Cotação</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Loader2 size={14} className="animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest">ATUALIZADO AGORA</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">COTAÇÃO DO DÓLAR (COM SPREAD)</p>
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-black text-gray-800">
                1 USDT = {loadingQuote ? 'Carregando...' : `R$ ${usdtPrice.toFixed(2)}`}
              </span>
              <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Tempo Real</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">TAXA DA REDE DEPIX</p>
            <div className="flex items-baseline space-x-3">
              <span className="text-2xl font-black text-gray-800">
                1 DePiX = {loadingQuote ? '...' : depixToUsdt.toFixed(4)} USDT
              </span>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase">Rede Ativa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSwap}
        disabled={loading || numericAmount <= 0 || !wallet || !isValidWallet(wallet) || loadingQuote}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-300 text-white font-black py-6 rounded-[1.5rem] shadow-2xl shadow-indigo-100 flex items-center justify-center space-x-3 transition-all active:scale-[0.99] group"
      >
        {loading ? <Loader2 size={24} className="animate-spin" /> : (
          <>
            <span className="text-lg">Continuar Swap</span>
            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
};

export default NewTransaction;
