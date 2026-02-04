
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, User, Phone, Send, Shield, ArrowRight, Loader2, AlertCircle, MessageCircle } from 'lucide-react';

interface AuthProps {
    onAuthSuccess: () => void;
}

/**
 * Componente Auth: Gerencia Login e Cadastro de usuários.
 * Integrado com Supabase Auth e Banco de Dados (tabela profiles).
 */
const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [supportLinks, setSupportLinks] = useState({ whatsapp: '', telegram: '' });

    // Estados do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [telegram, setTelegram] = useState('');

    React.useEffect(() => {
        fetchSupportLinks();
        // Verificar se há erro de bloqueio vindo do App.tsx
        const lastError = sessionStorage.getItem('auth_error');
        if (lastError) {
            setError(lastError);
            sessionStorage.removeItem('auth_error');
        }
    }, []);

    const fetchSupportLinks = async () => {
        try {
            const { data } = await supabase.from('settings').select('*').in('key', ['support_whatsapp', 'support_telegram']);
            const links = { whatsapp: '', telegram: '' };
            data?.forEach(item => {
                if (item.key === 'support_whatsapp') links.whatsapp = item.value;
                if (item.key === 'support_telegram') links.telegram = item.value;
            });
            setSupportLinks(links);
        } catch (err) {
            console.error('Erro ao buscar links de suporte:', err);
        }
    };

    /**
     * Executa o Login
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            if (authData.user) {
                // Verificar status do perfil
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('status')
                    .eq('id', authData.user.id)
                    .single();

                if (profileError) throw profileError;

                if (profileData.status === 'blocked') {
                    await supabase.auth.signOut();
                    setError('Sua conta está bloqueada. Por favor, entre em contato com o suporte para mais informações.');
                    setLoading(false);
                    return;
                }
            }

            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Executa o Registro
     */
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            setLoading(false);
            return;
        }

        try {
            // 1. Criar usuário no Auth do Supabase (Trigger cuidará do perfil)
            const { data, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (authError) throw authError;

            if (data.user) {
                // Como a confirmação de e-mail está desativada no Supabase, 
                // o signUp já loga o usuário e cria a sessão.
                // O trigger cuidará do perfil.
                onAuthSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="w-full max-w-[450px] animate-in fade-in zoom-in duration-500">
                {/* Logo/Brand */}
                <div className="flex items-center justify-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-indigo-200">
                        A
                    </div>
                    <span className="text-3xl font-black text-gray-800 tracking-tight">Atlas Swap</span>
                </div>

                {/* Auth Card */}
                <div className="bg-white/80 backdrop-blur-xl border border-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            {isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}
                        </h2>
                        <p className="text-gray-500 text-sm mb-8">
                            {isLogin ? 'Entre com sua conta para continuar.' : 'Preencha os dados para começar agora.'}
                        </p>

                        {error && (
                            <div className={`mb-6 p-4 rounded-2xl flex flex-col space-y-3 text-sm font-medium animate-in slide-in-from-top-2 bg-rose-50 text-rose-600 border border-rose-100`}>
                                <div className="flex items-start space-x-3">
                                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                                {(error.includes('bloqueada') || error.includes('desabilitada')) && (
                                    <div className="flex flex-col sm:flex-row gap-2 mt-2">
                                        {supportLinks.whatsapp && (
                                            <a
                                                href={supportLinks.whatsapp.replace(/^"|"$/g, '')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-center text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center space-x-2"
                                            >
                                                <MessageCircle size={14} />
                                                <span>WhatsApp</span>
                                            </a>
                                        )}
                                        {supportLinks.telegram && (
                                            <a
                                                href={supportLinks.telegram.replace(/^"|"$/g, '')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-xl text-center text-xs font-bold hover:bg-rose-100 transition-colors flex items-center justify-center space-x-2"
                                            >
                                                <Send size={14} />
                                                <span>Telegram</span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nome Completo</label>
                                    <div className="relative">
                                        <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            placeholder="Ex: David Silva"
                                            className="w-full bg-gray-50/50 border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-800 font-semibold transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@exemplo.com"
                                        className="w-full bg-gray-50/50 border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-800 font-semibold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">WhatsApp</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={whatsapp}
                                                onChange={(e) => setWhatsapp(e.target.value)}
                                                placeholder="(00) 00000-0000"
                                                className="w-full bg-gray-50/50 border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-800 font-semibold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Telegram</label>
                                        <div className="relative">
                                            <Send size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                value={telegram}
                                                onChange={(e) => setTelegram(e.target.value)}
                                                placeholder="@usuario"
                                                className="w-full bg-gray-50/50 border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-800 font-semibold transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Senha</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        required
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50/50 border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-800 font-semibold transition-all outline-none"
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirmar Senha</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            required
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-gray-50/50 border-gray-100 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl pl-11 pr-4 py-3.5 text-gray-800 font-semibold transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center space-x-2 group active:scale-[0.98] mt-6"
                            >
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        <span>{isLogin ? 'Entrar no Sistema' : 'Criar minha Conta'}</span>
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="w-full mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                            {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre agora'}
                        </button>
                    </div>

                    {/* Decorative gradients */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
