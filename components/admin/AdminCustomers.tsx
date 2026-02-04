
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Filter, MoreVertical, Edit, Trash2, Mail, Phone, Shield, ShieldCheck, ShieldAlert, UserX, X } from 'lucide-react';
import Badge from '../ui/Badge';
import ConfirmModal from '../ui/ConfirmModal';

/**
 * Componente AdminCustomers: Gestão dos clientes cadastrados no sistema.
 */
const AdminCustomers: React.FC = () => {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal Edit states
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: '',
        email: '',
        whatsapp: '',
        telegram: ''
    });

    // Confirm Modal state
    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'danger' | 'warning' | 'success' | 'info';
        onConfirm: () => void;
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
        onConfirm: () => { }
    });

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatWhatsApp = (value: string) => {
        if (!value) return '---';
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
        }
        return value;
    };

    const showAlert = (title: string, message: string, type: 'success' | 'danger' | 'warning' | 'info' = 'success') => {
        setConfirmConfig({
            isOpen: true,
            title,
            message,
            type,
            onConfirm: () => { }
        });
    };

    const handleEditClick = (customer: any) => {
        setSelectedCustomer(customer);
        setEditForm({
            full_name: customer.full_name || '',
            email: customer.email || '',
            whatsapp: customer.whatsapp || '',
            telegram: customer.telegram || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedCustomer) return;
        try {
            setLoading(true);
            const { error } = await supabase
                .from('profiles')
                .update(editForm)
                .eq('id', selectedCustomer.id);

            if (error) throw error;

            setCustomers(customers.map(c =>
                c.id === selectedCustomer.id ? { ...c, ...editForm } : c
            ));
            setIsEditModalOpen(false);
            showAlert('Sucesso!', 'Os dados do cliente foram atualizados com sucesso.', 'success');
        } catch (err: any) {
            console.error('Erro ao salvar edição:', err);
            showAlert('Erro!', 'Não foi possível salvar as alterações: ' + err.message, 'danger');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (userId: string) => {
        setConfirmConfig({
            isOpen: true,
            title: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja deletar este cliente? Esta ação é permanente no banco de dados de perfis.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    const { error } = await supabase
                        .from('profiles')
                        .delete()
                        .eq('id', userId);

                    if (error) throw error;

                    setCustomers(customers.filter(c => c.id !== userId));
                    showAlert('Removido!', 'O cliente foi excluído do sistema.', 'success');
                } catch (err: any) {
                    console.error('Erro ao deletar:', err);
                    showAlert('Erro!', 'Não foi possível deletar o cliente.', 'danger');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const toggleRole = (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'client' : 'admin';
        setConfirmConfig({
            isOpen: true,
            title: 'Alterar Nível de Acesso',
            message: `Deseja alterar o cargo deste usuário para ${newRole === 'admin' ? 'Administrador' : 'Cliente'}? O usuário precisará relogar.`,
            type: 'warning',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ role: newRole })
                        .eq('id', userId);

                    if (error) throw error;

                    setCustomers(customers.map(c =>
                        c.id === userId ? { ...c, role: newRole } : c
                    ));
                    showAlert('Atualizado!', `O cargo foi alterado para ${newRole}.`, 'success');
                } catch (err: any) {
                    console.error('Erro ao alternar cargo:', err);
                    showAlert('Erro!', 'Não foi possível atualizar o cargo.', 'danger');
                }
            }
        });
    };

    const toggleStatus = (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
        setConfirmConfig({
            isOpen: true,
            title: newStatus === 'blocked' ? 'Bloquear Usuário' : 'Desbloquear Usuário',
            message: newStatus === 'blocked'
                ? 'Ao bloquear, o usuário perderá acesso imediato ao sistema.'
                : 'O usuário poderá acessar o sistema novamente.',
            type: newStatus === 'blocked' ? 'danger' : 'success',
            onConfirm: async () => {
                try {
                    const { error } = await supabase
                        .from('profiles')
                        .update({ status: newStatus })
                        .eq('id', userId);

                    if (error) throw error;

                    setCustomers(customers.map(c =>
                        c.id === userId ? { ...c, status: newStatus } : c
                    ));
                    showAlert('Status Atualizado!', `Usuário ${newStatus === 'blocked' ? 'BLOQUEADO' : 'DESBLOQUEADO'} com sucesso.`, newStatus === 'blocked' ? 'danger' : 'success');
                } catch (err: any) {
                    console.error('Erro ao alternar status:', err);
                    showAlert('Erro!', 'Não foi possível atualizar o status.', 'danger');
                }
            }
        });
    };

    const filteredCustomers = customers.filter(c =>
        c.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Gestão de Clientes</h2>
                    <p className="text-gray-500 text-sm">Visualize e gerencie as contas de todos os usuários.</p>
                </div>
                <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                    Exportar Lista
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl text-sm transition-all outline-none"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-colors">
                            <Filter size={18} />
                        </button>
                        <div className="h-8 w-px bg-gray-100 mx-2"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            {filteredCustomers.length} Clientes
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Contato</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Nível / Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Desde</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                        Carregando Clientes...
                                    </td>
                                </tr>
                            ) : filteredCustomers.map((customer) => (
                                <tr key={customer.id} className={`hover:bg-indigo-50/10 transition-colors group ${customer.status === 'blocked' ? 'opacity-60 grayscale' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${customer.status === 'blocked' ? 'bg-gray-200 text-gray-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {customer.full_name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{customer.full_name}</p>
                                                <p className="text-xs text-gray-400">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center text-[10px] text-gray-500 font-bold">
                                                <Phone size={10} className="mr-1" /> {formatWhatsApp(customer.whatsapp)}
                                            </div>
                                            <div className="flex items-center text-[10px] text-gray-500 font-bold">
                                                <Mail size={10} className="mr-1" /> {customer.telegram || '---'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col space-y-1.5">
                                            <span className={`text-[9px] w-fit font-black px-2 py-0.5 rounded-lg uppercase border ${customer.role === 'admin' ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                {customer.role === 'admin' ? 'Administrador' : 'Cliente'}
                                            </span>
                                            <span className={`text-[9px] w-fit font-black px-2 py-0.5 rounded-lg uppercase border ${customer.status === 'blocked' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {customer.status === 'blocked' ? 'BLOQUEADO' : 'ATIVO'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-700">
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleRole(customer.id, customer.role)}
                                                className={`p-2 transition-colors rounded-lg ${customer.role === 'admin' ? 'text-indigo-600 hover:bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                                                title={customer.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}
                                            >
                                                <Shield size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleStatus(customer.id, customer.status)}
                                                className={`p-2 transition-colors rounded-lg ${customer.status === 'blocked' ? 'text-rose-600 hover:bg-rose-50' : 'text-gray-400 hover:text-rose-600 hover:bg-rose-100'}`}
                                                title={customer.status === 'blocked' ? 'Desbloquear Usuário' : 'Bloquear Usuário'}
                                            >
                                                {customer.status === 'blocked' ? <UserX size={16} /> : <ShieldCheck size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(customer)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors hover:bg-indigo-100 rounded-lg"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(customer.id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 transition-colors hover:bg-rose-100 rounded-lg"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Customer Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">Editar Cliente</h3>
                                <p className="text-gray-500 text-xs font-medium">Altere as informações cadastrais do usuário.</p>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={editForm.full_name}
                                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-sm font-bold transition-all outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <input
                                        type="text"
                                        value={editForm.whatsapp}
                                        onChange={(e) => {
                                            const raw = e.target.value.replace(/\D/g, '').slice(0, 11);
                                            let formatted = raw;
                                            if (raw.length > 2) formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
                                            if (raw.length > 7) formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
                                            setEditForm({ ...editForm, whatsapp: formatted });
                                        }}
                                        placeholder="(00) 00000-0000"
                                        className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telegram</label>
                                    <input
                                        type="text"
                                        value={editForm.telegram}
                                        onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                                        className="w-full bg-gray-50 border-transparent focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 rounded-xl px-4 py-3 text-sm font-bold transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-gray-50/50 flex gap-4">
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="flex-1 py-4 bg-white text-gray-500 font-bold rounded-2xl border border-gray-100 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={loading}
                                className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 disabled:bg-indigo-400"
                            >
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Confirm Modal */}
            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
                onConfirm={confirmConfig.onConfirm}
                title={confirmConfig.title}
                message={confirmConfig.message}
                type={confirmConfig.type}
                confirmText="Prosseguir"
                cancelText="Voltar"
            />
        </div>
    );
};

export default AdminCustomers;
