
import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface WelcomeCardProps {
  userId: string;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userId }) => {
  const [profile, setProfile] = useState<any>(null);
  const [volume, setVolume] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Buscar Perfil
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .single();

        setProfile(profileData);

        // 2. Buscar Volume Total (Transações Concluídas)
        const { data: txData } = await supabase
          .from('transactions')
          .select('amount_depix')
          .eq('user_id', userId)
          .eq('status', 'completed');

        if (txData) {
          const totalVolume = txData.reduce((acc, tx) => acc + (tx.amount_depix || 0), 0);
          setVolume(totalVolume);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do card de boas-vindas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="relative h-full bg-indigo-600 rounded-[2rem] p-8 text-white flex items-center justify-center overflow-hidden shadow-xl shadow-indigo-200">
        <Loader2 className="w-8 h-8 animate-spin opacity-50" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Usuário';

  return (
    <div className="relative h-full bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-[2rem] p-8 text-white flex flex-col justify-between overflow-hidden shadow-xl shadow-indigo-200">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 border-[40px] border-white/5 rounded-full -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-[20px] border-white/5 rounded-full mr-12 mb-12"></div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-2">Bem-vindo de volta, {firstName}!</h2>
        <p className="text-indigo-100/80 text-sm">Veja o que está acontecendo hoje.</p>
      </div>

      <div className="relative z-10 mt-auto">
        <p className="text-indigo-200/70 text-sm mb-1 uppercase tracking-wider font-semibold">Volume Total</p>
        <div className="flex items-end space-x-3">
          <h3 className="text-4xl font-bold">R$ {volume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
          <div className="flex items-center text-xs font-medium text-indigo-100 bg-white/10 px-2 py-1 rounded-lg mb-1.5">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Live
          </div>
        </div>
      </div>

      {/* Abstract concentric circle graphic */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
        <div className="w-32 h-32 rounded-full border-4 border-white/30 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-white/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full border-4 border-white/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;
