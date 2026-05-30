import React, { useState } from 'react';
import { useStore } from '../store';
import { TransactionItem, Sale } from '../types';
import { Plus, Trash2, Printer, Download, ArrowLeft } from 'lucide-react';
import { DocumentPrintView } from './DocumentPrintView';

export function SalesModule() {
  const { products, customers, addSale, sales } = useStore();
  const [printDoc, setPrintDoc] = useState<{ sale: Sale, type: string } | null>(null);
  
  // History Filters
  const [historyFilter, setHistoryFilter] = useState('all');
  const [showHistoryPrint, setShowHistoryPrint] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState('');
  const [topDays, setTopDays] = useState(0);
  const [items, setItems] = useState<TransactionItem[]>([]);

  const activeCustomers = customers.filter(c => c.active);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1, price: 0, total: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = { ...newItems[index] };
    
    if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        item.productId = value as string;
        item.price = prod ? prod.sellPrice : 0;
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
    if (!customerId || items.length === 0 || items.some(i => !i.productId || i.quantity <= 0)) {
        alert("Mohon lengkapi data penjualan dan setidaknya satu item valid.");
        return;
    }
    
    // Check stock
    for (let item of items) {
        const p = products.find(prod => prod.id === item.productId);
        if (p && p.stock < item.quantity) {
            alert(`Stok tidak mencukupi untuk: ${p?.name}. Sisa stok: ${p?.stock}`);
            return;
        }
    }

    const sale: Sale = {
        id: `INV-${Date.now().toString().slice(-6)}`,
        date,
        customerId,
        items,
        total: grandTotal,
        topDays
    };

    addSale(sale);
    setItems([]);
    alert(`Transaksi berhasil! Buka riwayat untuk cetak dokumen.`);
  };

  const filteredSales = sales.filter(s => {
      if (historyFilter === 'all') return true;
      const sTime = new Date(s.date).getTime();
      const diffDays = (new Date().getTime() - sTime) / (1000 * 3600 * 24);
      if (historyFilter === '1_month') return diffDays <= 30;
      if (historyFilter === '3_months') return diffDays <= 90;
      if (historyFilter === '1_year') return diffDays <= 365;
      return true;
  }).reverse();

  if (printDoc) {
      return <DocumentPrintView sale={printDoc.sale} type={printDoc.type} onBack={() => setPrintDoc(null)} />;
  }

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
                        <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-700">Laporan Riwayat Penjualan</h2>
                        <p className="text-xs text-slate-500 font-medium">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
                    </div>
                </div>
                
                <div className="mb-6 grid grid-cols-2 text-sm">
                    <div>
                        <p className="text-slate-500 font-semibold">Tipe Laporan: <span className="text-slate-800 font-bold ml-1">Riwayat Penjualan</span></p>
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
                            <th className="py-2 px-3 text-left">No. Invoice</th>
                            <th className="py-2 px-3 text-left">Tanggal</th>
                            <th className="py-2 px-3 text-left">Customer</th>
                            <th className="py-2 px-3 text-right">Nilai Transaksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredSales.map(s => {
                            const cname = customers.find(c => c.id === s.customerId)?.name || 'Unknown';
                            return (
                                <tr key={s.id}>
                                    <td className="py-2 px-3 font-medium">{s.id}</td>
                                    <td className="py-2 px-3">{s.date}</td>
                                    <td className="py-2 px-3">{cname}</td>
                                    <td className="py-2 px-3 text-right">Rp {s.total.toLocaleString('id-ID')}</td>
                                </tr>
                            )
                        })}
                        {filteredSales.length === 0 && <tr><td colSpan={4} className="py-4 text-center">Tidak ada transaksi.</td></tr>}
                        <tr className="border-t-2 border-slate-800 font-bold">
                            <td colSpan={3} className="py-3 px-3 text-right">Total Transaksi Penjualan:</td>
                            <td className="py-3 px-3 text-right">Rp {filteredSales.reduce((a, b) => a + b.total, 0).toLocaleString('id-ID')}</td>
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
           <h2 className="text-xl font-bold text-slate-800 glow-text">Sales Order & Invoicing</h2>
           <p className="text-xs text-indigo-700 mt-1 opacity-80">Pembuatan dokumen penjualan resmi dan potong persediaan</p>
        </div>
      </div>

      <div className="glow-card rounded-xl overflow-hidden">
         <div className="px-6 py-4 border-b border-white/50 bg-white/60">
            <h4 className="text-xs font-bold text-slate-800 glow-text">Form Sales Invoice</h4>
         </div>
         
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div>
                 <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Tanggal Transaksi</label>
                 <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 glow-input rounded-md text-xs"/>
             </div>
             <div>
                 <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Pilih Customer</label>
                 <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-3 py-2 glow-input rounded-md text-xs cursor-pointer">
                     <option value="" className="bg-white/60">-- Pilih Perusahaan --</option>
                     {activeCustomers.map(c => <option key={c.id} value={c.id} className="bg-white/60">{c.name}</option>)}
                 </select>
             </div>
             <div>
                 <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Term Of Payment (Hari)</label>
                 <input type="number" min="0" value={topDays} onChange={e => setTopDays(parseInt(e.target.value) || 0)} className="w-full px-3 py-2 glow-input rounded-md text-xs" placeholder="0 = Cash"/>
             </div>
          </div>

          <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                  <h4 className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">Detail Items Invoice</h4>
                  <button type="button" onClick={handleAddItem} className="flex items-center text-[10px] font-bold text-emerald-700 uppercase hover:text-slate-800 transition-colors glow-text-purple">
                      + TAMBAH BARIS ITEM
                  </button>
              </div>

              <div className="overflow-x-auto glow-border rounded-lg bg-white/60">
                  <table className="w-full min-w-[650px]">
                    <thead className="bg-white/60 text-slate-200 text-[10px] uppercase font-bold border-b border-white/50">
                      <tr>
                        <th className="text-left px-4 py-3 w-1/3">Produk</th>
                        <th className="text-left px-4 py-3 w-24">QTY</th>
                        <th className="text-left px-4 py-3">Harga Jual</th>
                        <th className="text-right px-4 py-3">Total Sub</th>
                        <th className="px-4 py-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/40 text-xs">
                      {items.map((item, idx) => (
                        <tr key={idx} className="bg-transparent hover:bg-white/40">
                          <td className="px-4 py-2">
                              <select required value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)} className="w-full p-2 glow-input rounded-md text-xs cursor-pointer">
                                 <option value="" className="bg-white/60">Pilih Produk...</option>
                                 {products.map(p => <option key={p.id} value={p.id} className="bg-white/60">{p.id} - {p.name}</option>)}
                              </select>
                          </td>
                          <td className="px-4 py-2">
                              <input type="number" required min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="w-full p-2 glow-input rounded-md text-xs text-center"/>
                          </td>
                          <td className="px-4 py-2">
                              <div className="relative">
                                  <span className="absolute left-3 top-2.5 text-slate-400">Rp</span>
                                  <input type="number" required min="0" value={item.price} onChange={e => updateItem(idx, 'price', parseInt(e.target.value) || 0)} className="w-full p-2 pl-9 glow-input rounded-md text-xs"/>
                              </div>
                          </td>
                          <td className="px-4 py-2 font-bold text-slate-800 text-right">Rp {item.total.toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2 text-center">
                              <button type="button" onClick={() => removeItem(idx)} className="text-slate-400 hover:text-red-400 transition-colors"><Trash2 size={16} className="drop-shadow-[0_0_2px_rgba(239,68,68,0.5)]"/></button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/60">List item kosong</td></tr>}
                    </tbody>
                  </table>
              </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 p-6 rounded-lg glow-border">
             <div className="text-[10px] text-slate-600 mb-4 md:mb-0 w-1/2 leading-relaxed">
                 * Transaksi menyebabkan jurnal entri otomatis di ledger Akuntansi. Data tidak bisa ditarik sepihak kecuali via Role Admin.
             </div>
             <div className="flex items-center gap-8 border-l border-white/50 pl-8">
                 <div className="text-right">
                     <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest glow-text">Grand Total</p>
                     <p className="text-3xl font-bold text-emerald-700 glow-text-purple">Rp {grandTotal.toLocaleString('id-ID')}</p>
                 </div>
                 <button type="submit" className="glow-button px-8 py-3 rounded-md text-xs font-bold uppercase tracking-wider">
                     Simpan Transaksi
                 </button>
             </div>
          </div>
        </form>
      </div>

       <div className="glow-card rounded-xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-white/50 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/60">
                <h4 className="text-xs font-bold text-slate-800 glow-text">Riwayat Transaksi Penjualan</h4>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <select 
                        value={historyFilter} 
                        onChange={e => setHistoryFilter(e.target.value)}
                        className="px-3 py-1.5 glow-input text-indigo-700 rounded-md outline-none text-xs font-bold cursor-pointer flex-1 md:flex-none"
                    >
                        <option value="all">Seluruh Waktu</option>
                        <option value="1_month">1 Bulan Terakhir</option>
                        <option value="3_months">3 Bulan Terakhir</option>
                        <option value="1_year">1 Tahun Terakhir</option>
                    </select>
                    <button onClick={() => setShowHistoryPrint(true)} className="flex items-center text-xs font-bold px-3 py-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                        <Download size={14} className="mr-1" /> EXPORT Laporan
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                    <thead className="bg-white/60 text-[10px] text-slate-600 uppercase font-bold border-b border-white/50">
                        <tr>
                            <th className="text-left px-6 py-3 border-r border-white/50">No. Invoice</th>
                            <th className="text-left px-6 py-3 border-r border-white/50">Tanggal</th>
                            <th className="text-left px-6 py-3 border-r border-white/50">Customer</th>
                            <th className="text-right px-6 py-3 border-r border-white/50">Nilai Transaksi</th>
                            <th className="text-right px-6 py-3">Aksi Pencetakan</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs text-slate-600 divide-y divide-white/40">
                        {filteredSales.map(s => {
                            const cname = customers.find(c => c.id === s.customerId)?.name || 'Unknown';
                            return (
                                <tr key={s.id} className="hover:bg-white/40 transition-colors">
                                    <td className="px-6 py-3 font-bold text-emerald-700 border-r border-white/50 glow-text-purple">{s.id}</td>
                                    <td className="px-6 py-3 border-r border-white/50">{s.date}</td>
                                    <td className="px-6 py-3 border-r border-white/50">{cname}</td>
                                    <td className="px-6 py-3 font-bold text-slate-800 text-right border-r border-white/50">Rp {s.total.toLocaleString('id-ID')}</td>
                                    <td className="px-6 py-3 text-right">
                                        <select 
                                            onChange={(e) => {
                                                if(e.target.value) {
                                                    setPrintDoc({ sale: s, type: e.target.value });
                                                    e.target.value = "";
                                                }
                                            }}
                                            className="px-2 py-1.5 glow-input text-indigo-700 rounded outline-none text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                        >
                                            <option value="" className="bg-white/60">-- Mode Dokumen --</option>
                                            <option value="invoice" className="bg-white/60">Cetak Invoice</option>
                                            <option value="receipt" className="bg-white/60">Cetak Kwitansi</option>
                                            <option value="do" className="bg-white/60">Surat Jalan (DO)</option>
                                            <option value="bast" className="bg-white/60">Surat Penerimaan (BAST)</option>
                                        </select>
                                    </td>
                                </tr>
                            )
                        })}
                        {filteredSales.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-xs text-slate-500">Belum ada riwayat sales untuk dicetak</td></tr>}
                    </tbody>
                </table>
            </div>
       </div>
    </div>
  );
}

