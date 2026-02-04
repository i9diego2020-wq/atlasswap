
import React, { useState, useEffect } from 'react';
import StatCard from '../ui/StatCard';
import { Users, ArrowRightLeft, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Componente AdminDashboard: Visão geral para administradores.
 */
const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({
        totalCustomers: 0,
        pendingSwaps: 0,
        monthlyVolume: 0,
        totalFees: 0,
        recentActivities: [] as any[]
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminStats();
    }, []);

    const fetchAdminStats = async () => {
        try {
            setLoading(true);

            // 1. Total de Clientes
            const { count: customersCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 2. Swaps Pendentes
            const { count: pendingCount } = await supabase
                .from('transactions')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'pending');

            // 3. Volume Mensal e Taxas (Transações completadas no mês atual)
            const firstDayOfMonth = new Date();
            firstDayOfMonth.setDate(1);
            firstDayOfMonth.setHours(0, 0, 0, 0);

            const { data: monthData } = await supabase
                .from('transactions')
                .select('amount_depix, amount_usdt')
                .eq('status', 'completed')
                .gte('created_at', firstDayOfMonth.toISOString());

            const volume = monthData?.reduce((acc, curr) => acc + (Number(curr.amount_depix) || 0), 0) || 0;
            // Cálculo estimado de taxas: 1% do volume + fixas (simplificado para o dashboard)
            const fees = volume * 0.01;

            // 4. Últimas Atividades
            const { data: recent } = await supabase
                .from('transactions')
                .select('*, profiles(full_name)')
                .order('created_at', { ascending: false })
                .limit(5);

            setStats({
                totalCustomers: customersCount || 0,
                pendingSwaps: pendingCount || 0,
                monthlyVolume: volume,
                totalFees: fees,
                recentActivities: recent || []
            });

        } catch (err) {
            console.error('Erro ao buscar stats admin:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Painel Administrativo</h2>
                <p className="text-gray-500">Monitoramento global do sistema Atlas Swap.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total de Clientes"
                    value={loading ? '...' : stats.totalCustomers.toString()}
                    change="+ Nova Metrica"
                    icon={Users}
                    bgColor="#eefcf2"
                    textColor="text-green-600"
                    borderColor="border-green-100"
                    badgeBg="bg-green-100"
                />
                <StatCard
                    title="Swaps Pendentes"
                    value={loading ? '...' : stats.pendingSwaps.toString()}
                    change={stats.pendingSwaps > 0 ? "Ação Requerida" : "Em dia"}
                    icon={AlertTriangle}
                    bgColor="#fff1f5"
                    textColor="text-pink-500"
                    borderColor="border-pink-100"
                    badgeBg="bg-pink-100"
                />
                <StatCard
                    title="Volume Mensal"
                    value={loading ? '...' : `R$ ${stats.monthlyVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change="Atualizado"
                    icon={DollarSign}
                    bgColor="#f0f4ff"
                    textColor="text-blue-600"
                    borderColor="border-blue-100"
                    badgeBg="bg-blue-100"
                />
                <StatCard
                    title="Taxas Coletadas"
                    value={loading ? '...' : `R$ ${stats.totalFees.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change="Estimado"
                    icon={TrendingUp}
                    bgColor="#ffffff"
                    textColor="text-indigo-600"
                    borderColor="border-gray-100"
                    badgeBg="bg-indigo-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
                {/* Recent Global Activity */}
                <div className="lg:col-span-8 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Últimas Atividades</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-xs">Carregando Atividades...</p>
                        ) : stats.recentActivities.length === 0 ? (
                            <p className="text-center text-gray-400 py-10 font-bold uppercase tracking-widest text-xs">Nenhuma atividade recente</p>
                        ) : stats.recentActivities.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-gray-100 transition-all">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 font-bold border border-gray-100">
                                        {(tx.profiles?.full_name || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{tx.profiles?.full_name || 'Usuário'} solicitou um Swap</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">
                                            {new Date(tx.created_at).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">R$ {Number(tx.amount_depix).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${tx.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                            tx.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        {tx.status === 'completed' ? 'Finalizado' : tx.status === 'pending' ? 'Pendente' : 'Falhou'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Health */}
                <div className="lg:col-span-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Status do Sistema</h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                <span>Liquidez USDT</span>
                                <span className="text-indigo-600">85%</span>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500" style={{ width: '85%' }}></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                <span>Carga da API</span>
                                <span className="text-emerald-600">Baixa</span>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: '15%' }}></div>
                            </div>
                        </div>
                        <div className="p-4 bg-indigo-900 rounded-2xl text-white">
                            <p className="text-xs font-bold opacity-80 uppercase tracking-widest mb-1">Cotação Atual</p>
                            <p className="text-2xl font-black italic">1 USDT = R$ 5,26</p>
                            <button className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase transition-colors">Ajustar Cotação</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
