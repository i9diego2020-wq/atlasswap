
import React from 'react';
import { ShoppingBag, CreditCard, AlertCircle, MoreHorizontal } from 'lucide-react';

const activities = [
  {
    id: '1',
    type: 'order',
    icon: ShoppingBag,
    iconColor: 'text-indigo-600',
    iconBg: 'bg-indigo-50',
    title: 'Novo pedido recebido',
    orderId: '#ORD-45812',
    description: 'Pedido de Michael Scott para 3 itens.',
    time: '2 min atrás'
  },
  {
    id: '2',
    type: 'payment',
    icon: CreditCard,
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    title: 'Pagamento concluído',
    description: 'Recebido pagamento de $1.240,00 via Stripe.',
    time: '45 min atrás'
  },
  {
    id: '3',
    type: 'issue',
    icon: AlertCircle,
    iconColor: 'text-pink-600',
    iconBg: 'bg-pink-50',
    title: 'Novo problema relatado',
    description: 'Um cliente relatou um bug no processo de checkout.',
    time: '3 horas atrás'
  }
];

const RecentActivity: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-gray-800">Atividade Recente</h3>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-8 relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-gray-100"></div>

        {activities.map((item) => (
          <div key={item.id} className="relative flex items-start space-x-6">
            <div className={`relative z-10 p-3 rounded-2xl ${item.iconBg} ${item.iconColor}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-gray-800">
                    {item.title} <span className="text-gray-400 font-medium ml-1">{item.orderId}</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 whitespace-nowrap">{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
