
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardContent from './components/DashboardContent';
import NewTransaction from './components/NewTransaction';
import Profile from './components/Profile';
import Statement from './components/Statement';
import Support from './components/Support';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { ViewType } from './types';

import AdminCustomers from './components/admin/AdminCustomers';
import AdminTransactions from './components/admin/AdminTransactions';
import AdminSettings from './components/admin/AdminSettings';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  useEffect(() => {
    // 1. Obter sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 2. Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        setLoading(true); // Garante loading ao trocar de conta ou logar
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data.status === 'blocked') {
        sessionStorage.setItem('auth_error', 'Sua conta está desabilitada. Por favor, entre em contato com o suporte para mais informações.');
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f4f7fb]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Carregando Atlas Swap...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuthSuccess={() => { }} />;
  }

  // Define se o usuário é administrador
  const isAdmin = profile?.role === 'admin';

  // Função para mudar de view com proteção de rota
  const handleViewChange = (view: string) => {
    const adminViews = ['customers', 'all-transactions', 'settings', 'admin-statement', 'support-inbox'];

    if (adminViews.includes(view) && !isAdmin) {
      console.warn(`Acesso negado: Usuário tentou acessar ${view} sem permissões de administrador.`);
      setCurrentView('dashboard');
      return;
    }

    setCurrentView(view as ViewType);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Passamos a role para ajustar os menus se necessário */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentView={currentView}
        onViewChange={handleViewChange}
        isAdmin={isAdmin}
      />

      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#f4f7fb]">
        <Navbar
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onProfileClick={() => handleViewChange('profile')}
          user={profile}
        />

        <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {/* Roteamento Simples Baseado no Estado */}
          {currentView === 'dashboard' && <DashboardContent isAdmin={isAdmin} userId={session.user.id} onViewChange={handleViewChange} />}
          {currentView === 'new-transaction' && <NewTransaction userId={session.user.id} />}
          {currentView === 'profile' && <Profile user={profile} onUpdate={() => fetchProfile(session.user.id)} />}

          {/* Rotas Comuns / Protegidas */}
          {currentView === 'statement' && <Statement userId={session.user.id} isAdmin={false} />}
          {currentView === 'support' && <Support />}

          {/* Rotas Exclusivas Admin com Guarda Adicional */}
          {isAdmin ? (
            <>
              {currentView === 'admin-statement' && <Statement userId={session.user.id} isAdmin={true} />}
              {currentView === 'customers' && <AdminCustomers />}
              {currentView === 'all-transactions' && <AdminTransactions />}
              {currentView === 'settings' && <AdminSettings />}
            </>
          ) : (
            // Se um não-admin cair em uma view admin, o handleViewChange já deve ter tratado, 
            // mas mantemos essa guarda como redundância de renderização.
            ['admin-statement', 'customers', 'all-transactions', 'settings'].includes(currentView) && (
              <DashboardContent isAdmin={false} userId={session.user.id} onViewChange={handleViewChange} />
            )
          )}

          {/* Fallback para views não implementadas */}
          {!['dashboard', 'new-transaction', 'profile', 'statement', 'admin-statement', 'customers', 'all-transactions', 'settings', 'support'].includes(currentView) && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-12 bg-white rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-100/50">
                <h1 className="text-4xl font-black text-indigo-600 italic mb-4">Atlas Swap</h1>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Módulo {currentView} em Desenvolvimento</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
