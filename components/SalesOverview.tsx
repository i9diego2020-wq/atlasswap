
import React from 'react';
import { MoreHorizontal, Settings } from 'lucide-react';

const SalesOverview: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Visão Geral de Vendas</h3>
          <p className="text-xs text-gray-400 font-semibold">Últimos 7 dias</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          {/* Custom Multi-Ring Semi-Donut Visual using SVG */}
          <svg className="w-full h-full transform" viewBox="0 0 200 200">
            {/* Background Rings */}
            <circle cx="100" cy="100" r="80" stroke="#f1f5f9" strokeWidth="12" fill="none" />
            <circle cx="100" cy="100" r="65" stroke="#f1f5f9" strokeWidth="12" fill="none" />
            <circle cx="100" cy="100" r="50" stroke="#f1f5f9" strokeWidth="12" fill="none" />

            {/* Active Data Rings */}
            {/* Blue Ring */}
            <circle 
                cx="100" cy="100" r="80" 
                stroke="#6366f1" strokeWidth="12" fill="none" 
                strokeDasharray="502" strokeDashoffset="200"
                strokeLinecap="round"
                className="transition-all duration-1000"
            />
            {/* Purple Ring */}
            <circle 
                cx="100" cy="100" r="65" 
                stroke="#a855f7" strokeWidth="12" fill="none" 
                strokeDasharray="408" strokeDashoffset="120"
                strokeLinecap="round"
                className="transition-all duration-1000"
            />
            {/* Teal Ring */}
            <circle 
                cx="100" cy="100" r="50" 
                stroke="#14b8a6" strokeWidth="12" fill="none" 
                strokeDasharray="314" strokeDashoffset="80"
                strokeLinecap="round"
                className="transition-all duration-1000"
            />
          </svg>
          
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-gray-800">$14.2k</span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Receita</span>
          </div>
        </div>
      </div>

      {/* Floating Action Button-like decoration */}
      <button className="absolute bottom-6 right-6 p-4 bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-lg shadow-pink-200 transition-all hover:scale-105 active:scale-95">
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
};

export default SalesOverview;
