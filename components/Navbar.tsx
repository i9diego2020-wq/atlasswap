
import React, { useState, useEffect, useRef } from 'react';
import { Moon, Bell, Menu, User, LogOut, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  toggleSidebar: () => void;
  onProfileClick: () => void;
  user?: any;
}

/**
 * Componente Navbar: Barra superior com ticker de cotações, notificações e menu de usuário.
 */
const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, onProfileClick, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tickerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Limpa o container antes de injetar o script para evitar duplicações
    if (tickerContainerRef.current) {
      tickerContainerRef.current.innerHTML = "";
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          { "proName": "FX_IDC:USDBRL", "title": "Dólar" },
          { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
          { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" },
          { "proName": "BINANCE:USDTBRL", "title": "USDT" },
          { "proName": "BINANCE:SOLUSD", "title": "Solana" }
        ],
        "showSymbolLogo": true,
        "colorTheme": "light",
        "isTransparent": false,
        "displayMode": "regular",
        "width": "100%",
        "height": 46,
        "locale": "br"
      });
      tickerContainerRef.current.appendChild(script);
    }
  }, []);

  const handleProfileClick = () => {
    onProfileClick();
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center shrink-0">
        <button onClick={toggleSidebar} className="p-2 mr-4 text-gray-400 hover:bg-gray-50 rounded-lg lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* TradingView Ticker Tape Wrapper */}
      <div className="flex-1 mx-4 overflow-hidden h-10 flex items-center">
        <div ref={tickerContainerRef} className="tradingview-widget-container w-full h-full">
          <div className="tradingview-widget-container__widget w-full h-full"></div>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4 shrink-0">
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Moon className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-2"></div>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`flex items-center cursor-pointer group p-1 pr-3 rounded-full transition-all border ${isMenuOpen ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-indigo-50 border-transparent hover:border-indigo-100'}`}
          >
            <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent group-hover:ring-indigo-200 transition-all">
              <img src="https://picsum.photos/seed/john/200" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="ml-3 hidden sm:block text-left">
              <p className="text-sm font-semibold text-gray-800 leading-tight group-hover:text-indigo-600 transition-colors">
                {user?.full_name || 'Usuário'}
              </p>
              <p className="text-[11px] text-gray-500 uppercase font-bold tracking-tighter">
                {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </p>
            </div>
            <ChevronDown className={`ml-2 w-4 h-4 text-gray-400 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)}></div>

              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl shadow-indigo-100 border border-gray-100 py-2 z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-2 border-b border-gray-50 mb-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conta</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4 mr-3 text-indigo-500" />
                  <span className="font-semibold">Meu Perfil</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2.5 text-sm text-pink-600 hover:bg-pink-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  <span className="font-semibold">Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
