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
  const [newCategory, setNewCategory] = useState<'Client' | 'Supplier'>('Client');
  const [newBadanUsaha, setNewBadanUsaha] = useState<'PT' | 'CV' | 'PT Perseorangan' | 'Perorangan' | 'UD' | 'Lainnya'>('PT');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newBankAccount, setNewBankAccount] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newActive, setNewActive] = useState(true);

  const handleDelete = (id: string) => {
    if (role === 'Karyawan') return;
    if (confirm('Yakin hapus data customer/supplier?')) {
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
      category: newCategory,
      badanUsaha: newBadanUsaha,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      address: newAddress.trim(),
      active: newActive,
      notes: newNotes.trim(),
      bankAccount: newCategory === 'Supplier' ? newBankAccount.trim() : undefined
    };

    setCustomers([...customers, newCustomer]);

    // Reset Form
    setNewCategory('Client');
    setNewBadanUsaha('PT');
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewBankAccount('');
    setNewNotes('');
    setNewActive(true);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800 glow-text">Manajemen Partner (Client & Supplier)</h2>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-indigo-500/10 active:scale-95"
        >
          <Plus size={16} />
          Tambah Mitra Baru
        </button>
      </div>

      {/* Mobile Card List View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {customers.map(c => (
          <div key={c.id} className="bg-white/60 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${c.category === 'Supplier' ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'}`}>
                    {c.category || 'Client'}
                  </span>
                  <span className="text-xs font-mono text-indigo-600">ID: {c.id}</span>
                </div>
                <div className="font-bold text-slate-800 text-base mt-2">
                  {c.badanUsaha && c.badanUsaha !== 'Perorangan' ? `${c.badanUsaha}. ` : ''}{c.name}
                </div>
              </div>
              <button 
                onClick={() => toggleActive(c.id, c.active)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
              >
                {c.active ? 'Aktif' : 'Non-aktif'}
              </button>
            </div>

            <div className="text-xs space-y-2 text-slate-600 bg-white/40 p-3.5 rounded-xl border border-white/40 shadow-sm">
              <div>
                <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider">Telepon:</span>
                <span className="text-slate-800 font-medium">{c.phone || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider">Email:</span>
                <span className="text-slate-800 font-mono text-[11px] font-medium">{c.email || '-'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-400 block text-[9px] uppercase tracking-wider">Alamat:</span>
                <span className="text-slate-800 font-medium leading-relaxed">{c.address || '-'}</span>
              </div>
              {c.category === 'Supplier' && (
                <div className="pt-2 border-t border-dashed border-slate-200">
                  <span className="font-semibold text-emerald-800 block text-[9px] uppercase tracking-wider">Nomor Rekening:</span>
                  <span className="text-emerald-700 font-mono font-bold">{c.bankAccount || '-'}</span>
                </div>
              )}
              {c.notes && (
                <div className="text-[10px] text-slate-400 italic pt-1">
                  Catatan: {c.notes}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button 
                onClick={() => openHistory(c)}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 font-bold uppercase tracking-wide py-2.5 rounded-xl text-xs hover:bg-indigo-100 transition-all cursor-pointer"
              >
                <Eye size={16} />
                Riwayat Transaksi
              </button>
              {role === 'Admin' && (
                <button 
                  onClick={() => handleDelete(c.id)}
                  className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer border border-red-100"
                  title="Hapus"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        {customers.length === 0 && (
          <div className="bg-white/40 border border-white/50 rounded-2xl p-8 text-center text-slate-500 text-sm">
            Belum ada data partner bisnis
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="glow-card rounded-xl overflow-hidden hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white/60 text-indigo-700 glow-border">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Nama Rekanan / Badan Usaha</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Kontak (Telp / Email)</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Alamat Hubungan</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">No. Rekening Bank</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/40">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-white/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-800">{c.id}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.category === 'Supplier' ? 'bg-teal-100 text-teal-800 border border-teal-200' : 'bg-indigo-100 text-indigo-800 border border-indigo-200'}`}>
                      {c.category || 'Client'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">
                      {c.badanUsaha && c.badanUsaha !== 'Perorangan' ? `${c.badanUsaha}. ` : ''}{c.name}
                    </div>
                    {c.notes && <div className="text-[10px] text-slate-400 font-medium italic mt-0.5">{c.notes}</div>}
                  </td>
                  <td className="px-6 py-4 text-xs space-y-1">
                    <div className="font-bold text-slate-800">{c.phone || '-'}</div>
                    <div className="text-indigo-600 font-mono text-[10px]">{c.email || '-'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate font-medium text-slate-700" title={c.address}>
                    {c.address || '-'}
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-teal-700">
                    {c.category === 'Supplier' ? (c.bankAccount || <span className="text-slate-400 font-normal">-</span>) : <span className="text-slate-400 font-normal">-</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleActive(c.id, c.active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold glow-border transition-all ${c.active ? 'bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30' : 'bg-slate-500/20 text-slate-500 hover:bg-slate-500/30'}`}
                    >
                      {c.active ? 'Aktif' : 'Non-aktif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex items-center justify-end space-x-2 mt-1">
                    <button onClick={() => openHistory(c)} className="p-2 text-indigo-700 hover:bg-indigo-100/80 rounded-lg transition-colors glow-text" title="Riwayat">
                      <Eye size={18} />
                    </button>
                    {role === 'Admin' && (
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="Hapus">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 font-bold">Belum ada data customer / supplier</td>
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
              <h3 className="text-xl font-bold text-slate-800 glow-text">Riwayat Transaksi: {activeCustomer.badanUsaha && activeCustomer.badanUsaha !== 'Perorangan' ? `${activeCustomer.badanUsaha}. ` : ''}{activeCustomer.name}</h3>
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

      {/* Add Customer/Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glow-card rounded-2xl w-full max-w-lg overflow-hidden flex flex-col glow-border max-h-[90vh]">
            <div className="p-6 border-b border-indigo-100 flex justify-between items-center bg-white/60 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 glow-text">Tambah Mitra Bisnis Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
                className="text-slate-400 hover:text-slate-800 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4 bg-white/60 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-750 uppercase tracking-wider mb-1.5">Kategori Rekanan</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-205 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-bold text-slate-800 shadow-sm outline-none"
                  >
                    <option value="Client">CLIENT</option>
                    <option value="Supplier">SUPPLIER</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-750 uppercase tracking-wider mb-1.5">Badan Usaha</label>
                  <select
                    value={newBadanUsaha}
                    onChange={e => setNewBadanUsaha(e.target.value as any)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-205 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-bold text-slate-800 shadow-sm outline-none"
                  >
                    <option value="PT">PT</option>
                    <option value="CV">CV</option>
                    <option value="PT Perseorangan">PT Perseorangan</option>
                    <option value="Perorangan">Perorangan (Individu)</option>
                    <option value="UD">UD</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Nama Perusahaan / Personal</label>
                <input 
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                  placeholder="Contoh: Samudra Indah Abadi (jangan ketik PT/CV di sini)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Nomor Telepon</label>
                  <input 
                    type="text"
                    required
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm font-mono"
                    placeholder="Contoh: 021-5550293 atau 0812..."
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Email Perusahaan / Kontak</label>
                  <input 
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm font-mono"
                    placeholder="Contoh: admin@perusahaan.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Alamat Lengkap</label>
                <textarea 
                  required
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm h-16 resize-none"
                  placeholder="Tuliskan nama jalan, blok, nomor, kota & kode pos..."
                />
              </div>

              {newCategory === 'Supplier' && (
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-150 space-y-2 animate-in fade-in duration-200">
                  <label className="block text-[10px] font-bold text-teal-800 uppercase tracking-wider mb-1">Nomor Rekening Bank (Kewajiban Supplier)</label>
                  <input 
                    type="text"
                    required={newCategory === 'Supplier'}
                    value={newBankAccount}
                    onChange={e => setNewBankAccount(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-teal-200 rounded-xl text-xs focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 transition-all font-bold text-slate-800 shadow-sm font-mono"
                    placeholder="Contoh: BCA 8812-345-678 an PT Samudra Indah"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-indigo-750 uppercase tracking-wider mb-1.5">Catatan Tambahan (Notes)</label>
                <textarea 
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm h-12 resize-none"
                  placeholder="Keterangan tempo, prioritas, or komitmen..."
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
                  Set Sebagai Mitra Kerja Aktif (Bisa Transaksi)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-505 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md active:scale-95 transition-all"
                >
                  Simpan Kontak Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
