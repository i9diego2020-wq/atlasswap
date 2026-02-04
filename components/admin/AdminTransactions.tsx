
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, CheckCircle, XCircle, Clock, ExternalLink, Calendar, X } from 'lucide-react';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';

/**
 * Componente AdminTransactions: Gestão de todas as transações do sistema.
 */
const AdminTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');

    // Confirm Modal state
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchAllTransactions();
    }, []);

    const fetchAllTransactions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          profiles:user_id (full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            console.error('Erro ao buscar transações:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = (id: string, newStatus: string) => {
        const isApprove = newStatus === 'completed';
        setConfirmConfig({
            isOpen: true,
            title: isApprove ? 'Confirmar Aprovação' : 'Confirmar Cancelamento',
            message: isApprove
                ? 'Você está prestes a marcar esta transação como CONCLUÍDA. Confirme se os fundos foram enviados.'
                : 'Esta transação será marcada como FALHA/CANCELADA.',
            type: isApprove ? 'success' : 'danger',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const { error } = await supabase
                        .from('transactions')
                        .update({ status: newStatus })
                        .eq('id', id);

                    if (error) throw error;
                    fetchAllTransactions();
                } catch (err) {
                    console.error('Erro ao atualizar status:', err);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const filtered = transactions.filter(t => {
        const matchesSearch =
            t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.wallet_address?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

        const txDate = new Date(t.created_at);
        const matchesStart = !dateStart || txDate >= new Date(dateStart);
        const matchesEnd = !dateEnd || txDate <= new Date(dateEnd + 'T23:59:59');

        return matchesSearch && matchesStatus && matchesStart && matchesEnd;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Todas as Transações</h2>
                    <p className="text-gray-500 text-sm">Monitore e processe todas as solicitações de swap.</p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por ID, Cliente, E-mail ou Carteira..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all outline-none"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-gray-50 border-none text-xs font-bold text-gray-500 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-indigo-500/10 outline-none cursor-pointer"
                            >
                                <option value="all">TODOS OS STATUS</option>
                                <option value="pending">PENDENTES</option>
                                <option value="completed">CONCLUÍDOS</option>
                                <option value="failed">REJEITADOS</option>
                            </select>
                            {(statusFilter !== 'all' || searchTerm || dateStart || dateEnd) && (
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setStatusFilter('all');
                                        setDateStart('');
                                        setDateEnd('');
                                    }}
                                    className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"
                                    title="Limpar Filtros"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center gap-4 pt-2">
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">De:</span>
                            <input
                                type="date"
                                value={dateStart}
                                onChange={(e) => setDateStart(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-gray-600 outline-none p-1"
                            />
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-xl px-3 py-1.5 border border-gray-100">
                            <Calendar size={14} className="text-gray-400" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">Até:</span>
                            <input
                                type="date"
                                value={dateEnd}
                                onChange={(e) => setDateEnd(e.target.value)}
                                className="bg-transparent border-none text-xs font-bold text-gray-600 outline-none p-1"
                            />
                        </div>
                        <div className="md:ml-auto flex items-center space-x-4">
                            <div className="flex items-center space-x-1.5 text-[10px] font-black text-gray-400 uppercase">
                                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                                <span>{transactions.filter(t => t.status === 'pending').length} Pendentes</span>
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Mostrando {filtered.length} de {transactions.length} Swaps
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">ID / Data</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Valores</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Carregando...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhuma transação encontrada</td>
                                </tr>
                            ) : filtered.map((tx) => (
                                <tr key={tx.id} className="hover:bg-indigo-50/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col text-xs">
                                            <span className="font-bold text-gray-800">#{tx.id.slice(0, 8)}</span>
                                            <span className="text-[10px] text-gray-400">{new Date(tx.created_at).toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-800">{tx.profiles?.full_name}</p>
                                        <p className="text-xs text-gray-400">{tx.profiles?.email}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-indigo-600">R$ {tx.amount_depix.toLocaleString()}</span>
                                            <span className="text-[10px] font-bold text-emerald-600">{tx.amount_usdt.toLocaleString()} USDT</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge status={tx.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {tx.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleUpdateStatus(tx.id, 'completed')}
                                                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                                                        title="Aprovar"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(tx.id, 'failed')}
                                                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                                                        title="Cancelar"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <a
                                                href={`https://tronscan.org/#/address/${tx.wallet_address}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-lg transition-colors bg-gray-50"
                                                title="Ver Carteira no Explorer"
                                            >
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Premium Confirm Modal */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText="Confirmar Ação"
                cancelText="Voltar"
            />
        </div>
    );
};

export default AdminTransactions;
