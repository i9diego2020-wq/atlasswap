
import React from 'react';
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';

interface BadgeProps {
    status: 'completed' | 'pending' | 'failed' | string;
    label?: string;
}

/**
 * Componente Badge: Exibe status com cores e ícones padronizados
 */
const Badge: React.FC<BadgeProps> = ({ status, label }) => {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'confirmed_depix':
                return {
                    style: 'bg-blue-50 text-blue-600 border-blue-100',
                    icon: <CheckCircle2 size={12} className="mr-1" />,
                    label: label || 'DePix Confirmado'
                };
            case 'usdt_sending':
                return {
                    style: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                    icon: <Loader2 size={12} className="mr-1 animate-spin" />,
                    label: label || 'Enviando USDT'
                };
            case 'usdt_sent':
                return {
                    style: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                    icon: <CheckCircle2 size={12} className="mr-1" />,
                    label: label || 'USDT Enviado'
                };
            case 'completed':
                return {
                    style: 'bg-emerald-500 text-white border-emerald-600',
                    icon: <CheckCircle2 size={12} className="mr-1" />,
                    label: label || 'Concluído'
                };
            case 'pending':
                return {
                    style: 'bg-amber-50 text-amber-600 border-amber-100',
                    icon: <Clock size={12} className="mr-1" />,
                    label: label || 'Pendente'
                };
            case 'failed':
                return {
                    style: 'bg-rose-50 text-rose-600 border-rose-100',
                    icon: <XCircle size={12} className="mr-1" />,
                    label: label || 'Falhou'
                };
            default:
                return {
                    style: 'bg-gray-50 text-gray-600 border-gray-100',
                    icon: null,
                    label: label || status
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.style}`}>
            {config.icon}
            {config.label}
        </div>
    );
};

export default Badge;
