import React, { useState } from 'react';
import { useStore } from '../store';
import { TransactionItem, Purchase } from '../types';
import { Plus, Trash2, ArrowDownToLine, ArrowLeft, Download } from 'lucide-react';

export function PurchaseModule() {
  const { products, addPurchase, purchases } = useStore();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<TransactionItem[]>([]);

  // History Filters
  const [historyFilter, setHistoryFilter] = useState('all');
  const [showHistoryPrint, setShowHistoryPrint] = useState(false);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        item.productId = value as string;
        item.price = prod ? prod.buyPrice : 0;
    } else if (field === 'quantity') {
        item.quantity = value as number;
    } else if (field === 'price') {
        item.price = value as number;
    }
    
    item.total = item.quantity * item.price;
    newItems[index] = item;
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplier || items.length === 0 || items.some(i => !i.productId || i.quantity <= 0)) {
        alert("Mohon lengkapi data pembelian.");
        return;
    }

    const purchase: Purchase = {
        id: `PO-${Date.now().toString().slice(-6)}`,
        date,
        supplier,
        items,
        total: grandTotal
    };

    addPurchase(purchase);
    setItems([]);
    setSupplier('');
    alert(`Pembelian berhasil dicatat. Stok bertambah dan HPP disesuaikan.`);
  };

  const filteredPurchases = purchases.filter(p => {
      if (historyFilter === 'all') return true;
      const pTime = new Date(p.date).getTime();
      const diffDays = (new Date().getTime() - pTime) / (1000 * 3600 * 24);
      if (historyFilter === '1_month') return diffDays <= 30;
      if (historyFilter === '3_months') return diffDays <= 90;
      if (historyFilter === '1_year') return diffDays <= 365;
      return true;
  }).reverse();

  if (showHistoryPrint) {
      return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center no-print">
                <button onClick={() => setShowHistoryPrint(false)} className="flex items-center text-indigo-700 hover:text-slate-800 bg-white/60 px-4 py-2 rounded-md font-bold transition-colors shadow-sm text-xs">
                    <ArrowLeft size={16} className="mr-2"/> KEMBALI
                </button>
                <button onClick={() => window.print()} className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-bold transition-colors shadow-sm text-xs">
                    <Download size={16} className="mr-2"/> EXPORT PDF
                </button>
            </div>
            <div className="bg-white p-10 rounded-xl report-font print-area text-slate-800">
                {/* Print Header with logo */}
                <div className="flex justify-between items-center border-b-2 border-slate-300 pb-6 mb-6 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm border-slate-200">
                            <img src="/logo cbs.png" alt="Logo PT. Caraca Bintang Samudra" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">PT. CARACA BINTANG SAMUDRA</h1>
                            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">Enterprise Maritime Supplier & Logistics</p>
                            <p className="text-xs text-slate-400 mt-1">Jl. Pelabuhan Raya No. 88, Tanjung Priok, Jakarta Utara, 14310</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700">Laporan Riwayat Pembelian</h2>
                        <p className="text-xs text-slate-500 font-medium">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
                
                <div className="mb-6 grid grid-cols-2 text-sm">
                    <div>
                        <p className="text-slate-500 font-semibold">Tipe Laporan: <span className="text-slate-800 font-bold ml-1">Riwayat Pembelian</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 font-semibold">Filter Waktu: <span className="text-slate-800 font-bold ml-1">
                            {historyFilter === 'all' && 'Seluruh Waktu'}
                            {historyFilter === '1_month' && '1 Bulan Terakhir'}
                            {historyFilter === '3_months' && '3 Bulan Terakhir'}
                            {historyFilter === '1_year' && '1 Tahun Terakhir'}
                        </span></p>
                    </div>
                </div>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="border-y-2 border-slate-800">
                            <th className="py-2 px-3 text-left">No. PO</th>
                            <th className="py-2 px-3 text-left">Tanggal</th>
                            <th className="py-2 px-3 text-left">Supplier</th>
                            <th className="py-2 px-3 text-right">Nilai Pembelian</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredPurchases.map(p => (
                            <tr key={p.id}>
                                <td className="py-2 px-3 font-medium">{p.id}</td>
                                <td className="py-2 px-3">{p.date}</td>
                                <td className="py-2 px-3">{p.supplier}</td>
                                <td className="py-2 px-3 text-right">Rp {p.total.toLocaleString('id-ID')}</td>
                            </tr>
                        ))}
                        {filteredPurchases.length === 0 && <tr><td colSpan={4} className="py-4 text-center">Tidak ada transaksi.</td></tr>}
                        <tr className="border-t-2 border-slate-800 font-bold">
                            <td colSpan={3} className="py-3 px-3 text-right">Total Transaksi Pembelian:</td>
                            <td className="py-3 px-3 text-right">Rp {filteredPurchases.reduce((a, b) => a + b.total, 0).toLocaleString('id-ID')}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
           <h2 className="text-xl font-bold text-slate-800 glow-text">Procurement & Restock</h2>
           <p className="text-xs text-indigo-700 mt-1 opacity-80">Penerimaan barang dari supplier</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 glow-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/50 flex justify-between items-center bg-white/60">
                <h4 className="text-xs font-bold text-slate-800 glow-text">Form Pembelian Baru</h4>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 <div>
                     <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Tanggal Terima</label>
                     <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 glow-input rounded-md text-xs"/>
                 </div>
                 <div>
                     <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Nama Supplier / Vendor</label>
                     <input type="text" required value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full px-3 py-2 glow-input rounded-md text-xs" placeholder="Masukkan nama PT vendor..."/>
                 </div>
              </div>

              <div>
                  <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">Item Barang Diterima</h4>
                      <button type="button" onClick={handleAddItem} className="flex items-center text-[10px] font-bold text-emerald-700 uppercase hover:text-slate-800 transition-colors glow-text-purple">
                          + TAMBAH BARIS
                      </button>
                  </div>

                  <div className="overflow-x-auto glow-border rounded-lg bg-white/60">
                      <table className="w-full min-w-[650px]">
                        <thead className="bg-white/60 text-[10px] text-indigo-700 uppercase font-bold border-b border-white/50">
                          <tr>
                            <th className="text-left px-4 py-2">Produk Tersedia</th>
                            <th className="text-left px-4 py-2 w-24">QTY</th>
                            <th className="text-left px-4 py-2">Harga Beli Satuan</th>
                            <th className="px-4 py-2 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/40 text-xs">
                          {items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="px-4 py-2">
                                  <select required value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} className="w-full p-1.5 glow-input rounded text-xs cursor-pointer">
                                     <option value="" className="bg-white/60">Pilih Produk...</option>
                                     {products.map(p => <option key={p.id} value={p.id} className="bg-white/60">{p.name} (Stok: {p.stock})</option>)}
                                  </select>
                              </td>
                              <td className="px-4 py-2">
                                  <input type="number" required min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="w-full p-1.5 glow-input rounded text-xs text-center"/>
                              </td>
                              <td className="px-4 py-2">
                                  <div className="relative">
                                      <span className="absolute left-2 top-1.5 text-slate-400">Rp</span>
                                      <input type="number" required min="0" value={item.price} onChange={e => updateItem(idx, 'price', parseInt(e.target.value) || 0)} className="w-full p-1.5 pl-8 glow-input rounded text-xs"/>
                                  </div>
                              </td>
                              <td className="px-4 py-2 text-center">
                                  <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={14} className="drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]"/></button>
                              </td>
                            </tr>
                          ))}
                          {items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/60">Silakan tambah item pembelian</td></tr>}
                        </tbody>
                      </table>
                  </div>
              </div>

              <div className="mt-8 flex flex-col md:flex-row justify-between items-center bg-white/60 p-6 rounded-lg glow-border">
                 <div className="text-[10px] text-slate-600 w-2/3 pr-6 leading-relaxed">
                     <span className="font-bold text-slate-700mber-400 block mb-1 drop-shadow-[0_0_5px_rgba(251,191,36,0.6)]">INFO SISTEM:</span>
                     Menyimpan data ini otomatis memotong saldo Kas, menambah nilai Persediaan Gudang, serta mengkalkulasi ulang HPP dasar secara otomatis (Moving Average).
                 </div>
                 <div className="text-right mt-4 md:mt-0 min-w-[200px]">
                     <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest glow-text">Draft Total</p>
                     <p className="text-2xl font-bold text-slate-800 mt-0 mb-4 glow-text-purple">Rp {grandTotal.toLocaleString('id-ID')}</p>
                     <button type="submit" className="w-full glow-button px-6 py-2.5 rounded text-xs font-bold transition-colors uppercase tracking-wider">
                         Simpan Entri
                     </button>
                 </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4 glow-card rounded-xl overflow-hidden h-fit flex flex-col max-h-[80vh]">
              <div className="px-4 py-4 border-b border-white/50 flex flex-col gap-3 bg-white/60 shrink-0">
                  <h4 className="text-xs font-bold text-slate-800 glow-text">Riwayat Pembelian</h4>
                  <div className="flex items-center gap-2">
                       <select 
                            value={historyFilter} 
                            onChange={e => setHistoryFilter(e.target.value)}
                            className="px-2 py-1.5 glow-input text-indigo-700 rounded-md outline-none text-[10px] font-bold flex-1 cursor-pointer"
                        >
                            <option value="all">Seluruh Waktu</option>
                            <option value="1_month">1 Bulan Terakhir</option>
                            <option value="3_months">3 Bulan Terakhir</option>
                            <option value="1_year">1 Tahun Terakhir</option>
                        </select>
                        <button onClick={() => setShowHistoryPrint(true)} className="flex items-center text-[10px] bg-indigo-600 font-bold px-2 py-1.5 text-white rounded-md hover:bg-indigo-700 transition-colors">
                            <Download size={14} className="mr-1" /> EXPORT
                        </button>
                  </div>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {filteredPurchases.map(p => (
                      <div key={p.id} className="pb-4 border-b border-white/50 last:border-0 last:pb-0">
                          <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-emerald-700 glow-text-purple text-xs">{p.id}</span>
                              <span className="font-bold text-slate-800 text-xs">Rp {p.total.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <span className="text-[10px] text-slate-600 truncate w-32">{p.supplier}</span>
                              <span className="text-[9px] text-slate-400">{p.date}</span>
                          </div>
                      </div>
                  ))}
                  {filteredPurchases.length === 0 && <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-bold">Belum ada dokumen PO</p>}
              </div>
          </div>
      </div>
    </div>
  );
}
