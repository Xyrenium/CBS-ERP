import React, { useState } from 'react';
import { useStore } from '../store';
import { PackageSearch, Filter, Trash2, Plus } from 'lucide-react';
import { Product } from '../types';

export function ProductManagement() {
  const { products, setProducts, role } = useStore();
  const [filter, setFilter] = useState('All');
  
  const categories = [
    'All',
    'Pipa hitam seamless',
    'Pipa galvanis spindo',
    'Mur baut',
    'Alat tulis kantor',
    'Aksesoris pipa carbon steel',
    'Betonneser',
    'Besi persegi empat',
    'Alat navigasi',
    'Aksesoris jangkar dan jangkar kapal',
    'Mesin tempel',
    'Alat keselamatan kapal',
    'Valves',
    'Mesin induk kapal',
    'Mesin bantu kapal',
    'Wire roope'
  ];
  
  const filteredProducts = filter === 'All' ? products : products.filter(p => p.category === filter);

  const [schema, setSchema] = useState<Product>({ 
    id: '', 
    name: '', 
    description: '',
    category: 'Pipa hitam seamless', 
    unitCategory: '',
    basicUnit: '',
    stock: 0, 
    minStock: 0, 
    buyPrice: 0, 
    sellPrice: 0 
  });

  const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      if(!schema.id || !schema.name) return;
      setProducts([...products, schema]);
      setSchema({ 
        id: '', 
        name: '', 
        description: '',
        category: 'Pipa hitam seamless', 
        unitCategory: '',
        basicUnit: '',
        stock: 0, 
        minStock: 0, 
        buyPrice: 0, 
        sellPrice: 0 
      });
  };

  const handleDelete = (id: string) => {
    if (role === 'Karyawan') return;
    if (confirm('Yakin hapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-2">
        <div>
            <h2 className="text-xl font-bold text-slate-800 glow-text">Master Data Produk</h2>
            <p className="text-xs text-indigo-700 mt-1 opacity-80">Manajemen inventory dan harga</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-white/60 rounded-full glow-border p-1 px-3">
          <Filter size={14} className="text-indigo-700" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none text-xs font-bold text-indigo-700 outline-none pr-2 py-1 cursor-pointer"
          >
            {categories.map(c => <option key={c} value={c} className="bg-white/60">{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glow-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/60">
                <h4 className="text-xs font-bold text-slate-800 glow-text">Inventory Items</h4>
            </div>
            {/* Mobile Product Items Card List */}
            <div className="block md:hidden divide-y divide-white/40">
              {filteredProducts.map(p => (
                <div key={p.id} className="p-4 hover:bg-white/40 transition-colors space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <div className="font-bold text-emerald-700 glow-text-purple text-sm">{p.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{p.category} {p.unitCategory ? `(${p.unitCategory})` : ''}</div>
                      {p.description && <p className="text-[10px] text-slate-400 mt-1 italic leading-relaxed">{p.description}</p>}
                    </div>
                    <span className="font-mono text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded shrink-0">
                      SKU: {p.id}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-white/40 p-2.5 rounded-lg border border-white/40 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider mb-0.5">Harga Jual:</span>
                      <div className="font-bold text-slate-800">Rp {p.sellPrice.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block font-bold uppercase tracking-wider mb-0.5">Stok & Unit:</span>
                      <div>
                        <span className={`font-bold px-2 py-1 rounded-full text-[10px] glow-border ${p.stock <= p.minStock ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {p.stock} {p.basicUnit || 'pcs'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {role === 'Admin' && (
                    <div className="flex justify-end pt-1">
                      <button 
                        onClick={() => handleDelete(p.id)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-[10px] font-bold uppercase transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 bg-white/30 cursor-pointer"
                      >
                        <Trash2 size={12} />
                        Hapus Produk
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">Tidak ada produk ditemukan</div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/60 text-[10px] text-indigo-700 uppercase font-bold border-b border-white/50">
                  <tr>
                    <th className="text-left px-6 py-3">SKU / Kode</th>
                    <th className="text-left px-6 py-3">Nama Produk, Kategori & Deskripsi</th>
                    <th className="text-right px-6 py-3">Stok</th>
                    <th className="text-right px-6 py-3">Harga Jual</th>
                    <th className="text-right px-6 py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-slate-600 divide-y divide-white/40">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-800 font-mono">{p.id}</td>
                      <td className="px-6 py-3">
                          <div className="font-bold text-emerald-700 glow-text-purple text-sm">{p.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium mt-0.5">{p.category} {p.unitCategory ? `・ Kategori Unit: ${p.unitCategory}` : ''}</div>
                          {p.description && <p className="text-[10px] text-slate-400 mt-1 max-w-sm italic leading-relaxed">{p.description}</p>}
                      </td>
                      <td className="px-6 py-3 text-right">
                          <span className={`font-bold px-2 py-1 rounded-full text-[10px] glow-border ${p.stock <= p.minStock ? 'bg-red-500/20 text-red-600' : 'bg-indigo-100/50 text-indigo-700'}`}>
                              {p.stock} {p.basicUnit || 'pcs'}
                          </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-slate-800">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                      <td className="px-6 py-3 flex justify-end gap-2 items-center h-full pt-4">
                        {role === 'Admin' && (
                          <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-350 text-[10px] font-bold uppercase transition-colors shrink-0">
                            HAPUS
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-500">Tidak ada produk ditemukan</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="lg:col-span-4 glow-card rounded-xl p-6 h-fit">
              <h4 className="text-xs font-bold text-slate-800 glow-text mb-4 border-b border-white/50 pb-3">Tambah Produk Baru</h4>
              <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                      <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">SKU / Kode Produk</label>
                      <input type="text" required value={schema.id} onChange={e => setSchema({...schema, id: e.target.value})} className="w-full px-3 py-2 glow-input rounded-md text-xs font-medium" placeholder="e.g. SKU-1002"/>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Nama Produk</label>
                      <input type="text" required value={schema.name} onChange={e => setSchema({...schema, name: e.target.value})} className="w-full px-3 py-2 glow-input rounded-md text-xs" placeholder="e.g. Valves Marine 2 Inch"/>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Deskripsi Produk (Keterangan/Spesifikasi)</label>
                      <textarea rows={2} required value={schema.description} onChange={e => setSchema({...schema, description: e.target.value})} className="w-full px-3 py-2 glow-input rounded-md text-xs resize-none" placeholder="e.g. Kuningan lapis nikel bodi tebal kelautan..."/>
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Kategori Produk</label>
                      <select value={schema.category} onChange={e => setSchema({...schema, category: e.target.value})} className="w-full px-3 py-2 glow-input rounded-md text-xs cursor-pointer">
                          {categories.filter(c=>c!=='All').map(c => <option key={c} value={c} className="bg-white/60">{c}</option>)}
                      </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Kategori Unit</label>
                          <input type="text" required value={schema.unitCategory} onChange={e => setSchema({...schema, unitCategory: e.target.value})} className="w-full px-3 py-2 glow-input rounded-md text-xs" placeholder="e.g. Aksesoris Valve"/>
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Satuan Dasar</label>
                          <input type="text" required value={schema.basicUnit} onChange={e => setSchema({...schema, basicUnit: e.target.value})} className="w-full px-3 py-2 glow-input rounded-md text-xs" placeholder="Kg, gr, Ltr, pcs"/>
                      </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Stok Awal</label>
                          <input type="number" required min="0" value={schema.stock} onChange={e => setSchema({...schema, stock: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 glow-input rounded-md text-xs"/>
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Min Stok</label>
                          <input type="number" required min="0" value={schema.minStock} onChange={e => setSchema({...schema, minStock: parseInt(e.target.value) || 0})} className="w-full px-3 py-2 glow-input rounded-md text-xs"/>
                      </div>
                  </div>

                  {/* Panel Atur Harga */}
                  <div className="bg-gradient-to-br from-indigo-50/50 to-white/60 p-3 rounded-lg border border-indigo-100/80 space-y-3">
                      <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest border-b border-indigo-100/50 pb-1.5">Panel Atur Harga</p>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wide mb-1">Harga Beli</label>
                              <div className="relative">
                                  <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Rp</span>
                                  <input type="number" required min="0" value={schema.buyPrice} onChange={e => setSchema({...schema, buyPrice: parseInt(e.target.value) || 0})} className="w-full pl-7 pr-2 py-1.5 glow-input rounded-md text-xs font-mono"/>
                              </div>
                          </div>
                          <div>
                              <label className="block text-[9px] font-bold text-slate-505 uppercase tracking-wide mb-1">Harga Jual</label>
                              <div className="relative">
                                  <span className="absolute left-2.5 top-2 text-[10px] font-bold text-slate-400">Rp</span>
                                  <input type="number" required min="0" value={schema.sellPrice} onChange={e => setSchema({...schema, sellPrice: parseInt(e.target.value) || 0})} className="w-full pl-7 pr-2 py-1.5 glow-input rounded-md text-xs font-mono"/>
                              </div>
                          </div>
                      </div>
                  </div>

                  <button type="submit" className="w-full glow-button py-2.5 rounded-md text-xs font-bold mt-4 uppercase tracking-wider">Simpan ke Master Produk</button>
              </form>
          </div>
      </div>
    </div>
  );
}
