import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { TrendingUp, ShoppingCart, Users, AlertTriangle, CheckCircle2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

export function Dashboard() {
  const { sales, purchases, customers, products, accounts } = useStore();
  const [dateFilter, setDateFilter] = useState<'1M' | '3M' | '1Y' | 'ALL'>('ALL');

  const totalPurchases = purchases.reduce((sum, p) => sum + p.total, 0);
  
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  
  const piutangUsaha = useMemo(() => {
    return accounts.find(a => a.code === '1-2000')?.balance || 0;
  }, [accounts]);

  const hutangUsaha = useMemo(() => {
    return accounts.find(a => a.code === '2-1000')?.balance || 0;
  }, [accounts]);
  
  const filteredSales = useMemo(() => {
    const now = new Date();
    return sales.filter(s => {
      if (dateFilter === 'ALL') return true;
      const saleDate = new Date(s.date);
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (dateFilter === '1M') return diffDays <= 30;
      if (dateFilter === '3M') return diffDays <= 90;
      if (dateFilter === '1Y') return diffDays <= 365;
      return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [sales, dateFilter]);

  const totalSales = filteredSales.reduce((sum, s) => sum + s.total, 0);

  // Calculate inventory statistics by product categories
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; totalStock: number; totalValue: number }> = {};
    products.forEach(p => {
      const cat = p.category || 'Other';
      if (!stats[cat]) {
        stats[cat] = { count: 0, totalStock: 0, totalValue: 0 };
      }
      stats[cat].count += 1;
      stats[cat].totalStock += p.stock;
      stats[cat].totalValue += p.stock * p.buyPrice;
    });
    return Object.entries(stats).map(([category, data]) => ({
      category,
      ...data
    })).sort((a, b) => b.totalValue - a.totalValue);
  }, [products]);

  // SVG Chart data generation
  const maxSales = Math.max(...filteredSales.map(s => s.total), 1000); // minimum scale
  const minSales = Math.min(...filteredSales.map(s => s.total), 0);
  const chartHeight = 160;
  const chartWidth = 600;
  
  const points = filteredSales.map((s, i) => {
    const x = filteredSales.length > 1 ? (i / (filteredSales.length - 1)) * chartWidth : chartWidth/2;
    const y = chartHeight - ((s.total / maxSales) * chartHeight);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Critical Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-start gap-4 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse">
            <AlertTriangle size={24} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)] shrink-0" />
            <div>
                <h3 className="text-red-600 font-black tracking-wide glow-text mb-1">WARNING: STOK KRITIS</h3>
                <p className="text-red-500 text-xs font-medium">Terdapat {lowStockProducts.length} produk yang stoknya berada di bawah batas minimum (safety stock). Segera lakukan pemesanan (PO) untuk menghindari gagal suplai ke customer.</p>
            </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-card p-5 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-tight glow-text">Total Penjualan</p>
            <span className="text-green-400 text-[10px] font-bold glow-text"><TrendingUp size={12} className="inline mr-1" /></span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Rp {totalSales.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] text-slate-400 mt-2 italic">{filteredSales.length} Transaksi ({dateFilter})</p>
        </div>
        
        <div className="glow-card p-5 rounded-xl">
          <div className="flex justify-between items-start mb-2 text-indigo-700">
            <p className="text-[10px] font-bold uppercase tracking-tight glow-text">Total Pembelian</p>
            <span className="text-emerald-700 text-[10px] font-bold glow-text-purple"><ShoppingCart size={12} className="inline mr-1" /></span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-1">Rp {totalPurchases.toLocaleString('id-ID')}</h3>
          <p className="text-[10px] text-slate-400 mt-2 italic glow-text-purple">{purchases.length} Dokumen Pembelian</p>
        </div>

        <div className="glow-card p-5 rounded-xl">
          <div className="flex justify-between items-start mb-2 text-indigo-700">
            <p className="text-[10px] font-bold uppercase tracking-tight glow-text">Active Customers</p>
            <span className="text-slate-400 text-[10px]">{customers.length} Entities</span>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mt-1">{customers.filter(c => c.active).length} Aktif</h3>
          <p className="text-[10px] text-slate-400 mt-2">{customers.filter(c => !c.active).length} Non-aktif</p>
        </div>

        <div className={`glow-card p-5 rounded-xl ${lowStockProducts.length > 0 ? 'bg-red-50/50' : ''}`}>
          <div className="flex justify-between items-start mb-2">
            <p className={`text-[10px] font-bold uppercase tracking-tight glow-text ${lowStockProducts.length > 0 ? 'text-red-500' : 'text-indigo-700'}`}>Status Stok</p>
            {lowStockProducts.length > 0 ? (
                <AlertTriangle size={12} className="text-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
            ) : (
                <CheckCircle2 size={12} className="text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.8)]" />
            )}
          </div>
          <h3 className={`text-xl font-bold mt-1 ${lowStockProducts.length > 0 ? 'text-red-500 drop-shadow-sm' : 'text-slate-800'}`}>
            {lowStockProducts.length > 0 ? `${lowStockProducts.length} Items Kritis` : 'Stok Aman'}
          </h3>
          <p className={`text-[10px] mt-2 ${lowStockProducts.length > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
            Prioritas pengadaan diperlukan
          </p>
        </div>
      </div>

      {/* Ringkasan Hubungan Niaga (Hutang & Piutang Usaha) Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Piutang */}
        <div className="glow-card p-6 rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-50/20 to-white/60 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 rounded-full border border-indigo-200">
                  Aset Lancar
                </span>
                <h4 className="text-sm font-bold text-slate-850 mt-2">Piutang Usaha (Accounts Receivable)</h4>
              </div>
              <div className="p-3 bg-indigo-50/70 text-indigo-600 rounded-2xl border border-indigo-100 shadow-sm animate-pulse">
                <ArrowDownLeft size={20} />
              </div>
            </div>
            <div className="my-2">
              <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Total Tagihan Aktif</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                Rp {piutangUsaha.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-4 pt-3 border-t border-slate-200/50">
            Representasi dana perusahaan yang masih ada di tangan pembeli (Klien) berbentuk tagihan tempo penjualan (Piutang Dagang).
          </p>
        </div>

        {/* Panel Hutang */}
        <div className="glow-card p-6 rounded-2xl border border-white/60 bg-gradient-to-br from-rose-50/20 to-white/60 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                  Kewajiban Lancar
                </span>
                <h4 className="text-sm font-bold text-slate-850 mt-2">Hutang Usaha (Accounts Payable)</h4>
              </div>
              <div className="p-3 bg-rose-50/70 text-rose-600 rounded-2xl border border-rose-100 shadow-sm animate-pulse">
                <ArrowUpRight size={20} />
              </div>
            </div>
            <div className="my-2">
              <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Total Kewajiban Lancar</span>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
                Rp {hutangUsaha.toLocaleString('id-ID')}
              </h3>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed mt-4 pt-3 border-t border-slate-200/50">
            Representasi tagihan aktif dari Pemasok (Supplier) atas transaksi pembelian pengadaan barang yang belum dilunasi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-1 lg:col-span-8 glow-card rounded-xl p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 glow-text">Tren Penjualan</h4>
                  <p className="text-[10px] text-indigo-700">Grafik Nilai Invoice per Transaksi</p>
                </div>
                <div className="flex gap-2">
                  <select 
                    value={dateFilter} 
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="text-xs px-3 py-1.5 glow-input rounded-lg bg-white/60 font-bold text-indigo-700 cursor-pointer outline-none border-none shadow-sm"
                  >
                    <option value="1M">1 Bulan Terakhir</option>
                    <option value="3M">3 Bulan Terakhir</option>
                    <option value="1Y">1 Tahun Terakhir</option>
                    <option value="ALL">Semua Waktu</option>
                  </select>
                </div>
            </div>
            
            <div className="w-full relative" style={{ height: chartHeight + 40 }}>
              {filteredSales.length > 0 ? (
                <>
                    {/* Y Axis Grid lines */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pt-5 pb-5">
                        <div className="border-t border-slate-200/50 w-full relative">
                            <span className="absolute -top-3 right-0 text-[8px] text-slate-400">{(maxSales).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="border-t border-slate-200/50 w-full relative"></div>
                        <div className="border-t border-slate-200/50 w-full relative">
                            <span className="absolute -top-3 right-0 text-[8px] text-slate-400">0</span>
                        </div>
                    </div>

                    <svg width="100%" height={chartHeight} viewBox={`-10 -10 ${chartWidth + 20} ${chartHeight + 20}`} className="overflow-visible relative z-10 mt-5">
                        {filteredSales.length > 1 && (
                        <polyline
                            fill="none"
                            stroke="#04c0ca"
                            strokeWidth="3"
                            points={points}
                            strokeLinecap="round"
                            style={{ filter: 'drop-shadow(0px 4px 8px rgba(4,192,202,0.4))' }}
                        />
                        )}
                        {filteredSales.map((s, i) => {
                        const x = filteredSales.length > 1 ? (i / (filteredSales.length - 1)) * chartWidth : chartWidth/2;
                        const y = chartHeight - ((s.total / maxSales) * chartHeight);
                        return (
                            <g key={i} className="group cursor-pointer">
                                <circle cx={x} cy={y} r="5" fill="#03a0a8" stroke="#fff" strokeWidth="2" className="transition-all" style={{ filter: 'drop-shadow(0px 0px 5px rgba(3,160,168,0.8))' }} />
                                {/* Tooltip */}
                                <rect x={x - 60} y={y - 35} w="120" h="25" rx="4" fill="rgba(255,255,255,0.9)" className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                                <text x={x} y={y - 20} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#334155" className="opacity-0 group-hover:opacity-100 transition-opacity relative z-20">Rp {s.total.toLocaleString('id-ID')}</text>
                                <text x={x} y={chartHeight + 15} textAnchor="middle" fontSize="9" fill="#94a3b8">{new Date(s.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</text>
                            </g>
                        );
                        })}
                    </svg>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-[10px] font-bold uppercase tracking-widest text-slate-400">Belum ada data penjualan pada periode ini</div>
              )}
            </div>
          </div>
          
          <div className="col-span-1 lg:col-span-4 glow-card rounded-xl p-6 flex flex-col max-h-[300px]">
              <h4 className="text-xs font-bold text-slate-800 glow-text mb-4">Produk Kritis (Menipis)</h4>
              <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                  {lowStockProducts.length === 0 ? (
                      <p className="text-[10px] text-slate-500 font-medium">Semua stok produk dalam batas aman.</p>
                  ) : (
                      lowStockProducts.sort((a,b) => (a.stock/a.minStock) - (b.stock/b.minStock)).map(p => (
                          <div key={p.id} className="bg-white/40 p-2.5 rounded-lg border border-red-100 relative overflow-hidden group">
                               {/* Alert flash behind */}
                              <div className="absolute inset-0 bg-red-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                              <div className="flex justify-between text-[10px] mb-1 font-bold text-slate-800">
                                  <span className="truncate pr-2">{p.name}</span>
                                  <span className="text-red-600 drop-shadow-[0_0_1px_rgba(239,68,68,0)] whitespace-nowrap">{p.stock} / {p.minStock}</span>
                              </div>
                              <div className="w-full h-1.5 bg-red-100 rounded-full overflow-hidden mt-1.5">
                                  <div 
                                    className="h-full bg-red-500 rounded-full animate-pulse" 
                                    style={{ width: `${Math.min((p.stock / p.minStock) * 100, 100)}%`, boxShadow: '0 0 10px rgba(239,68,68,0.8)' }}
                                  ></div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
          </div>
      </div>

      {/* NEW: Interactive Graphics & Diagrams Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Inventory Valuation & Stock Distribution by Category */}
          <div className="glow-card rounded-xl p-6">
              <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider glow-text">Proporsi Valuasi & Distribusi Stok</h4>
                  <p className="text-[10px] text-indigo-700">Analisis Aset Persediaan per Kategori Produk CBS</p>
              </div>
              <div className="space-y-4">
                  {categoryStats.slice(0, 5).map((cat, i) => {
                      const percentage = Math.round((cat.totalValue / categoryStats.reduce((sum, c) => sum + c.totalValue, 1)) * 100);
                      const colors = [
                          'bg-indigo-500', 'bg-emerald-500', 'bg-teal-500', 'bg-cyan-500', 'bg-sky-500'
                      ];
                      const fillColors = [
                          '#04c0ca', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9'
                      ];
                      return (
                          <div key={cat.category} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-700">
                                  <div className="flex items-center gap-1.5">
                                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fillColors[i % fillColors.length] }}></span>
                                      <span>{cat.category} ({cat.count} Item)</span>
                                  </div>
                                  <div className="text-right">
                                      <span className="text-slate-900">Rp {cat.totalValue.toLocaleString('id-ID')}</span>
                                      <span className="text-indigo-700 ml-2">({percentage}%)</span>
                                  </div>
                              </div>
                              <div className="w-full h-2.5 bg-slate-150 rounded-full overflow-hidden flex">
                                  <div 
                                      className={`h-full ${colors[i % colors.length]} rounded-full transition-all duration-1000`}
                                      style={{ width: `${percentage}%` }}
                                  ></div>
                              </div>
                          </div>
                      );
                  })}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>Total Valuasi Persediaan:</span>
                  <span className="font-bold text-emerald-800">Rp {products.reduce((sum, p) => sum + (p.stock * p.buyPrice), 0).toLocaleString('id-ID')}</span>
              </div>
          </div>

          {/* Chart 2: Komparatif Arus Kas (Sales vs Purchases) */}
          <div className="glow-card rounded-xl p-6">
              <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider glow-text">Perbandingan Nilai Transaksi</h4>
                  <p className="text-[10px] text-indigo-700">Total Akumulasi Sales vs Purchases (Inflow vs Outflow)</p>
              </div>
              
              <div className="flex h-44 items-end gap-6 justify-around pt-4 pb-2 relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between h-[80%] my-auto pr-2">
                      <div className="border-t border-slate-200/50 w-full"></div>
                      <div className="border-t border-slate-200/50 w-full"></div>
                      <div className="border-t border-slate-200/50 w-full"></div>
                  </div>

                  {/* Sales Bar */}
                  <div className="flex flex-col items-center gap-2 w-1/3 z-10">
                      <div className="relative group w-full flex justify-center">
                          {/* Label value at top */}
                          <div className="absolute -top-7 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shadow-sm border border-emerald-100">
                              Rp {totalSales.toLocaleString('id-ID')}
                          </div>
                          <div 
                              className="w-12 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg hover:brightness-105 transition-all shadow-md"
                              style={{ 
                                  height: `${Math.max((totalSales / Math.max(totalSales + totalPurchases, 1)) * 130, 20)}px`,
                                  boxShadow: '0 4px 15px rgba(16,185,129,0.3)'
                              }}
                          ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Sales (Inflow)</span>
                  </div>

                  {/* Purchases Bar */}
                  <div className="flex flex-col items-center gap-2 w-1/3 z-10">
                      <div className="relative group w-full flex justify-center">
                          {/* Label value at top */}
                          <div className="absolute -top-7 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded shadow-sm border border-rose-100">
                              Rp {totalPurchases.toLocaleString('id-ID')}
                          </div>
                          <div 
                              className="w-12 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-lg hover:brightness-105 transition-all shadow-md"
                              style={{ 
                                  height: `${Math.max((totalPurchases / Math.max(totalSales + totalPurchases, 1)) * 130, 20)}px`,
                                  boxShadow: '0 4px 15px rgba(244,63,94,0.3)'
                              }}
                          ></div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide">Purchases (Outflow)</span>
                  </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/50 flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 font-mono">Rasio Pergerakan Kas (S:P):</span>
                  <span className="font-bold text-indigo-700 font-mono">
                      {totalPurchases > 0 ? (totalSales / totalPurchases).toFixed(2) : totalSales > 0 ? 'Infinite' : '0.00'}x Lebih Tinggi
                  </span>
              </div>
          </div>
      </div>
    </div>
  );
}
