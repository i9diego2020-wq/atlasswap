
import React, { useState, useEffect } from 'react';
import { deriveLiquidAddress, monitorAddress } from '../lib/liquid';
import { QRCodeSVG } from 'qrcode.react';
import { Clipboard, RefreshCw, CheckCircle, Database, AlertTriangle } from 'lucide-react';

const LiquidTest: React.FC = () => {
    const [addressInfo, setAddressInfo] = useState<any>(null);
    const [monitoringStatus, setMonitoringStatus] = useState<any>(null);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [lastCheck, setLastCheck] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Logs de Ciclo de Vida
    useEffect(() => {
        console.log("[LiquidTest] Componente montado.");
    }, []);

    const generateTestAddress = () => {
        try {
            setError(null);
            console.log("[LiquidTest] Iniciando geração de endereço...");
            const info = deriveLiquidAddress(0);
            console.log("[LiquidTest] Endereço gerado com sucesso:", info.address);
            setAddressInfo(info);
            setMonitoringStatus(null);
        } catch (err: any) {
            console.error("[LiquidTest] Erro ao gerar endereço:", err);
            setError(err.message || "Erro desconhecido na geração");
        }
    };

    const checkPayment = async () => {
        if (!addressInfo) return;
        try {
            setIsMonitoring(true);
            const status = await monitorAddress(addressInfo.address);
            setMonitoringStatus(status);
            setLastCheck(new Date().toLocaleTimeString());
        } catch (err: any) {
            console.error("[LiquidTest] Erro no monitoramento:", err);
        } finally {
            setIsMonitoring(false);
        }
    };

    useEffect(() => {
        let interval: any;
        if (addressInfo) {
            checkPayment();
            interval = setInterval(checkPayment, 30000);
        }
        return () => clearInterval(interval);
    }, [addressInfo?.address]);

    // Error Boundary Simples (Render-time)
    if (error) {
        return (
            <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2rem] text-rose-600">
                <div className="flex items-center space-x-2 mb-4">
                    <AlertTriangle size={24} />
                    <h2 className="text-xl font-bold">Erro Crítico na Liquid</h2>
                </div>
                <p className="font-mono text-sm bg-white/50 p-4 rounded-xl">{error}</p>
                <button
                    onClick={() => setError(null)}
                    className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-100/50">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-black text-gray-800">Liquid Network - Modo de Teste</h2>
                        <p className="text-gray-500 text-sm">Validação de Descriptor e Monitoramento Esplora</p>
                    </div>
                    <button
                        onClick={generateTestAddress}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center space-x-2"
                    >
                        <RefreshCw size={18} />
                        <span>Gerar Endereço</span>
                    </button>
                </div>

                {!addressInfo ? (
                    <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[2rem]">
                        <p className="text-gray-400 font-medium">Clique no botão acima para iniciar o teste</p>
                        <p className="text-[10px] text-gray-300 mt-2">Consulte o console do navegador para logs detalhados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-2">Endereço Confidencial (Liquid)</p>
                                <div className="flex items-center space-x-2">
                                    <code className="text-xs text-gray-700 break-all font-mono font-bold">{addressInfo.address}</code>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(addressInfo.address)}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Clipboard size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Chave de Blindagem (Private)</p>
                                <code className="text-[10px] text-gray-400 break-all font-mono">{addressInfo.blindingPrivateKey}</code>
                            </div>

                            <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Database size={16} className="text-emerald-600" />
                                        <span className="text-sm font-bold text-emerald-800 uppercase tracking-tight">Status do Monitoramento</span>
                                    </div>
                                    {isMonitoring && <RefreshCw size={14} className="animate-spin text-emerald-600" />}
                                </div>

                                {monitoringStatus?.received ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-2 text-emerald-700">
                                            <CheckCircle size={18} />
                                            <span className="font-bold">Pagamento Detectado!</span>
                                        </div>
                                        <div className="bg-white/50 p-4 rounded-xl border border-emerald-200">
                                            <p className="text-[10px] text-emerald-600 uppercase font-bold">TXID</p>
                                            <p className="text-xs font-mono break-all text-emerald-900">{monitoringStatus.txid}</p>
                                            <div className="flex justify-between mt-2">
                                                <div>
                                                    <p className="text-[10px] text-emerald-600 uppercase font-bold">Confirmações</p>
                                                    <p className="text-xs font-black text-emerald-900">{monitoringStatus.confirmations}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] text-emerald-600 uppercase font-bold">Valor</p>
                                                    <p className="text-xs font-black text-emerald-900">{monitoringStatus.value || 'Blindado'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-emerald-700/60 font-medium text-sm">
                                        Aguardando depósito... (Última checagem: {lastCheck || 'N/A'})
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="p-6 bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100/50">
                                <QRCodeSVG value={`liquidnetwork:${addressInfo.address}`} size={200} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LiquidTest;
