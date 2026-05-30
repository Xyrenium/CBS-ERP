import React, { useState } from 'react';
import { useStore } from '../store';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Customer } from '../types';

export function CustomerManagement() {
  const { customers, setCustomers, role, sales } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);

  // Form states for adding customer
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newActive, setNewActive] = useState(true);

  const handleDelete = (id: string) => {
    if (role === 'Karyawan') return;
    if (confirm('Yakin hapus data customer?')) {
      setCustomers(customers.filter(c => c.id !== id));
    }
  };

  const toggleActive = (id: string, active: boolean) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, active: !active } : c));
  };

  const openHistory = (customer: Customer) => {
    setActiveCustomer(customer);
    setShowModal(true);
  };

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let index = customers.length + 1;
    while (customers.some(c => c.id === `C${String(index).padStart(3, '0')}`)) {
      index++;
    }
    const newId = `C${String(index).padStart(3, '0')}`;

    const newCustomer: Customer = {
      id: newId,
      name: newName.trim(),
      phone: newPhone.trim(),
      active: newActive,
      notes: newNotes.trim()
    };

    setCustomers([...customers, newCustomer]);

    // Reset Form
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setNewActive(true);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800 glow-text">Manajemen Customer</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-500/10 active:scale-95"
        >
          <Plus size={16} />
          Tambah Customer
        </button>
      </div>

      <div className="glow-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white/60 text-indigo-700 glow-border">
              <tr>
                <th className="px-6 py-4 font-semibold">ID</th>
                <th className="px-6 py-4 font-semibold">Nama Perusahaan</th>
                <th className="px-6 py-4 font-semibold">Telepon</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{c.id}</td>
                  <td className="px-6 py-4">{c.name}</td>
                  <td className="px-6 py-4">{c.phone}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => toggleActive(c.id, c.active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold glow-border ${c.active ? 'bg-emerald-500/20 text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]' : 'bg-slate-500/20 text-slate-400'}`}
                    >
                      {c.active ? 'Aktif' : 'Non-aktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex justify-end space-x-2">
                    <button onClick={() => openHistory(c)} className="p-2 text-indigo-700 hover:bg-indigo-100/80 rounded-lg transition-colors glow-text" title="Riwayat">
                      <Eye size={18} />
                    </button>
                    {role === 'Admin' && (
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Belum ada data customer</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {showModal && activeCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glow-card rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col glow-border">
            <div className="p-6 border-b border-white/50 flex justify-between items-center bg-white/60">
              <h3 className="text-xl font-bold text-slate-800 glow-text">Riwayat Transaksi: {activeCustomer.name}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-800 font-bold text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-white/60">
                <div className="space-y-4">
                    {sales.filter(s => s.customerId === activeCustomer.id).length === 0 ? (
                        <p className="text-center text-slate-500 py-8">Belum ada riwayat transaksi.</p>
                    ) : (
                        sales.filter(s => s.customerId === activeCustomer.id).map(sale => (
                            <div key={sale.id} className="p-4 bg-white/60 border border-white/50 rounded-lg hover:border-white/50 transition-colors shadow-[0_0_10px_rgba(0,229,255,0.05)] text-slate-600">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-slate-800">{sale.id}</span>
                                    <span className="text-sm text-slate-400">{sale.date}</span>
                                </div>
                                <div className="text-sm text-slate-400 mb-2">Item: {sale.items.length}</div>
                                <div className="text-right font-bold text-emerald-700 glow-text-purple">Rp {sale.total.toLocaleString('id-ID')}</div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="p-6 border-t border-white/50 bg-white/60 flex justify-end">
              <button 
                onClick={() => setShowModal(false)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-colors text-xs uppercase tracking-wider"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glow-card rounded-2xl w-full max-w-md overflow-hidden flex flex-col glow-border max-h-[90vh]">
            <div className="p-6 border-b border-white/50 flex justify-between items-center bg-white/60 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 glow-text">Tambah Customer Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-800 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4 bg-white/60 overflow-y-auto flex-1">
              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Nama Perusahaan / Personal</label>
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                  placeholder="Contoh: PT. Samudra Indah"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Nomor Telepon</label>
                <input 
                  type="text"
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                  placeholder="Contoh: 0812XXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Catatan (Notes)</label>
                <textarea 
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/50 border border-white/60 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm h-20 resize-none"
                  placeholder="Contoh: Klien VIP, Pengiriman Express"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox"
                  id="activeToggle"
                  checked={newActive}
                  onChange={e => setNewActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 transition-colors cursor-pointer"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  Set Sebagai Customer Aktif
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/50">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-md shadow-indigo-500/10 active:scale-95 transition-all"
                >
                  Simpan Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
