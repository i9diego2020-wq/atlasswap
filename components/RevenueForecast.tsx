
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity } from 'lucide-react';

const data = [
  { month: 'Jan', y2026: 25, y2025: 45, y2024: 30 },
  { month: 'Fev', y2026: 35, y2025: 55, y2024: 35 },
  { month: 'Mar', y2026: 55, y2025: 35, y2024: 45 },
  { month: 'Abr', y2026: 45, y2025: 65, y2024: 40 },
  { month: 'Mai', y2026: 75, y2025: 45, y2024: 35 },
  { month: 'Jun', y2026: 65, y2025: 75, y2024: 55 },
  { month: 'Jul', y2026: 45, y2025: 35, y2024: 45 },
  { month: 'Ago', y2026: 95, y2025: 75, y2024: 65 },
];

const RevenueForecast: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Previsão de Receita</h3>
            <p className="text-sm text-gray-400">Visão Geral do Lucro</p>
          </div>
        </div>
        <div className="flex space-x-6 text-xs font-semibold">
           <div className="flex items-center space-x-2">
             <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
             <span className="text-gray-500">2026</span>
           </div>
           <div className="flex items-center space-x-2">
             <span className="w-3 h-3 rounded-full bg-pink-400"></span>
             <span className="text-gray-500">2025</span>
           </div>
           <div className="flex items-center space-x-2">
             <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
             <span className="text-gray-500">2024</span>
           </div>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="y2026" 
              stroke="#6366f1" 
              strokeWidth={4} 
              dot={false}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="y2025" 
              stroke="#f472b6" 
              strokeWidth={4} 
              dot={false}
              animationDuration={1500}
            />
            <Line 
              type="monotone" 
              dataKey="y2024" 
              stroke="#34d399" 
              strokeWidth={4} 
              dot={false}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueForecast;
