
import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, CheckCircle, Clock, Coins, Loader2 } from 'lucide-react';
import StatCard from './ui/StatCard';
import { StatCardProps } from '../types';
import { supabase } from '../lib/supabase';

interface StatCardsProps {
  userId: string;
}

/**
 * Componente StatCards: Renderiza o grid de cartões de estatística do dashboard.
 * Agora dinâmico: busca dados reais do Supabase para o usuário logado.
 */
const StatCards: React.FC<StatCardsProps> = ({ userId }) => {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    volume: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('transactions')
          .select('status, amount_depix')
          .eq('user_id', userId);

        if (error) throw error;

        if (data) {
          const total = data.length;
          const completed = data.filter(tx => tx.status === 'completed').length;
          const pending = data.filter(tx => tx.status === 'pending').length;
          const volume = data
            .filter(tx => tx.status === 'completed')
            .reduce((acc, tx) => acc + (tx.amount_depix || 0), 0);

          setStats({ total, completed, pending, volume });
        }
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-white rounded-[2rem] border border-gray-100 flex items-center justify-center animate-pulse">
            <Loader2 className="w-6 h-6 text-indigo-200 animate-spin" />
          </div>
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      title: 'Total de Transações',
      value: stats.total.toString(),
      change: stats.total > 0 ? 'Atualizado' : 'Início',
      icon: ArrowRightLeft,
      bgColor: '#fff1f5',
      textColor: 'text-pink-500',
      borderColor: 'border-pink-100',
      badgeBg: 'bg-pink-100',
      chartData: [{ value: 0 }, { value: stats.total }],
      chartType: 'bar'
    },
    {
      title: 'Transações Concluídas',
      value: stats.completed.toString(),
      change: stats.completed > 0 ? 'Sucesso' : '-',
      icon: CheckCircle,
      bgColor: '#eefcf2',
      textColor: 'text-green-600',
      borderColor: 'border-green-100',
      badgeBg: 'bg-green-100',
      chartData: [{ value: 0 }, { value: stats.completed }],
      chartType: 'line'
    },
    {
      title: 'Transações Pendentes',
      value: stats.pending.toString(),
      change: stats.pending > 0 ? 'Aguardando' : '-',
      icon: Clock,
      bgColor: '#f0f4ff',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-100',
      badgeBg: 'bg-blue-100',
      chartData: [{ value: 0 }, { value: stats.pending }],
      chartType: 'line'
    },
    {
      title: 'Volume Total R$',
      value: `R$ ${stats.volume.toLocaleString()}`,
      change: 'Calculado',
      icon: Coins,
      bgColor: '#ffffff',
      textColor: 'text-indigo-500',
      borderColor: 'border-gray-100',
      badgeBg: 'bg-blue-100',
      chartType: 'progress',
      progress: stats.volume > 0 ? 100 : 0
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
};

export default StatCards;
