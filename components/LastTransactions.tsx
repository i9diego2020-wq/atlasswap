
import React from 'react';
import { ArrowRightLeft, MoreHorizontal, CheckCircle2, Clock, XCircle } from 'lucide-react';

const transactions = [
  {
    id: '1',
    status: 'completed',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Troca DePix para USDT',
    amount: 'R$ 1.200,00',
    description: 'Wallet: 0x71C...3921',
    time: '5 min atrás'
  },
  {
    id: '2',
    status: 'pending',
    icon: Clock,
    iconColor: 'text-amber-500',
    iconBg: 'bg-amber-50',
    title: 'Troca DePix para USDT',
    amount: 'R$ 450,00',
    description: 'Aguardando confirmação DePix',
    time: '22 min atrás'
  },
  {
    id: '3',
    status: 'completed',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Troca DePix para USDT',
    amount: 'R$ 3.000,00',
    description: 'Wallet: 0x71C...3921',
    time: '1 hora atrás'
  },
  {
    id: '4',
    status: 'failed',
    icon: XCircle,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-50',
    title: 'Troca DePix para USDT',
    amount: 'R$ 150,00',
    description: 'Cancelado pelo usuário',
    time: '3 horas atrás'
  },
  {
    id: '5',
    status: 'completed',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
    title: 'Troca DePix para USDT',
    amount: 'R$ 5.000,00',
    description: 'Wallet: 0x71C...3921',
    time: '5 horas atrás'
  }
];

interface LastTransactionsProps {
  onViewChange: (view: string) => void;
}

const LastTransactions: React.FC<LastTransactionsProps> = ({ onViewChange }) => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-800">Últimas Transações</h3>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {transactions.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${item.iconBg} ${item.iconColor} transition-transform group-hover:scale-110`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{item.amount}</p>
              <p className="text-[10px] font-semibold text-gray-400 mt-0.5 uppercase tracking-wider">{item.time}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onViewChange('statement')}
        className="w-full mt-6 py-3 text-sm font-bold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-colors active:scale-[0.98]"
      >
        Ver Todas as Transações
      </button>
    </div>
  );
};

export default LastTransactions;
