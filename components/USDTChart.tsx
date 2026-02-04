import React, { useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';

/**
 * Componente USDTChart: Exibe o gráfico do USDT em tempo real usando o Widget do TradingView.
 * Substitui o antigo RevenueForecast.
 */
const USDTChart: React.FC = () => {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            "autosize": true,
            "symbol": "BINANCE:USDTBRL",
            "interval": "D",
            "timezone": "Etc/UTC",
            "theme": "light",
            "style": "3",
            "locale": "br",
            "enable_publishing": false,
            "hide_top_toolbar": true,
            "hide_legend": true,
            "save_image": false,
            "calendar": false,
            "hide_volume": true,
            "support_host": "https://www.tradingview.com"
        });

        if (container.current) {
            container.current.innerHTML = "";
            container.current.appendChild(script);
        }
    }, []);

    return (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col min-h-[450px]">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 italic">Cotação USDT/BRL</h3>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest text-[10px]">Mercado em Tempo Real</p>
                    </div>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-tighter animate-pulse">
                    Live Data
                </div>
            </div>

            <div className="flex-1 w-full overflow-hidden rounded-2xl border border-gray-50">
                <div className="tradingview-widget-container h-full w-full" ref={container}>
                    <div className="tradingview-widget-container__widget h-full w-full"></div>
                </div>
            </div>
        </div>
    );
};

export default USDTChart;
