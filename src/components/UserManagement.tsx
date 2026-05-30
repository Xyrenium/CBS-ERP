import React from 'react';
import { useStore } from '../store';
import { UserCheck, UserX, UserSearch, ShieldAlert } from 'lucide-react';

export function UserManagement() {
    const { users, setUsers, currentUser } = useStore();

    if (currentUser?.role !== 'Admin') {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-center opacity-70">
                <ShieldAlert size={64} className="text-red-500 mb-6 drop-shadow-md" />
                <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-3">Unauthorized Access</h1>
                <p className="text-slate-500 font-medium">Hanya Administrator yang memiliki akses ke halaman ini.</p>
            </div>
        );
    }

    const toggleStatus = (id: string, currentStatus: string) => {
        // cannot disable self
        if (id === currentUser.id) return;
        setUsers(users.map(u => u.id === id ? { ...u, status: currentStatus === 'active' ? 'pending' : 'active' } : u));
    };

    const toggleRole = (id: string, currentRole: string) => {
        if (id === currentUser.id) return;
        setUsers(users.map(u => u.id === id ? { ...u, role: currentRole === 'Admin' ? 'Karyawan' : 'Admin' } : u));
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center no-print">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg glow-bg border border-white/50 flex items-center justify-center shadow-sm">
                        <UserSearch size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 tracking-tight glow-text leading-tight">Pengaturan User & Hak Akses</h2>
                        <p className="text-xs text-slate-500 font-medium">Approval pendaftaran & penetapan role</p>
                    </div>
                </div>
            </div>

            <div className="glow-card rounded-2xl border border-white/50 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 text-[10px] uppercase font-bold tracking-wider text-indigo-700 border-b border-indigo-100">
                                <th className="py-4 px-6 font-bold">ID / User</th>
                                <th className="py-4 px-6 font-bold">Informasi Kontak</th>
                                <th className="py-4 px-6 font-bold">Role Akses</th>
                                <th className="py-4 px-6 font-bold text-center">Status</th>
                                <th className="py-4 px-6 font-bold text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 text-sm">
                            {users.map(u => (
                                <tr key={u.id} className="hover:bg-white/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-slate-800">{u.name}</div>
                                        <div className="text-[10px] font-mono text-slate-400 mt-1">{u.id}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-slate-600">{u.email}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <select 
                                            value={u.role} 
                                            onChange={(e) => toggleRole(u.id, e.target.value)}
                                            disabled={u.id === currentUser.id}
                                            className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${u.role === 'Admin' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-indigo-300 bg-indigo-50 text-indigo-700'} ${u.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
                                        >
                                            <option value="Admin">ADMIN</option>
                                            <option value="Karyawan">KARYAWAN</option>
                                        </select>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {u.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        {u.id !== currentUser.id && (
                                            <button 
                                                onClick={() => toggleStatus(u.id, u.status)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                                            >
                                                {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                                {u.status === 'active' ? 'Nonaktifkan' : 'Approve'}
                                            </button>
                                        )}
                                        {u.id === currentUser.id && (
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Current User</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
