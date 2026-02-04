
import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'success' | 'info';
    confirmText?: string;
    cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'warning',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: 'bg-rose-50 text-rose-600 border-rose-100 ring-rose-500/10',
        warning: 'bg-amber-50 text-amber-600 border-amber-100 ring-amber-500/10',
        success: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/10',
        info: 'bg-indigo-50 text-indigo-600 border-indigo-100 ring-indigo-500/10'
    };

    const btnColors = {
        danger: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
        warning: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
        success: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
        info: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
    };

    const Icon = type === 'success' ? CheckCircle2 : AlertCircle;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-3xl ${colors[type]} border mx-auto flex items-center justify-center mb-6 ring-8`}>
                        <Icon size={32} />
                    </div>

                    <h3 className="text-xl font-black text-gray-800 tracking-tight mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm font-medium leading-relaxed px-2">
                        {message}
                    </p>
                </div>

                <div className="p-6 bg-gray-50/50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all active:scale-95 text-sm"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 py-3.5 ${btnColors[type]} text-white font-bold rounded-2xl shadow-xl transition-all active:scale-95 text-sm`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
