
import React from 'react';
import {
  LayoutDashboard,
  ArrowRightLeft,
  FileText,
  Headset,
  User,
  ClipboardList,
  Users,
  Settings,
  PieChart
} from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  currentView: string;
  onViewChange: (view: ViewType) => void;
  isAdmin?: boolean;
}

/**
 * Componente Sidebar: Navegação lateral adaptativa.
 * Exibe menus diferentes baseados no nível de acesso (Cliente vs Admin).
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, currentView, onViewChange, isAdmin }) => {
  // Menus para Cliente
  const clientMenus = [
    {
      title: 'INÍCIO',
      items: [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'new-transaction', icon: ArrowRightLeft, label: 'Nova Transação' },
        { id: 'statement', icon: ClipboardList, label: 'Extrato' },
      ]
    },
    {
      title: 'OUTROS',
      items: [
        { id: 'docs', icon: FileText, label: 'Como Funciona' },
        { id: 'support', icon: Headset, label: 'Suporte' },
      ]
    }
  ];

  // Menus para Administrador
  const adminMenus = [
    {
      title: 'ADMINISTRAÇÃO',
      items: [
        { id: 'dashboard', icon: PieChart, label: 'Visão Geral' },
        { id: 'customers', icon: Users, label: 'Clientes' },
        { id: 'all-transactions', icon: ArrowRightLeft, label: 'Todas Transações' },
        { id: 'admin-statement', icon: ClipboardList, label: 'Extrato Global' },
      ]
    },
    {
      title: 'SISTEMA',
      items: [
        { id: 'settings', icon: Settings, label: 'Configurações' },
        { id: 'support-inbox', icon: Headset, label: 'Tickets Suporte' },
      ]
    }
  ];

  const menuGroups = isAdmin ? adminMenus : clientMenus;

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} h-full transition-all duration-300 border-r border-gray-100 bg-white flex flex-col z-50`}>
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3">
        <div className={`w-8 h-8 ${isAdmin ? 'bg-indigo-900 shadow-indigo-200' : 'bg-indigo-600 shadow-indigo-100'} rounded-lg flex items-center justify-center text-white font-bold shadow-lg`}>
          A
        </div>
        {isOpen && <span className="font-bold text-xl text-gray-800 tracking-tight">Atlas Swap</span>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 overflow-y-auto custom-scrollbar">
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="mb-8">
            {isOpen && <h3 className="text-[10px] font-bold text-gray-400 tracking-widest mb-4 px-2 uppercase">{group.title}</h3>}
            <ul className="space-y-1">
              {group.items.map((item, iIdx) => (
                <li key={iIdx}>
                  <button
                    onClick={() => onViewChange(item.id as ViewType)}
                    className={`
                    w-full flex items-center group relative px-3 py-2.5 rounded-xl transition-all
                    ${currentView === item.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
                  `}>
                    <item.icon className={`w-5 h-5 ${isOpen ? 'mr-3' : 'mx-auto'}`} />
                    {isOpen && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="font-medium text-[14px]">{item.label}</span>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Profile Section (Bottom) */}
      <div className="p-4 border-t border-gray-50">
        <button
          onClick={() => onViewChange('profile')}
          className={`
            w-full flex items-center p-2 rounded-2xl transition-all group
            ${currentView === 'profile' ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'hover:bg-gray-50'}
          `}
        >
          <div className="relative flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl bg-gray-200 overflow-hidden ring-2 ring-transparent transition-all ${currentView === 'profile' ? 'ring-indigo-200' : 'group-hover:ring-indigo-100'}`}>
              <img src="https://picsum.photos/seed/john/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            {!isOpen && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm border border-white">
                <User size={8} />
              </div>
            )}
          </div>
          {isOpen && (
            <div className="ml-3 text-left overflow-hidden">
              <p className={`text-sm font-bold truncate transition-colors ${currentView === 'profile' ? 'text-indigo-600' : 'text-gray-800'}`}>Meu Perfil</p>
              <div className="flex items-center space-x-1">
                <User size={10} className="text-indigo-400" />
                <p className="text-[10px] text-gray-500 font-medium">{isAdmin ? 'ADMINISTRADOR' : 'CLIENTE'}</p>
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
