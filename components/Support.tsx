import React from 'react';
import { MessageCircle, Send, ShieldCheck, Clock, LifeBuoy, UserCheck } from 'lucide-react';

const Support: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-indigo-50">
                    <LifeBuoy size={40} className="animate-pulse" />
                </div>
                <h2 className="text-4xl font-black text-gray-800 tracking-tight">Como podemos ajudar?</h2>
                <p className="text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                    Nossa equipe de especialistas está pronta para te atender.
                    Escolha o seu canal de preferência e tire suas dúvidas em tempo real.
                </p>
            </div>

            {/* Support Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* WhatsApp Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all group border-b-4 border-b-emerald-500">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <MessageCircle size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">WhatsApp</h3>
                    <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                        Atendimento rápido e direto para dúvidas sobre seus swaps e depósitos.
                    </p>
                    <a
                        href="https://wa.me/seunumeroaqui"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-emerald-200 transition-all active:scale-[0.98]"
                    >
                        <MessageCircle size={20} />
                        <span>Suporte Via WhatsApp</span>
                    </a>
                </div>

                {/* Telegram Card */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:shadow-sky-100/50 transition-all group border-b-4 border-b-sky-500">
                    <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Send size={28} />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-2">Telegram</h3>
                    <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                        Comunidade ativa e suporte especializado 24/7 através do nosso canal oficial.
                    </p>
                    <a
                        href="https://t.me/seuchat"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-black rounded-2xl flex items-center justify-center space-x-3 shadow-lg shadow-sky-200 transition-all active:scale-[0.98]"
                    >
                        <Send size={20} />
                        <span>Suporte Via Telegram</span>
                    </a>
                </div>
            </div>

            {/* Extra Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <ShieldCheck size={24} className="text-indigo-500 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">SEGURANÇA</p>
                    <p className="text-xs font-bold text-gray-700">Dados Criptografados</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <Clock size={24} className="text-indigo-500 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">VELOCIDADE</p>
                    <p className="text-xs font-bold text-gray-700">Resposta em Minutos</p>
                </div>
                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
                    <UserCheck size={24} className="text-indigo-500 mb-2" />
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">ATENDIMENTO</p>
                    <p className="text-xs font-bold text-gray-700">Humano e Ágil</p>
                </div>
            </div>
        </div>
    );
};

export default Support;
