import React, { useRef, useState, useEffect } from 'react';
import { Sale } from '../types';
import { useStore } from '../store';
import { Printer, ArrowLeft, Download, AlertTriangle } from 'lucide-react';

export function DocumentPrintView({ sale, type, onBack }: { sale: Sale, type: string, onBack: () => void }) {
    const { customers, products } = useStore();
    const customer = customers.find(c => c.id === sale.customerId);
    const componentRef = useRef<HTMLDivElement>(null);
    const [showIframeAlert, setShowIframeAlert] = useState(false);
    const [isInIframe, setIsInIframe] = useState(false);
    
    useEffect(() => {
        try {
            setIsInIframe(window.self !== window.top);
        } catch (e) {
            setIsInIframe(true);
        }
    }, []);
    
    const getTitle = () => {
        switch(type) {
            case 'invoice': return 'INVOICE PENJUALAN';
            case 'receipt': return 'KWITANSI PEMBAYARAN';
            case 'do': return 'SURAT JALAN (DELIVERY ORDER)';
            case 'bast': return 'BERITA ACARA SERAH TERIMA BARANG';
            default: return 'DOKUMEN';
        }
    };

    const handlePrint = () => {
        if (isInIframe) {
            setShowIframeAlert(true);
            return;
        }
        window.print();
    };

    const handleDownloadPDF = () => {
        if (isInIframe) {
            setShowIframeAlert(true);
            return;
        }
        window.print(); // Native print handles 'Save as PDF' without color function errors
    };

    return (
        <div className="min-h-screen p-4 md:p-8 animate-in fade-in max-w-4xl mx-auto relative">
            {/* Modal Alert Iframe */}
            {showIframeAlert && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                            <AlertTriangle size={36} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-3 tracking-tight">Gunakan Fitur Cetak Browser</h3>
                        <p className="text-sm text-slate-600 mb-6 font-medium leading-relaxed">
                            Aksi cetak diblokir pada preview di dalam aplikasi ini (Sandbox Iframe).
                        </p>
                        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 text-left">
                            <p className="text-xs text-indigo-700 font-bold mb-2">SOLUSI:</p>
                            <p className="text-xs text-indigo-600/80 font-medium">Buka aplikasi ini pada tab baru (klik ikon ↗️ "Open in new tab" di pojok kanan atas) untuk bisa menggunakan fitur cetak ke PDF dengan sempurna.</p>
                        </div>
                        <button 
                            onClick={() => setShowIframeAlert(false)}
                            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 uppercase tracking-wider text-sm"
                            >
                            Mengerti
                        </button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 mb-6 no-print">
                <div className="flex justify-between items-center">
                    <button onClick={onBack} className="flex items-center text-indigo-700 hover:text-slate-800 border border-white/50 bg-white/60 px-4 py-2 rounded-md text-xs font-bold transition-colors uppercase tracking-wider glow-card shadow-sm">
                        <ArrowLeft size={16} className="mr-2"/> KEMBALI
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleDownloadPDF} className="flex items-center glow-button px-6 py-2 rounded-md text-xs font-bold transition-colors uppercase tracking-wider">
                            <Download size={16} className="mr-2"/> EXPORT PDF
                        </button>
                    </div>
                </div>
            </div>
            <div ref={componentRef} className="glow-card w-full print-area p-4 sm:p-10 mt-4 rounded-xl text-slate-600 text-sm border border-white/50 relative bg-slate-50">
                {/* Decorative glow elements */}
                <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-indigo-100/50 rounded-full blur-[50px] pointer-events-none"></div>
                <div className="absolute bottom-[-50px] right-[-50px] w-32 h-32 bg-emerald-100/50 rounded-full blur-[50px] pointer-events-none"></div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b-2 border-slate-300 pb-6 mb-6 gap-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
                        <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                            <img src="/logo cbs.png" alt="Logo PT. Caraca Bintang Samudra" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800 uppercase leading-snug">PT. CARACA BINTANG SAMUDRA</h1>
                            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">Enterprise Maritime Supplier & Logistics</p>
                            <p className="text-xs text-slate-400 mt-2 max-w-sm">Jl. Pelabuhan Raya No. 88, Tanjung Priok<br/>Jakarta Utara, 14310<br/><span className="mt-1 inline-block"><strong className="font-bold text-indigo-700">T:</strong> (021) 555-0192 | <strong className="font-bold text-indigo-700">E:</strong> doc@caracabintang.com</span></p>
                        </div>
                    </div>
                    <div className="text-center md:text-right z-10 relative w-full md:w-auto">
                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-2 text-emerald-700 glow-text drop-shadow-[0_0_5px_rgba(4,192,202,0.4)]">{getTitle()}</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs glow-border p-3 rounded-lg bg-white/60 text-left w-full md:w-64 backdrop-blur-sm shadow-sm md:inline-grid">
                            <span className="font-bold text-indigo-700 uppercase text-[9px] tracking-wider leading-none">No. Dokumen</span>
                            <span className="font-bold text-slate-800 text-right drop-shadow-[0_0_3px_rgba(255,255,255,0.5)] leading-none">{sale.id}</span>
                            <span className="font-bold text-indigo-700 uppercase text-[9px] tracking-wider leading-none">Tanggal Cetak</span>
                            <span className="text-right font-medium text-slate-800 leading-none">{new Date(sale.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            {(type === 'invoice' || type === 'receipt') && (
                                <>
                                    <span className="font-bold text-indigo-700 uppercase text-[9px] tracking-wider leading-none">Term Payment</span>
                                    <span className="text-right font-bold text-emerald-700 leading-none">{sale.topDays ? `${sale.topDays} HARI` : 'CASH / LUNAS'}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Ke / Dari */}
                <div className="mb-8 p-4 sm:p-5 bg-white/60 rounded-lg glow-border backdrop-blur-sm relative z-10">
                    <p className="text-[10px] font-bold text-indigo-700 uppercase mb-2 tracking-widest border-b border-white/50 pb-2">{type === 'receipt' ? 'Telah terima dari:' : 'Kepada Yth Bill To:'}</p>
                    <p className="font-black text-lg text-slate-800 mt-2 glow-text">{customer?.name}</p>
                    <p className="text-xs font-bold text-slate-600 mt-1">Telp: {customer?.phone}</p>
                    <p className="text-xs text-slate-400">ID Entity: {customer?.id}</p>
                    
                    {type === 'receipt' && (
                        <div className="mt-4 pt-4 border-t border-white/50 bg-white/60 p-4 rounded glow-border">
                            <p className="text-xs font-bold text-indigo-700 uppercase">Sejumlah Uang Pembayaran:</p>
                            <p className="font-black italic text-2xl tracking-wide text-emerald-700 glow-text-purple mt-1">Rp {sale.total.toLocaleString('id-ID')}</p>
                            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Ref Transaksi: Pelunasan Invoice {sale.id}</p>
                        </div>
                    )}
                </div>

                {/* Mobile-first Product List Card / Desktop Table (Kecuali Kwitansi) */}
                {type !== 'receipt' && (
                    <div className="relative z-10">
                        {/* Mobile List View: Stacked and neat */}
                        <div className="block md:hidden space-y-3 mb-8">
                            <div className="bg-white/40 text-indigo-700 text-[10px] font-bold uppercase tracking-wider p-3 rounded-lg border border-indigo-100">
                                Detail Produk Pemasokan
                            </div>
                            {sale.items.map((item, idx) => {
                                const prod = products.find(p => p.id === item.productId);
                                return (
                                    <div key={idx} className="bg-white/65 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm text-xs space-y-2">
                                        <div className="flex justify-between items-start gap-3">
                                            <span className="font-bold text-slate-800 text-sm leading-tight">
                                                {idx + 1}. {prod?.name || item.productId}
                                            </span>
                                            <span className="bg-indigo-50 text-indigo-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded shrink-0">
                                                QTY: {item.quantity}
                                            </span>
                                        </div>
                                        {type === 'invoice' && (
                                            <div className="flex justify-between items-center bg-white/30 p-2 rounded border border-white/50 text-slate-600 mt-1">
                                                <span>Rate Satuan:</span>
                                                <span className="font-bold text-slate-700">Rp {item.price.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                        {type === 'invoice' && (
                                            <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                                                <span className="font-bold text-indigo-700">Subtotal:</span>
                                                <span className="font-black text-slate-800 text-sm text-right">Rp {item.total.toLocaleString('id-ID')}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {type === 'invoice' && (
                                <div className="bg-emerald-50/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200 shadow-sm flex justify-between items-center text-xs">
                                    <span className="font-bold uppercase tracking-widest text-indigo-700">Net Grand Total</span>
                                    <span className="font-black text-base text-emerald-700">Rp {sale.total.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block glow-border rounded-lg overflow-hidden mb-8">
                            <table className="w-full text-left border-collapse bg-white/60 backdrop-blur-sm">
                                <thead>
                                    <tr className="bg-white/60 text-indigo-700 text-[10px] uppercase font-bold tracking-wider border-b border-white/50">
                                        <th className="py-2.5 px-3 w-12 text-center border-r border-white/50">No</th>
                                        <th className="py-2.5 px-4 border-r border-white/50">Deskripsi Produk Pemasokan</th>
                                        <th className="py-2.5 px-3 text-center w-24 border-r border-white/50">QTY</th>
                                        {(type === 'invoice') && (
                                            <>
                                                <th className="py-2.5 px-4 text-right border-r border-white/50">Rate Satuan</th>
                                                <th className="py-2.5 px-4 text-right">Subtotal Harga</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/40 text-xs text-slate-600">
                                    {sale.items.map((item, idx) => {
                                        const prod = products.find(p => p.id === item.productId);
                                        return (
                                            <tr key={idx} className="hover:bg-white/40 transition-colors">
                                                <td className="py-3 px-3 text-center font-bold border-r border-white/50 text-indigo-700/50">{idx + 1}</td>
                                                <td className="py-3 px-4 font-bold border-r border-white/50 text-slate-800">{prod?.name || item.productId}</td>
                                                <td className="py-3 px-3 text-center font-bold border-r border-white/50 text-slate-800">{item.quantity}</td>
                                                {(type === 'invoice') && (
                                                    <>
                                                        <td className="py-3 px-4 text-right font-medium border-r border-white/50">Rp {item.price.toLocaleString('id-ID')}</td>
                                                        <td className="py-3 px-4 text-right font-bold text-slate-800 drop-shadow-[0_0_2px_rgba(255,255,255,0.3)]">Rp {item.total.toLocaleString('id-ID')}</td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                {type === 'invoice' && (
                                    <tfoot>
                                        <tr className="bg-white/60 border-t-2 border-white/50">
                                            <td colSpan={4} className="py-4 px-4 text-right font-bold text-xs uppercase tracking-widest text-indigo-700 glow-text">Net Grand Total Pembayaran</td>
                                            <td className="py-4 px-4 text-right font-black text-xl text-emerald-700 glow-text-purple">Rp {sale.total.toLocaleString('id-ID')}</td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer Signatures: Stacks gracefully on smaller mobile screens */}
                <div className="mt-12 flex flex-col sm:flex-row justify-between items-center gap-8 sm:gap-4 px-4 text-center text-xs relative z-10">
                    <div>
                        <p className="mb-12 sm:mb-24 font-bold text-slate-400">Hormat Kami,<br/><span className="text-[10px] uppercase tracking-widest text-indigo-700/70 mt-1 block">PT. Caraca Bintang Samudra</span></p>
                        <div className="border-t border-white/50 w-48 mx-auto pt-2">
                            <p className="font-bold uppercase text-indigo-700 glow-text text-[10px]">Authorized Finance / Admin</p>
                        </div>
                    </div>
                    
                    {type === 'bast' && (
                        <div>
                            <p className="mb-12 sm:mb-24 font-bold text-slate-400 leading-relaxed max-w-[200px] mx-auto text-center">Diterima Diatas Kapal Dalam Keadaan Baik Oleh:</p>
                            <div className="border-t border-white/50 w-56 mx-auto pt-2">
                                <p className="font-bold uppercase tracking-wider text-emerald-700 glow-text-purple text-[10px]">Kapten Kapal / Chief Engineer</p>
                                <p className="text-[9px] text-indigo-700/50 mt-1 uppercase">(Nama Jelas & Stempel Kapal Resmi)</p>
                            </div>
                        </div>
                    )}
                    
                    {type === 'do' && (
                        <div>
                            <p className="mb-12 sm:mb-24 font-bold text-slate-400">Penerima Barang Dokumen,</p>
                            <div className="border-t border-white/50 w-48 mx-auto pt-2">
                                <p className="font-bold uppercase text-emerald-700 glow-text-purple text-[10px]">Ttd Pihak Customer</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
