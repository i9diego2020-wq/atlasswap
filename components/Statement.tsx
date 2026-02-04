
import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, ChevronLeft, ChevronRight, MoreHorizontal, Calendar } from 'lucide-react';
import Badge from './ui/Badge';
import { supabase } from '../lib/supabase';

interface StatementProps {
  userId: string;
  isAdmin?: boolean;
}

/**
 * Componente Statement: Listagem histórica de transações do usuário.
 * Integrado com Supabase para exibir dados reais e dinâmicos.
 */
const Statement: React.FC<StatementProps> = ({ userId, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  /**
   * Busca transações do usuário atual
   */
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      // Se não for admin, filtra apenas as do usuário logado
      if (!isAdmin) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra as transações com base no termo de busca e intervalo de datas
   */
  const filteredTransactions = transactions.filter(tx => {
    // Busca por termo (ID ou Status)
    const matchesSearch =
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.status.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por Data
    const txDate = new Date(tx.created_at).toISOString().split('T')[0];
    const matchesStart = !startDate || txDate >= startDate;
    const matchesEnd = !endDate || txDate <= endDate;

    return matchesSearch && matchesStart && matchesEnd;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Extrato</h2>
          <p className="text-gray-500 text-sm">Visualize todo o seu histórico de transações e movimentações.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-6 py-2.5 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-50 hover:shadow-sm transition-all">
            <Download size={18} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Barra de Filtros Robusta */}
        <div className="p-6 border-b border-gray-50 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Busca por Texto */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por ID ou Status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all outline-none"
              />
            </div>

            {/* Intervalo de Datas */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-transparent focus-within:border-indigo-200 transition-all">
                <span className="text-[10px] font-black text-gray-400 uppercase ml-2">De</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 outline-none p-1"
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-transparent focus-within:border-indigo-200 transition-all">
                <span className="text-[10px] font-black text-gray-400 uppercase ml-2">Até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-xs font-bold text-gray-700 outline-none p-1"
                />
              </div>
              <button
                onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
                className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                title="Limpar Filtros"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
                Exibindo {filteredTransactions.length} transações
              </p>
            </div>
          </div>
        </div>

        {/* Tabela de Transações */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ID Da Transação</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Data e Hora</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Valor (BRL)</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Recebido (USDT)</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 animate-pulse font-bold uppercase tracking-widest text-xs">
                    Buscando transações no banco de dados...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                        <MoreHorizontal size={32} />
                      </div>
                      <div>
                        <p className="text-gray-800 font-bold uppercase tracking-widest text-xs">Nenhuma movimentação</p>
                        <p className="text-gray-400 text-xs mt-1">Suas transações aparecerão aqui assim que você realizar seu primeiro swap.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-indigo-50/10 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">{tx.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Calendar size={12} className="opacity-40" />
                      <span className="text-xs font-bold">{new Date(tx.created_at).toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900 leading-none">R$ {tx.amount_depix.toLocaleString()}</span>
                    <p className="text-[10px] text-gray-400 font-medium tracking-tight">Depósito Pix</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-black text-emerald-600 italic">{tx.amount_usdt.toLocaleString()} USDT</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={tx.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all border border-transparent hover:border-indigo-100">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="p-6 border-t border-gray-50 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Página 1 de 1</p>
          <div className="flex space-x-2">
            <button className="p-2 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed"><ChevronLeft size={18} /></button>
            <button className="p-2 border border-gray-100 rounded-xl text-gray-400 cursor-not-allowed"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statement;
