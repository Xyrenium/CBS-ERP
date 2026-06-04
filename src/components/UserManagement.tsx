import React from 'react';
import { useStore } from '../store';
import { UserCheck, UserX, UserSearch, ShieldAlert, Key } from 'lucide-react';

export function UserManagement() {
    const { users, setUsers, currentUser } = useStore();
    const [editingUser, setEditingUser] = React.useState<any | null>(null);
    const [newPasswordVal, setNewPasswordVal] = React.useState('');

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

    const handleAdminChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser || !newPasswordVal.trim()) return;

        setUsers(users.map(u => u.id === editingUser.id ? { ...u, password: newPasswordVal.trim() } : u));
        setEditingUser(null);
        setNewPasswordVal('');
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

            {/* Responsive Card List for Mobile */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {users.map(u => (
                <div key={u.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800 text-base">{u.name}</div>
                      <div className="text-xs font-mono text-indigo-600 mt-1">ID: {u.id}</div>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/40 p-3 rounded-xl border border-white/40 shadow-sm text-xs">
                    <span className="font-semibold text-slate-500">Role Akses:</span>
                    <select 
                      value={u.role} 
                      onChange={(e) => toggleRole(u.id, e.target.value)}
                      disabled={u.id === currentUser.id}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border ${u.role === 'Admin' ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-indigo-300 bg-indigo-50 text-indigo-700'} ${u.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <option value="Admin">ADMIN</option>
                      <option value="Karyawan">KARYAWAN</option>
                    </select>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {u.id !== currentUser.id && (
                      <>
                        <button 
                          onClick={() => toggleStatus(u.id, u.status)}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm cursor-pointer ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                        >
                          {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                          {u.status === 'active' ? 'Nonaktifkan' : 'Approve'}
                        </button>

                        <button 
                          onClick={() => setEditingUser(u)}
                          className="flex items-center justify-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-200 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors hover:bg-indigo-100 cursor-pointer"
                        >
                          <Key size={14} />
                          Ubah Pwd
                        </button>
                      </>
                    )}
                    {u.id === currentUser.id && (
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider w-full text-center py-1">Current User</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="glow-card rounded-2xl border border-white/50 overflow-hidden shadow-sm hidden md:block">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/40 text-[10px] uppercase font-bold tracking-wider text-indigo-700 border-b border-indigo-100">
                                <th className="py-4 px-6 font-bold">ID / User</th>
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
                                        <div className="flex justify-center items-center gap-2">
                                            {u.id !== currentUser.id && (
                                                <>
                                                    <button 
                                                        onClick={() => toggleStatus(u.id, u.status)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors shadow-sm ${u.status === 'active' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}
                                                    >
                                                        {u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                                                        {u.status === 'active' ? 'Nonaktifkan' : 'Approve'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setEditingUser(u)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 shadow-sm"
                                                    >
                                                        <Key size={14} />
                                                        Ubah Pwd
                                                    </button>
                                                </>
                                            )}
                                            {u.id === currentUser.id && (
                                                <span className="text-[10px] text-slate-400 font-bold uppercase">Current User</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Admin Edit Password Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="glow-card rounded-2xl w-full max-w-md overflow-hidden flex flex-col glow-border">
                        <div className="p-6 border-b border-indigo-100 flex justify-between items-center bg-white/60">
                            <h3 className="text-lg font-bold text-slate-800 glow-text">Ubah Password User</h3>
                            <button 
                                onClick={() => setEditingUser(null)} 
                                className="text-slate-400 hover:text-slate-800 font-bold text-xl leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleAdminChangePassword} className="p-6 space-y-4 bg-white/60">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama User</label>
                                <div className="text-sm font-bold text-slate-800">{editingUser.name} ({editingUser.id})</div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Password Baru</label>
                                <input 
                                    type="text"
                                    required
                                    value={newPasswordVal}
                                    onChange={e => setNewPasswordVal(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                                    placeholder="Masukkan password baru"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-indigo-50/50">
                                <button 
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit"
                                    className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-md transition-all active:scale-95"
                                >
                                    Simpan Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
