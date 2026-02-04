
import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Shield, Save, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: any;
  onUpdate?: () => void;
}

/**
 * Componente Profile: Gerenciamento de dados cadastrais do usuário.
 * Permite visualizar e editar informações salvando no Supabase.
 */
const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [telegram, setTelegram] = useState(user?.telegram || '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          whatsapp,
          telegram,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Meu Perfil</h2>
        <p className="text-gray-500">Gerencie suas informações pessoais e de contato.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* Banner Superior */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-900 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-[2rem] shadow-lg">
            <div className="w-24 h-24 bg-gray-50 rounded-[1.8rem] flex items-center justify-center text-indigo-600">
              <User size={48} />
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8 space-y-8">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-50/50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail (Login)</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="w-full bg-gray-50 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
              <div className="relative">
                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+55 (00) 00000-0000"
                  className="w-full bg-gray-50/50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Telegram @username</label>
              <div className="relative">
                <MessageSquare size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="@usuario"
                  className="w-full bg-gray-50/50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-800 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl flex items-start space-x-3">
            <Shield size={20} className="text-indigo-600 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-indigo-900">Nível de Acesso: {user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
              <p className="text-xs text-indigo-700 opacity-70">A sua conta possui proteções avançadas e os dados são mantidos em ambiente seguro e criptografado.</p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex items-center space-x-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${saved ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
                }`}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : saved ? <CheckCircle size={18} /> : <Save size={18} />}
              <span>{saved ? 'Perfil Atualizado!' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
