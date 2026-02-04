
import React from 'react';
import WelcomeCard from './WelcomeCard';
import USDTChart from './USDTChart';
import StatCards from './StatCards';
import LastTransactions from './LastTransactions';
import SalesOverview from './SalesOverview';
import AdminDashboard from './admin/AdminDashboard';

interface DashboardContentProps {
  isAdmin?: boolean;
  userId: string;
  onViewChange: (view: string) => void;
}

/**
 * Componente DashboardContent: Controlador do conteúdo principal do Dashboard.
 * Alterna entre visão do Cliente e visão do Administrador.
 */
const DashboardContent: React.FC<DashboardContentProps> = ({ isAdmin, userId, onViewChange }) => {
  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Row: Stats */}
      <StatCards userId={userId} />

      {/* Second Row: Welcome & Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-full">
          <WelcomeCard userId={userId} />
        </div>
        <div className="lg:col-span-8">
          <USDTChart />
        </div>
      </div>

      {/* Bottom Row: Activity & Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        <div className="lg:col-span-8">
          <LastTransactions onViewChange={onViewChange} />
        </div>
        <div className="lg:col-span-4">
          <SalesOverview />
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
