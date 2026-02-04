
import React, { useState, useEffect } from 'react';
import { Settings, Save, Shield, Percent, DollarSign, Bell, MessageCircle, Send, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

/**
 * Componente AdminSettings: Configurações globais do sistema.
 */
const AdminSettings: React.FC = () => {
    const [fee, setFee] = useState('1');
    const [fixedFee, setFixedFee] = useState('5');
    const [spread, setSpread] = useState('0.05');
    const [whatsapp, setWhatsapp] = useState('');
    const [telegram, setTelegram] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('settings')
                .select('*');

            if (error) throw error;

            data?.forEach(item => {
                if (item.key === 'spread') setSpread(item.value.toString());
                if (item.key === 'support_whatsapp') setWhatsapp(JSON.parse(JSON.stringify(item.value)));
                if (item.key === 'support_telegram') setTelegram(JSON.parse(JSON.stringify(item.value)));
                // Taxas ainda são estáticas ou podem ser migradas depois
            });
        } catch (err) {
            console.error('Erro ao buscar configurações:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const updates = [
                { key: 'spread', value: Number(spread) },
                { key: 'support_whatsapp', value: whatsapp },
                { key: 'support_telegram', value: telegram }
            ];

            const { error } = await supabase
                .from('settings')
                .upsert(updates);

            if (error) throw error;
            alert('Configurações salvas com sucesso!');
        } catch (err: any) {
            console.error('Erro ao salvar:', err);
            alert('Erro ao salvar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 font-bold text-indigo-600 animate-pulse uppercase tracking-widest text-xs">
                Carregando Configurações...
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight text-center sm:text-left">Configurações do Sistema</h2>
                <p className="text-gray-500 text-center sm:text-left">Ajuste taxas, cotações e parâmetros globais do Atlas Swap.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Taxas e Mercado */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                        <DollarSign size={18} className="text-indigo-600" />
                        <span>Taxas e Mercado</span>
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Taxa Variável (%)</label>
                            <div className="relative">
                                <Percent size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 font-bold transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Taxa Fixa (R$)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                                <input
                                    type="text"
                                    value={fixedFee}
                                    onChange={(e) => setFixedFee(e.target.value)}
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 font-bold transition-all outline-none"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">* Aplicada apenas em transações menores que R$ 100.</p>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Spread Desejado (Cotação USDT)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">R$</span>
                                <input
                                    type="text"
                                    value={spread}
                                    onChange={(e) => setSpread(e.target.value)}
                                    placeholder="Ex: 0.05"
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 font-bold transition-all outline-none"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">* Valor somado à cotação real do mercado.</p>
                        </div>
                    </div>
                </div>

                {/* Suporte e Comunicação */}
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                        <MessageCircle size={18} className="text-indigo-600" />
                        <span>Canais de Suporte</span>
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Link WhatsApp</label>
                            <div className="relative">
                                <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="https://wa.me/..."
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 font-semibold text-sm transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Link Telegram</label>
                            <div className="relative">
                                <Send size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={telegram}
                                    onChange={(e) => setTelegram(e.target.value)}
                                    placeholder="https://t.me/..."
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3 text-gray-800 font-semibold text-sm transition-all outline-none"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 italic">Dica Administrativa</p>
                            <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                Estes links serão exibidos para clientes que tentarem logar estando com a conta bloqueada.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center sm:justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group active:scale-95 disabled:bg-indigo-400"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                    <span>Salvar Todas as Configurações</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSettings;
