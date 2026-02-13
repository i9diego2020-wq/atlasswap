
import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, TrendingUp, Info, ShieldCheck, Wallet, ChevronRight, Loader2, CheckCircle2, DollarSign, Activity, HelpCircle, Copy, Check, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { deriveLiquidAddress, monitorAddress, getNextLiquidIndex } from '../lib/liquid';
import { QRCodeSVG } from 'qrcode.react';

interface NewTransactionProps {
  userId: string;
}

type Step = 'form' | 'payment' | 'success';

const NewTransaction: React.FC<NewTransactionProps> = ({ userId }) => {
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [usdtPrice, setUsdtPrice] = useState(5.26);
  const [showFixedFeeInfo, setShowFixedFeeInfo] = useState(false);

  // Estados do Pagamento Liquid
  const [liquidAddress, setLiquidAddress] = useState('');
  const [liquidTxId, setLiquidTxId] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentDetected, setPaymentDetected] = useState(false);

  // Busca cotação real da Binance
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoadingQuote(true);
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=USDTBRL');
        const data = await response.json();
        if (data.price) {
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
    const interval = setInterval(fetchQuote, 30000);
    return () => clearInterval(interval);
  }, []);

  // Monitoramento do endereço gerado
  useEffect(() => {
    let interval: any;
    if (step === 'payment' && liquidAddress && !paymentDetected) {
      interval = setInterval(async () => {
        const status = await monitorAddress(liquidAddress);
        if (status.received) {
          setPaymentDetected(true);
          setLiquidTxId(status.txid || '');

          // Atualiza a transação o depósito detectado (Aguardando processamento backend)
          await supabase
            .from('transactions')
            .update({
              status: 'confirmed_depix',
              confirmed_at: new Date().toISOString()
            })
            .eq('deposit_address', liquidAddress);

          // Iniciamos a transição para a tela de sucesso, 
          // mas informando que o processamento do USDT começou.
          setTimeout(() => setStep('success'), 2000);
        }
      }, 10000); // A cada 10 segundos
    }
    return () => clearInterval(interval);
  }, [step, liquidAddress, paymentDetected]);

  const usdtQuote = usdtPrice;
  const numericAmount = parseFloat(amount) || 0;
  const fee1Percent = numericAmount * 0.01;
  const fixedFee = (numericAmount > 0 && numericAmount < 100) ? 5.00 : 0.00;
  const amountAfterFees = Math.max(0, numericAmount - fee1Percent - fixedFee);
  const usdtReceived = amountAfterFees / usdtQuote;

  const isValidWallet = (address: string) => /^0x[a-fA-F0-9]{40}$/.test(address);
  const isWalletValid = wallet === '' || isValidWallet(wallet);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(liquidAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Inicia o fluxo de Swap
   */
  const handleStartSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (numericAmount <= 0 || !wallet || !isValidWallet(wallet) || loadingQuote) return;

    setLoading(true);
    setPaymentDetected(false); // Garantir que está resetado
    try {
      const txId = `TX-${Math.floor(Math.random() * 90000) + 10000}`;

      // 1. Obter próximo índice Liquid
      const index = await getNextLiquidIndex();

      // 2. Derivar endereço
      const derived = deriveLiquidAddress(index);
      setLiquidAddress(derived.address);

      // 3. Registrar transação com o endereço de depósito
      const { error } = await supabase.from('transactions').insert([
        {
          id: txId,
          user_id: userId,
          amount_depix: numericAmount,
          amount_usdt: usdtReceived,
          wallet_address: wallet,
          deposit_address: derived.address,
          status: 'pending'
        }
      ]);

      if (error) throw error;
      setStep('payment');
    } catch (err: any) {
      console.error('Erro ao iniciar swap:', err);
      const errMsg = err.message || err.toString();
      alert(`[v3] Erro ao processar: ${errMsg}. Tente novamente.`);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERS ---

  if (step === 'success') {
    return (
      <div className="max-w-2xl mx-auto mt-12 bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/50 text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-50">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tight">Depósito Confirmado!</h2>
        <p className="text-gray-500 font-medium mb-12 leading-relaxed px-8">
          Recebemos seu depósito Liquid BTC. Nossa Engine está processando o envio de USDT para sua carteira Polygon agora mesmo.
        </p>
        <button
          onClick={() => {
            setStep('form');
            setAmount('');
            setWallet('');
            setLiquidAddress('');
            setPaymentDetected(false);
          }}
          className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
        >
          Fazer Novo Swap
        </button>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-6 duration-500">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-gray-800 tracking-tight">Aguardando Depósito</h2>
          <div className="inline-flex items-center px-6 py-3 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700 space-x-3 animate-bounce">
            <Info size={20} />
            <span className="text-lg font-black uppercase tracking-tight">
              Envie exatamente: R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-gray-500 font-medium">O valor será convertido automaticamente para USDT na rede Polygon.</p>
        </div>

        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-indigo-100/30 overflow-hidden flex flex-col md:flex-row">
          {/* Esquerda: QR e Endereço */}
          <div className="p-12 md:w-1/2 flex flex-col items-center justify-center space-y-8 border-b md:border-b-0 md:border-r border-gray-50">
            <div className="p-8 bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100/50 relative group">
              <QRCodeSVG value={liquidAddress} size={240} />
              <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] pointer-events-none"></div>
            </div>

            <div className="w-full space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">ENDEREÇO DE DEPÓSITO LIQUID (lq1)</p>
              <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-2xl group cursor-pointer" onClick={copyToClipboard}>
                <code className="flex-1 text-xs font-bold text-gray-600 break-all">{liquidAddress}</code>
                {copied ? <Check className="text-emerald-500" size={18} /> : <Copy className="text-gray-300 group-hover:text-indigo-600 transition-colors" size={18} />}
              </div>
            </div>
          </div>

          {/* Direita: Status e Info */}
          <div className="p-12 md:w-1/2 bg-gray-50/50 flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-indigo-600 mb-2">
                <Clock className="animate-pulse" size={24} />
                <span className="font-black text-xl tracking-tight">Status da Transação</span>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-white shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400">AGUARDANDO REDE</span>
                  <Loader2 className="animate-spin text-indigo-600" size={16} />
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 animate-progress"></div>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  O monitoramento é automático. Assim que seu depósito for detectado na Liquid Network, esta tela será atualizada.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 space-y-3">
              <div className="flex items-center space-x-2 text-amber-600">
                <ShieldCheck size={18} />
                <span className="text-xs font-black uppercase tracking-wider">Aviso de Segurança</span>
              </div>
              <p className="text-[11px] font-medium text-amber-700/80 leading-relaxed">
                Envie apenas L-BTC para este endereço. O envio de outros ativos pode resultar em perda permanente.
                Mantenha esta página aberta enquanto aguarda a confirmação.
              </p>
            </div>

            <button
              onClick={() => setStep('form')}
              className="text-gray-400 hover:text-gray-600 text-xs font-bold transition-colors text-center w-full"
            >
              Cancelar e Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          width: 60%;
          animation: progress 2s infinite ease-in-out;
        }
      `}</style>

      <div>
        <h2 className="text-3xl font-black text-gray-800 tracking-tight">Nova Transação</h2>
        <p className="text-gray-500 font-medium">Preencha os dados abaixo para converter seus ativos via Liquid Network.</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 space-y-8">
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

        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-600 ml-1">Endereço Wallet Usdt Polygon (Destino)</label>
          <div className="relative">
            <Wallet
              size={20}
              className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${!isWalletValid ? 'text-pink-500' : (wallet !== '' ? 'text-emerald-500' : 'text-gray-300')}`}
            />
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="Ex: 0x123...456"
              className={`w-full bg-gray-50 border-none focus:ring-4 rounded-2xl pl-14 pr-6 py-5 text-sm font-medium text-gray-800 transition-all outline-none placeholder:text-gray-300 ${!isWalletValid ? 'ring-4 ring-pink-500/10' : (wallet !== '' ? 'ring-4 ring-emerald-500/10' : 'focus:ring-indigo-500/10')}`}
            />
          </div>
          {!isWalletValid && (
            <p className="text-[10px] font-bold text-pink-500 ml-1 animate-in fade-in slide-in-from-top-1">
              Endereço de carteira inválido. Certifique-se de que é um endereço da rede Polygon (0x...).
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VALOR ENVIADO</p>
          <p className="text-xl font-black text-gray-800">R$ {numericAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm text-rose-500">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">TAXA (1%)</p>
          <p className="text-xl font-black">R$ {fee1Percent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
            TAXA FIXA <Info size={10} className="text-gray-300" />
          </p>
          <p className="text-xl font-black text-indigo-600">R$ {fixedFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VALOR APÓS TAXAS</p>
          <p className="text-xl font-black text-gray-800">R$ {amountAfterFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Card Destaque: Você Receberá */}
      <div className="bg-emerald-600 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-100/50 text-white relative overflow-hidden group">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black text-emerald-100 uppercase tracking-widest">VOCÊ RECEBERÁ</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black tracking-tight">{usdtReceived.toFixed(2)}</span>
              <span className="text-xl font-bold text-emerald-100">USDT</span>
            </div>
          </div>
          <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
            <DollarSign size={40} className="text-white" />
          </div>
        </div>
        {/* Efeito Visual */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
      </div>

      {/* Informações da Rede e Cotação */}
      <div className="bg-white/50 backdrop-blur-sm p-8 rounded-[2rem] border border-gray-100/50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600">
            <Activity size={20} />
            <h3 className="font-black text-sm uppercase tracking-tight">Informações da Rede e Cotação</h3>
          </div>
          <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400">
            <Clock size={12} />
            <span className="uppercase tracking-widest">ATUALIZADO AGORA</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">COTAÇÃO DO DÓLAR (COM SPREAD)</p>
            <div className="flex items-center space-x-3">
              <p className="text-2xl font-black text-gray-800">1 USDT = R$ {usdtPrice.toFixed(2)}</p>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md uppercase tracking-tighter">TEMPO REAL</span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">TAXA DA REDE DEPIX</p>
            <div className="flex items-center space-x-3">
              <p className="text-2xl font-black text-gray-800">1 DePiX = {(1 / usdtPrice).toFixed(4)} USDT</p>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-md uppercase tracking-tighter">REDE ATIVA</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleStartSwap}
        disabled={loading || numericAmount <= 0 || !wallet || !isValidWallet(wallet) || loadingQuote}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-100 disabled:text-indigo-300 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-indigo-100/50 flex items-center justify-center space-x-3 transition-all active:scale-[0.99] group"
      >
        {loading ? <Loader2 size={24} className="animate-spin" /> : (
          <>
            <span className="text-lg uppercase tracking-tight">Gerar Endereço de Depósito</span>
            <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </>
        )}
      </button>
    </div>
  );
};

export default NewTransaction;
