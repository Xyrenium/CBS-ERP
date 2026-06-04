import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store';
import { JournalEntry } from '../types';
import { ClipboardList, Filter, BookOpen, PlusSquare, AlertTriangle, Printer, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export function AccountingModule() {
  const { accounts, journalEntries, addJournalEntry } = useStore();
  const [activeTab, setActiveTab] = useState<'coa' | 'quick_transaction' | 'journal' | 'reports'>('coa');
  
  // Manual Journal Form State
  const [jDate, setJDate] = useState(new Date().toISOString().split('T')[0]);
  const [jDesc, setJDesc] = useState('');
  const [rows, setRows] = useState<{acc: string, type: 'D'|'K', amount: number}[]>([{acc: '1-1000', type: 'D', amount: 0}, {acc: '1-2000', type: 'K', amount: 0}]);

  // Quick Transaction Form State
  const [qtCategory, setQtCategory] = useState<string>('1-1000'); // Default: Kas & Bank
  const [qtAction, setQtAction] = useState<string>('masuk');
  const [qtAmount, setQtAmount] = useState<number>(0);
  const [qtDate, setQtDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [qtMemo, setQtMemo] = useState<string>('');
  const [qtCounterAcc, setQtCounterAcc] = useState<string>('3-1000');

  // Sub-tab within Quick Transaction State
  const [subTxType, setSubTxType] = useState<'operasional' | 'lainnya'>('operasional');

  // Other Transaction (Pemasukan & Pengeluaran Lain-lain) Form State
  const [othTxMode, setOthTxMode] = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [othTxType, setOthTxType] = useState<string>('asset_sale');
  const [othTxAmount, setOthTxAmount] = useState<number>(0);
  const [othTxDate, setOthTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [othTxMemo, setOthTxMemo] = useState<string>('');

  // Automatically adjust other transaction type based on mode selection
  useEffect(() => {
    if (othTxMode === 'pemasukan') {
      setOthTxType('asset_sale');
    } else {
      setOthTxType('tax');
    }
  }, [othTxMode]);

  // Automatically adjust action and counterpart options based on selected account category
  useEffect(() => {
    switch (qtCategory) {
      case '1-1000': // Kas & Bank
        setQtAction('masuk');
        setQtCounterAcc('3-1000'); // Modal & Laba Ditahan
        break;
      case '1-2000': // Piutang Usaha
        setQtAction('pelunasan');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      case '2-1000': // Hutang Usaha
        setQtAction('bayar');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      case '1-3000': // Persediaan
        setQtAction('tambah');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      case '4-1000': // Penjualan
        setQtAction('tunai');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      case '5-2000': // Pembelian
        setQtAction('tunai');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      case '6-1000': // Biaya Operasional
        setQtAction('bayar');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      case '3-1000': // Modal & Laba Ditahan
        setQtAction('setor');
        setQtCounterAcc('1-1000'); // Kas & Bank
        break;
      default:
        break;
    }
  }, [qtCategory]);

  const getActionsForCategory = (cat: string) => {
    switch (cat) {
      case '1-1000':
        return [
          { value: 'masuk', label: 'Uang Masuk / Penerimaan Kas' },
          { value: 'keluar', label: 'Uang Keluar / Pengeluaran Kas' }
        ];
      case '1-2000':
        return [
          { value: 'pelunasan', label: 'Penerimaan Pelunasan Piutang Usaha' },
          { value: 'timbul', label: 'Pencatatan Piutang Usaha Baru' }
        ];
      case '2-1000':
        return [
          { value: 'bayar', label: 'Pembayaran Pelunasan Hutang' },
          { value: 'timbul', label: 'Pencatatan Hutang Usaha Baru' }
        ];
      case '1-3000':
        return [
          { value: 'tambah', label: 'Penambahan Persediaan (Stok Masuk)' },
          { value: 'kurang', label: 'Pengurangan Persediaan (Pemakaian/Kerusakan)' }
        ];
      case '4-1000':
        return [
          { value: 'tunai', label: 'Penjualan Tunai (Seketika)' },
          { value: 'kredit', label: 'Penjualan Kredit (Tempo/Invoice)' }
        ];
      case '5-2000':
        return [
          { value: 'tunai', label: 'Pembelian Tunai' },
          { value: 'kredit', label: 'Pembelian Kredit' }
        ];
      case '6-1000':
        return [
          { value: 'bayar', label: 'Pembayaran Biaya Operasional' }
        ];
      case '3-1000':
        return [
          { value: 'setor', label: 'Penyetoran Modal Pemilik (Tunai)' },
          { value: 'prive', label: 'Penarikan Dividen / Prive Pemilik' }
        ];
      default:
        return [];
    }
  };

  const getCounterAccountsForCategory = (cat: string, act: string) => {
    if (cat === '1-1000') {
      return act === 'masuk' 
        ? accounts.filter(a => ['3-1000', '4-1000', '1-2000'].includes(a.code))
        : accounts.filter(a => ['6-1000', '1-3000', '2-1000', '5-2000'].includes(a.code));
    }
    if (cat === '1-2000') {
      return act === 'pelunasan'
        ? accounts.filter(a => ['1-1000'].includes(a.code))
        : accounts.filter(a => ['4-1000'].includes(a.code));
    }
    if (cat === '2-1000') {
      return act === 'bayar'
        ? accounts.filter(a => ['1-1000'].includes(a.code))
        : accounts.filter(a => ['5-2000', '6-1000', '1-3000'].includes(a.code));
    }
    if (cat === '1-3000') {
      return act === 'tambah'
        ? accounts.filter(a => ['1-1000', '2-1000'].includes(a.code))
        : accounts.filter(a => ['5-1000', '6-1000'].includes(a.code));
    }
    if (cat === '4-1000') {
      return act === 'tunai'
        ? accounts.filter(a => ['1-1000'].includes(a.code))
        : accounts.filter(a => ['1-2000'].includes(a.code));
    }
    if (cat === '5-2000') {
      return act === 'tunai'
        ? accounts.filter(a => ['1-1000'].includes(a.code))
        : accounts.filter(a => ['2-1000'].includes(a.code));
    }
    if (cat === '6-1000') {
      return accounts.filter(a => ['1-1000', '2-1000'].includes(a.code));
    }
    if (cat === '3-1000') {
      return accounts.filter(a => ['1-1000'].includes(a.code));
    }
    return accounts;
  };

  const getAutoJournalArgs = (
    category: string,
    action: string,
    amount: number,
    date: string,
    memo: string,
    counterAcc: string
  ) => {
    let debits: { accountCode: string, amount: number }[] = [];
    let credits: { accountCode: string, amount: number }[] = [];
    let generatedMemo = memo;

    switch (category) {
      case '1-1000': // Kas & Bank
        if (action === 'masuk') {
          debits = [{ accountCode: '1-1000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = `Terima kas dari ${accounts.find(a => a.code === counterAcc)?.name || 'Akun Lain'}`;
        } else {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '1-1000', amount }];
          if (!memo) generatedMemo = `Pengeluaran kas untuk ${accounts.find(a => a.code === counterAcc)?.name || 'Akun Lain'}`;
        }
        break;

      case '1-2000': // Piutang Usaha
        if (action === 'pelunasan') {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '1-2000', amount }];
          if (!memo) generatedMemo = 'Penerimaan Pelunasan Piutang Usaha';
        } else {
          debits = [{ accountCode: '1-2000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = 'Pencatatan Piutang Usaha (Penjualan Kredit)';
        }
        break;

      case '2-1000': // Hutang Usaha
        if (action === 'bayar') {
          debits = [{ accountCode: '2-1000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = 'Pembayaran Pelunasan Hutang Usaha';
        } else {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '2-1000', amount }];
          if (!memo) generatedMemo = `Pencatatan Hutang Usaha Baru (${accounts.find(a => a.code === counterAcc)?.name})`;
        }
        break;

      case '1-3000': // Persediaan
        if (action === 'tambah') {
          debits = [{ accountCode: '1-3000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = 'Pembelian Persediaan Barang';
        } else {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '1-3000', amount }];
          if (!memo) generatedMemo = 'Opname Persediaan / Pengurangan Stok';
        }
        break;

      case '4-1000': // Penjualan
        if (action === 'tunai') {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '4-1000', amount }];
          if (!memo) generatedMemo = 'Pencatatan Penjualan Tunai';
        } else {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '4-1000', amount }];
          if (!memo) generatedMemo = 'Pencatatan Penjualan Kredit';
        }
        break;

      case '5-2000': // Pembelian
        if (action === 'tunai') {
          debits = [{ accountCode: '5-2000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = 'Pencatatan Pembelian Secara Tunai';
        } else {
          debits = [{ accountCode: '5-2000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = 'Pencatatan Pembelian Secara Kredit';
        }
        break;

      case '6-1000': // Biaya Operasional
        debits = [{ accountCode: '6-1000', amount }];
        credits = [{ accountCode: counterAcc, amount }];
        if (!memo) generatedMemo = `Pembayaran Biaya Operasional via ${accounts.find(a => a.code === counterAcc)?.name}`;
        break;

      case '3-1000': // Modal & Laba Ditahan
        if (action === 'setor') {
          debits = [{ accountCode: counterAcc, amount }];
          credits = [{ accountCode: '3-1000', amount }];
          if (!memo) generatedMemo = 'Penyetoran Modal Pemilik';
        } else {
          debits = [{ accountCode: '3-1000', amount }];
          credits = [{ accountCode: counterAcc, amount }];
          if (!memo) generatedMemo = 'Penarikan Dividen / Prive Pemilik';
        }
        break;

      default:
        break;
    }

    return { debits, credits, description: generatedMemo };
  };

  const handleQuickTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qtAmount <= 0) {
      alert('Nominal transaksi harus lebih besar dari Nol.');
      return;
    }

    const { debits, credits, description } = getAutoJournalArgs(
      qtCategory,
      qtAction,
      qtAmount,
      qtDate,
      qtMemo,
      qtCounterAcc
    );

    if (debits.length === 0 || credits.length === 0) {
      alert('Gagal memproses jurnal otomatis. Periksa konfigurasi akun.');
      return;
    }

    addJournalEntry({
      id: `J-AUTO-${Date.now()}`,
      date: qtDate,
      description,
      debits,
      credits
    });

    alert(`Transaksi berhasil! Sistem telah otomatis membuat jurnal dan mempostingnya ke Buku Besar & Laporan Keuangan.`);
    setQtAmount(0);
    setQtMemo('');
  };

  const getOtherJournalArgs = (
    mode: 'pemasukan' | 'pengeluaran',
    type: string,
    amount: number,
    date: string,
    memo: string
  ) => {
    let debits: { accountCode: string; amount: number }[] = [];
    let credits: { accountCode: string; amount: number }[] = [];
    let generatedMemo = memo;

    if (mode === 'pemasukan') {
      debits = [{ accountCode: '1-1000', amount }];
      if (type === 'asset_sale') {
        credits = [{ accountCode: '1-4000', amount }];
        if (!memo) generatedMemo = 'Penerimaan Kas - Penjualan Aktiva Tetap';
      } else if (type === 'loan') {
        credits = [{ accountCode: '2-2000', amount }];
        if (!memo) generatedMemo = 'Penerimaan Kas - Pinjaman Dana Bank';
      } else if (type === 'capital') {
        credits = [{ accountCode: '3-1000', amount }];
        if (!memo) generatedMemo = 'Penerimaan Kas - Penanaman Modal / Investasi Pemilik';
      } else {
        credits = [{ accountCode: '4-2000', amount }];
        if (!memo) generatedMemo = 'Penerimaan Kas - Lain-Lain Non-Operasional';
      }
    } else {
      credits = [{ accountCode: '1-1000', amount }];
      if (type === 'tax') {
        debits = [{ accountCode: '6-2000', amount }];
        if (!memo) generatedMemo = 'Pengeluaran Kas - Pembayaran Pajak Perusahaan';
      } else if (type === 'asset_buy') {
        debits = [{ accountCode: '1-4000', amount }];
        if (!memo) generatedMemo = 'Pengeluaran Kas - Pembelian Aktiva Tetap';
      } else if (type === 'installment') {
        debits = [{ accountCode: '2-2000', amount }];
        if (!memo) generatedMemo = 'Pengeluaran Kas - Pembayaran Cicilan Pinjaman Bank';
      } else {
        debits = [{ accountCode: '3-2000', amount }];
        if (!memo) generatedMemo = 'Pengeluaran Kas - Pembagian Dividen Pemegang Saham';
      }
    }

    return { debits, credits, description: generatedMemo };
  };

  const handleOtherTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (othTxAmount <= 0) {
      alert('Nominal transaksi harus lebih besar dari Nol.');
      return;
    }

    const { debits, credits, description } = getOtherJournalArgs(
      othTxMode,
      othTxType,
      othTxAmount,
      othTxDate,
      othTxMemo
    );

    if (debits.length === 0 || credits.length === 0) {
      alert('Gagal memproses jurnal otomatis. Periksa konfigurasi akun.');
      return;
    }

    addJournalEntry({
      id: `J-AUTO-${Date.now()}`,
      date: othTxDate,
      description,
      debits,
      credits
    });

    alert(`Transaksi kas lainnya berhasil dibukukan! Jurnal otomatis Debit-Kredit telah terposting.`);
    setOthTxAmount(0);
    setOthTxMemo('');
  };

  // Ledger Filter State
  const [ledgerAccount, setLedgerAccount] = useState<string>('ALL');
  const [ledgerPeriod, setLedgerPeriod] = useState<string>('');

  // Sandbox Iframe State & PDF Export
  const [isInIframe, setIsInIframe] = useState(false);
  const [showIframeAlert, setShowIframeAlert] = useState(false);
  
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
        try {
            setIsInIframe(window.self !== window.top);
        } catch (e) {
            setIsInIframe(true);
        }
  }, []);

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
      window.print();
  };

  const updateJRow = (idx: number, field: string, val: any) => {
      const newRows = [...rows];
      newRows[idx] = { ...newRows[idx], [field]: val };
      setRows(newRows);
  };

  const handleJournalSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      let totalD = rows.filter(r => r.type === 'D').reduce((s, r) => s + r.amount, 0);
      let totalK = rows.filter(r => r.type === 'K').reduce((s, r) => s + r.amount, 0);
      
      if(totalD !== totalK || totalD === 0) {
          alert('Debet dan Kredit harus SEIMBANG (Balance) dan tidak boleh Nol.');
          return;
      }
      
      const debits = rows.filter(r => r.type === 'D').map(r => ({ accountCode: r.acc, amount: r.amount }));
      const credits = rows.filter(r => r.type === 'K').map(r => ({ accountCode: r.acc, amount: r.amount }));
      
      addJournalEntry({
          id: `J-MAN-${Date.now()}`,
          date: jDate,
          description: jDesc,
          debits,
          credits
      });
      alert('Jurnal manual berhasil diposting!');
      setRows([{acc: '1-1000', type: 'D', amount: 0}, {acc: '1-2000', type: 'K', amount: 0}]);
      setJDesc('');
  };

  // Report Calculations
  const assetBalance = accounts.filter(a => a.type === 'Asset').reduce((s, a) => s + a.balance, 0);
  const liabilityBalance = accounts.filter(a => a.type === 'Liability').reduce((s, a) => s + a.balance, 0);
  const equityBalance = accounts.filter(a => a.type === 'Equity').reduce((s, a) => s + a.balance, 0);
  const revenueBalance = accounts.filter(a => a.type === 'Revenue').reduce((s, a) => s + a.balance, 0);
  const expenseBalance = accounts.filter(a => a.type === 'Expense').reduce((s, a) => s + a.balance, 0);
  const retainedEarnings = revenueBalance - expenseBalance;
  
  // Realtime balance check
  const isBalanced = assetBalance === (liabilityBalance + equityBalance + retainedEarnings);

  const filteredJournals = journalEntries.filter(entry => {
      if (ledgerPeriod && !entry.date.startsWith(ledgerPeriod)) return false;
      if (ledgerAccount !== 'ALL') {
          const hasAccount = entry.debits.some(d => d.accountCode === ledgerAccount) || entry.credits.some(c => c.accountCode === ledgerAccount);
          if (!hasAccount) return false;
      }
      return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
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

      <div className="flex justify-between items-center no-print px-2">
        <div>
           <h2 className="text-xl font-bold text-slate-800 glow-text">Modul Akuntansi & Finance</h2>
           <p className="text-xs text-indigo-700 mt-1 opacity-80">Core general ledger system & reporting</p>
        </div>
      </div>

      <div className="glow-card rounded-xl overflow-hidden print-area">
          <div className="flex border-b border-white/50 bg-white/60 no-print px-4 pt-4 gap-2 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('quick_transaction')} 
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'quick_transaction' ? 'bg-indigo-100/80 text-indigo-700 border-t border-x border-white/50 mb-[-1px] glow-text' : 'text-slate-400 hover:text-slate-800'}`}
              >
                  🟢 Input Transaksi
              </button>
              <button 
                onClick={() => setActiveTab('coa')} 
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'coa' ? 'bg-indigo-100/80 text-indigo-700 border-t border-x border-white/50 mb-[-1px] glow-text' : 'text-slate-400 hover:text-slate-800'}`}
              >
                  Chart of Accounts
              </button>
              <button 
                onClick={() => setActiveTab('journal')} 
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'journal' ? 'bg-indigo-100/80 text-indigo-700 border-t border-x border-white/50 mb-[-1px] glow-text' : 'text-slate-400 hover:text-slate-800'}`}
              >
                  Journal & GL
              </button>
              <button 
                onClick={() => setActiveTab('reports')} 
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors whitespace-nowrap ${activeTab === 'reports' ? 'bg-indigo-100/80 text-indigo-700 border-t border-x border-white/50 mb-[-1px] glow-text' : 'text-slate-400 hover:text-slate-800'}`}
              >
                  Financial Reports
              </button>
          </div>

          <div className="p-3 sm:p-6 pb-6">
              {activeTab === 'quick_transaction' && (
                  <div className="space-y-6">
                      <div className="border-b border-white/45 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                              <h3 className="text-sm font-bold text-slate-800 glow-text">Pencatatan Transaksi & Jurnal Otomatis</h3>
                              <p className="text-[11px] text-indigo-700 opacity-85 mt-0.5">Input aktivitas keuangan Anda di bawah ini. Sistem ERP akan otomatis menerjemahkan dan membukukannya ke dalam Jurnal Umum ganda (Debit-Kredit) secara balance.</p>
                          </div>
                          
                          {/* Sub Tabs Selection */}
                          <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-300/30 gap-1 self-start sm:self-center shrink-0">
                              <button
                                  type="button"
                                  onClick={() => setSubTxType('operasional')}
                                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${subTxType === 'operasional' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                              >
                                  💼 Operasional Utama
                              </button>
                              <button
                                  type="button"
                                  onClick={() => setSubTxType('lainnya')}
                                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-all ${subTxType === 'lainnya' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-850'}`}
                              >
                                  📊 Transaksi Kas Lainnya
                              </button>
                          </div>
                      </div>

                      {subTxType === 'operasional' ? (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                              {/* L: The Input Form */}
                              <div className="lg:col-span-6 bg-white/40 p-6 rounded-xl border border-white/50 shadow-sm space-y-4">
                                  <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-2">Formulir Catat Transaksi</h4>
                                  <form onSubmit={handleQuickTransactionSubmit} className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Tanggal Transaksi</label>
                                              <input 
                                                  type="date" 
                                                  required 
                                                  value={qtDate} 
                                                  onChange={e => setQtDate(e.target.value)} 
                                                  className="w-full px-3 py-2 glow-input rounded-md text-xs font-semibold text-slate-700"
                                              />
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Klasifikasi Akun Utama</label>
                                              <select 
                                                  value={qtCategory} 
                                                  onChange={e => setQtCategory(e.target.value)} 
                                                  className="w-full px-3 py-2 glow-input rounded-md text-xs font-semibold text-indigo-700 bg-white/70 cursor-pointer"
                                              >
                                                  <option value="1-1000">Kas & Bank (1-1000)</option>
                                                  <option value="1-2000">Piutang Usaha (1-2000)</option>
                                                  <option value="2-1000">Hutang Usaha (2-1000)</option>
                                                  <option value="1-3000">Persediaan Barang (1-3000)</option>
                                                  <option value="4-1000">Akun Penjualan (4-1000)</option>
                                                  <option value="5-2000">Akun Pembelian (5-2000)</option>
                                                  <option value="6-1000">Biaya Operasional (6-1000)</option>
                                                  <option value="3-1000">Modal & Laba Ditahan (3-1000)</option>
                                              </select>
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Aktivitas penambahan / pengurangan</label>
                                              <select 
                                                  value={qtAction} 
                                                  onChange={e => setQtAction(e.target.value)} 
                                                  className="w-full px-3 py-2 glow-input rounded-md text-xs font-semibold text-slate-700 bg-white/70 cursor-pointer"
                                              >
                                                  {getActionsForCategory(qtCategory).map(act => (
                                                      <option key={act.value} value={act.value}>{act.label}</option>
                                                  ))}
                                              </select>
                                          </div>

                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Sandingkan dengan (Akun Lawan)</label>
                                              <select 
                                                  value={qtCounterAcc} 
                                                  onChange={e => setQtCounterAcc(e.target.value)} 
                                                  className="w-full px-3 py-2 glow-input rounded-md text-xs font-semibold text-slate-700 bg-white/70 cursor-pointer"
                                              >
                                                  {getCounterAccountsForCategory(qtCategory, qtAction).map(acc => (
                                                      <option key={acc.code} value={acc.code}>{acc.name} ({acc.code})</option>
                                                  ))}
                                              </select>
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-1 gap-4">
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Nominal Transaksi (Rp)</label>
                                              <div className="relative">
                                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                      <span className="text-slate-400 font-bold text-xs">Rp</span>
                                                  </div>
                                                  <input 
                                                      type="number" 
                                                      required 
                                                      min="1" 
                                                      value={qtAmount || ''} 
                                                      onChange={e => setQtAmount(parseInt(e.target.value) || 0)} 
                                                      placeholder="Masukkan jumlah rupiah"
                                                      className="w-full pl-8 pr-3 py-2.5 glow-input rounded-md text-xs font-bold text-emerald-700"
                                                  />
                                              </div>
                                          </div>
                                      </div>

                                      <div>
                                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Catatan / Memo Keterangan (Opsional)</label>
                                          <input 
                                              type="text" 
                                              value={qtMemo} 
                                              onChange={e => setQtMemo(e.target.value)} 
                                              placeholder="Contoh: Pembayaran internet kantor, dll. Kosongkan untuk memo otomatis."
                                              className="w-full px-3 py-2 glow-input rounded-md text-xs text-slate-600"
                                          />
                                      </div>

                                      <button 
                                          type="submit" 
                                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider"
                                      >
                                          SIMPAN & POSTING KE JURNAL
                                      </button>
                                  </form>
                              </div>

                              {/* R: Live preview */}
                              <div className="lg:col-span-6 bg-slate-900/5 p-6 rounded-xl border border-dashed border-indigo-200 flex flex-col justify-between">
                                  <div>
                                      <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                          <span>🔮 Live Blueprint Ayat Jurnal Otomatis</span>
                                      </h4>
                                      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                                          Sistem akuntansi menggunakan sistem pencatatan berpasangan. Berikut bocoran ayat jurnal yang akan terbentuk saat tombol simpan ditekan:
                                      </p>

                                      <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs shadow-sm shadow-indigo-100 space-y-3">
                                          <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-2 flex-wrap gap-2">
                                              <div>
                                                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">J-AUTO-TEMPLATE</span>
                                                  <p className="text-[9px] text-slate-400 mt-1">Tanggal: {qtDate}</p>
                                              </div>
                                              <div className="text-right">
                                                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">AUTO MATCH</span>
                                              </div>
                                          </div>
                                          
                                          <div>
                                              <p className="text-[10px] text-slate-400">Memo Deskripsi:</p>
                                              <p className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">
                                                  {getAutoJournalArgs(qtCategory, qtAction, qtAmount || 1000000, qtDate, qtMemo, qtCounterAcc).description}
                                              </p>
                                          </div>

                                          <div className="pt-2">
                                              <table className="w-full text-left text-[11px]">
                                                  <thead>
                                                      <tr className="text-[9px] text-slate-400 border-b border-slate-100">
                                                          <th className="pb-1">Nama Rekening Ledger</th>
                                                          <th className="pb-1 text-right">Debit (D)</th>
                                                          <th className="pb-1 text-right">Kredit (K)</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100">
                                                      {getAutoJournalArgs(qtCategory, qtAction, qtAmount || 1000000, qtDate, qtMemo, qtCounterAcc).debits.map(d => (
                                                          <tr key={`deb-${d.accountCode}`} className="text-indigo-700 font-bold">
                                                              <td className="py-2.5">{accounts.find(a => a.code === d.accountCode)?.name} ({d.accountCode})</td>
                                                              <td className="py-2.5 text-right">Rp {d.amount.toLocaleString('id-ID')}</td>
                                                              <td className="py-2.5 text-right">-</td>
                                                          </tr>
                                                      ))}
                                                      {getAutoJournalArgs(qtCategory, qtAction, qtAmount || 1000000, qtDate, qtMemo, qtCounterAcc).credits.map(c => (
                                                          <tr key={`cred-${c.accountCode}`} className="text-slate-600">
                                                              <td className="py-2.5 pl-4 flex items-center gap-1">
                                                                  <ArrowRight size={10} className="text-slate-400 shrink-0"/>
                                                                  <span>{accounts.find(a => a.code === c.accountCode)?.name} ({c.accountCode})</span>
                                                              </td>
                                                              <td className="py-2.5 text-right">-</td>
                                                              <td className="py-2.5 text-right font-bold text-emerald-700">Rp {c.amount.toLocaleString('id-ID')}</td>
                                                          </tr>
                                                      ))}
                                                  </tbody>
                                              </table>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
                              {/* L: The Input Form (Lainnya) */}
                              <div className="lg:col-span-6 bg-white/40 p-6 rounded-xl border border-white/50 shadow-sm space-y-4">
                                  <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-2 border-b border-indigo-100 pb-2">Formulir Kas Non-Operasional</h4>
                                  
                                  <form onSubmit={handleOtherTransactionSubmit} className="space-y-4">
                                      {/* Mode: Pemasukan vs Pengeluaran */}
                                      <div>
                                          <label className="block text-[10px] font-bold text-slate-750 uppercase mb-1.5">Klasifikasi Aliran Kas</label>
                                          <div className="grid grid-cols-2 gap-2">
                                              <button
                                                  type="button"
                                                  onClick={() => setOthTxMode('pemasukan')}
                                                  className={`py-2 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${othTxMode === 'pemasukan' ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm' : 'bg-white/50 text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                              >
                                                  📥 Kas Masuk (Inflow)
                                              </button>
                                              <button
                                                  type="button"
                                                  onClick={() => setOthTxMode('pengeluaran')}
                                                  className={`py-2 text-xs font-bold rounded-lg border uppercase tracking-wider transition-all ${othTxMode === 'pengeluaran' ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm' : 'bg-white/50 text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                              >
                                                  📤 Kas Keluar (Outflow)
                                              </button>
                                          </div>
                                      </div>

                                      {/* Type Dropdown */}
                                      <div>
                                          <label className="block text-[10px] font-bold text-slate-750 uppercase mb-1">Kategori Pencatatan</label>
                                          <select
                                              value={othTxType}
                                              onChange={e => setOthTxType(e.target.value)}
                                              className="w-full px-3 py-2.5 glow-input rounded-md text-xs font-bold text-slate-700 bg-white/70 cursor-pointer"
                                          >
                                              {othTxMode === 'pemasukan' ? (
                                                  <>
                                                      <option value="asset_sale">Penjualan Aktiva Tetap (Asset Sale)</option>
                                                      <option value="loan">Terima Pinjaman Bank / Pihak Ketiga (Loans)</option>
                                                      <option value="capital">Penanaman Modal / Setor Investasi (Capital)</option>
                                                      <option value="other_recv">Penerimaan Lain-Lain (Other Receipts)</option>
                                                  </>
                                              ) : (
                                                  <>
                                                      <option value="tax">Pembayaran Pajak Badan (Tax Payment)</option>
                                                      <option value="asset_buy">Pembelian Aktiva Tetap Baru (Asset Purchase)</option>
                                                      <option value="installment">Pembayaran Angsuran Pinjaman (Loan Installment)</option>
                                                      <option value="dividend">Pembagian Dividen / Penarikan Prive (Dividend)</option>
                                                  </>
                                              )}
                                          </select>
                                      </div>

                                      {/* Date and Amount */}
                                      <div className="grid grid-cols-2 gap-4">
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-750 uppercase mb-1">Tanggal Bayar</label>
                                              <input
                                                  type="date"
                                                  required
                                                  value={othTxDate}
                                                  onChange={e => setOthTxDate(e.target.value)}
                                                  className="w-full px-3 py-2 glow-input rounded-md text-xs font-semibold text-slate-700"
                                              />
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-bold text-slate-750 uppercase mb-1">Nominal Transaksi (Rp)</label>
                                              <div className="relative">
                                                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                      <span className="text-slate-400 font-bold text-xs">Rp</span>
                                                  </div>
                                                  <input
                                                      type="number"
                                                      required
                                                      min="1"
                                                      value={othTxAmount || ''}
                                                      onChange={e => setOthTxAmount(parseInt(e.target.value) || 0)}
                                                      placeholder="Jumlah uang..."
                                                      className="w-full pl-8 pr-3 py-2 glow-input rounded-md text-xs font-bold text-emerald-700"
                                                  />
                                              </div>
                                          </div>
                                      </div>

                                      {/* Memo */}
                                      <div>
                                          <label className="block text-[10px] font-bold text-slate-755 uppercase mb-1">Catatan Keterangan / Memo</label>
                                          <input
                                              type="text"
                                              value={othTxMemo}
                                              onChange={e => setOthTxMemo(e.target.value)}
                                              placeholder="Contoh: Setoran modal pemegang saham PT CBS, Pembayaran pajak PPN dll"
                                              className="w-full px-3 py-2 glow-input rounded-md text-xs text-slate-600"
                                          />
                                      </div>

                                      <button
                                          type="submit"
                                          className="w-full bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-3 px-4 rounded-lg shadow-md transition-all active:scale-95 text-xs uppercase tracking-wider"
                                      >
                                          BUKUKAN TRANSAKSI CAS LAINNYA
                                      </button>
                                  </form>
                              </div>

                              {/* R: Live Blueprint Area */}
                              <div className="lg:col-span-6 bg-slate-900/5 p-6 rounded-xl border border-dashed border-indigo-200 flex flex-col justify-between">
                                  <div>
                                      <h4 className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                          <span>🔮 Live Blueprint Ayat Jurnal Otomatis</span>
                                      </h4>
                                      <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                                          Sistem akuntansi menggunakan sistem pencatatan berpasangan. Berikut bocoran ayat jurnal yang akan terbentuk saat tombol simpan ditekan:
                                      </p>

                                      <div className="bg-white border border-slate-200 rounded-lg p-4 font-mono text-xs shadow-sm shadow-indigo-100 space-y-3">
                                          <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-2 flex-wrap gap-2">
                                              <div>
                                                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">J-AUX-TEMPLATE</span>
                                                  <p className="text-[9px] text-slate-400 mt-1">Tanggal: {othTxDate}</p>
                                              </div>
                                              <div className="text-right">
                                                  <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">AUTO MATCH</span>
                                              </div>
                                          </div>
                                          
                                          <div>
                                              <p className="text-[10px] text-slate-400">Memo Deskripsi:</p>
                                              <p className="text-[11px] font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded mt-0.5">
                                                  {getOtherJournalArgs(othTxMode, othTxType, othTxAmount || 1000000, othTxDate, othTxMemo).description}
                                              </p>
                                          </div>

                                          <div className="pt-2">
                                              <table className="w-full text-left text-[11px]">
                                                  <thead>
                                                      <tr className="text-[9px] text-slate-400 border-b border-slate-100">
                                                          <th className="pb-1">Nama Rekening Ledger</th>
                                                          <th className="pb-1 text-right">Debit (D)</th>
                                                          <th className="pb-1 text-right">Kredit (K)</th>
                                                      </tr>
                                                  </thead>
                                                  <tbody className="divide-y divide-slate-100">
                                                      {getOtherJournalArgs(othTxMode, othTxType, othTxAmount || 1000000, othTxDate, othTxMemo).debits.map(d => (
                                                          <tr key={`deb-${d.accountCode}`} className="text-indigo-700 font-bold">
                                                              <td className="py-2.5">{accounts.find(a => a.code === d.accountCode)?.name} ({d.accountCode})</td>
                                                              <td className="py-2.5 text-right">Rp {d.amount.toLocaleString('id-ID')}</td>
                                                              <td className="py-2.5 text-right">-</td>
                                                          </tr>
                                                      ))}
                                                      {getOtherJournalArgs(othTxMode, othTxType, othTxAmount || 1000000, othTxDate, othTxMemo).credits.map(c => (
                                                          <tr key={`cred-${c.accountCode}`} className="text-slate-600">
                                                              <td className="py-2.5 pl-4 flex items-center gap-1">
                                                                  <ArrowRight size={10} className="text-slate-400 shrink-0"/>
                                                                  <span>{accounts.find(a => a.code === c.accountCode)?.name} ({c.accountCode})</span>
                                                              </td>
                                                              <td className="py-2.5 text-right">-</td>
                                                              <td className="py-2.5 text-right font-bold text-emerald-700">Rp {c.amount.toLocaleString('id-ID')}</td>
                                                          </tr>
                                                      ))}
                                                  </tbody>
                                              </table>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      )}
                  </div>
              )}

              {activeTab === 'coa' && (() => {
                  const tAssets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
                  const tLiabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);
                  const tEquity = accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + a.balance, 0);
                  const tRevenue = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + a.balance, 0);
                  const tExpense = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + a.balance, 0);

                  const kasVal = accounts.find(a => a.code === '1-1000')?.balance || 0;
                  const piutangVal = accounts.find(a => a.code === '1-2000')?.balance || 0;
                  const stokVal = accounts.find(a => a.code === '1-3000')?.balance || 0;

                  const kasPct = Math.round((kasVal / (tAssets || 1)) * 100);
                  const piutangPct = Math.round((piutangVal / (tAssets || 1)) * 100);
                  const stokPct = Math.round((stokVal / (tAssets || 1)) * 100);

                  const debtPct = Math.min(Math.round((tLiabilities / ((tLiabilities + tEquity) || 1)) * 100), 100);
                  const equityPct = 100 - debtPct;

                  return (
                  <div className="space-y-6">
                      <div className="mb-2 flex justify-between items-center">
                          <div>
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider glow-text">Standard Chart of Accounts (CoA)</h4>
                              <p className="text-[10px] text-indigo-700 opacity-80 mt-0.5">Struktur klasifikasi rekening transaksi keuangan terintegrasi</p>
                          </div>
                      </div>

                      {/* Interactive Visual Dashboard Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Financial Formula Card: Assets Breakdown */}
                          <div className="glow-card p-5 rounded-xl bg-white/40 space-y-3 relative overflow-hidden">
                              <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Aset Lancar & Likuiditas</h5>
                              <div className="text-lg font-black text-[#03a0a8]">Rp {tAssets.toLocaleString('id-ID')}</div>
                              
                              <div className="space-y-2 pt-2">
                                  {/* Cash */}
                                  <div>
                                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                          <span>Kas & Bank</span>
                                          <span>Rp {kasVal.toLocaleString('id-ID')} ({kasPct}%)</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-[#04c0ca]" style={{ width: `${kasPct}%` }}></div>
                                      </div>
                                  </div>
                                  {/* Piutang */}
                                  <div>
                                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                          <span>Piutang Dagang</span>
                                          <span>Rp {piutangVal.toLocaleString('id-ID')} ({piutangPct}%)</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-cyan-400" style={{ width: `${piutangPct}%` }}></div>
                                      </div>
                                  </div>
                                  {/* Persediaan */}
                                  <div>
                                      <div className="flex justify-between text-[9px] font-bold text-slate-500">
                                          <span>Persediaan Barang</span>
                                          <span>Rp {stokVal.toLocaleString('id-ID')} ({stokPct}%)</span>
                                      </div>
                                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div className="h-full bg-teal-500" style={{ width: `${stokPct}%` }}></div>
                                      </div>
                                  </div>
                              </div>
                          </div>

                          {/* Financing Mix: Liabilities vs Equity */}
                          <div className="glow-card p-5 rounded-xl bg-white/40 space-y-3 relative overflow-hidden flex flex-col justify-between">
                              <div>
                                  <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Sumber Pendanaan (Liabilities + Equity)</h5>
                                  <div className="text-lg font-black text-slate-800">Rp {(tLiabilities + tEquity).toLocaleString('id-ID')}</div>
                              </div>

                              <div className="space-y-3">
                                  {/* Diagram bar stacked */}
                                  <div className="w-full h-4 rounded-lg overflow-hidden flex shadow-inner border border-slate-200">
                                      <div 
                                          className="h-full bg-[#01585d] text-[8px] flex items-center justify-center font-bold text-white transition-all" 
                                          style={{ width: `${Math.max(equityPct, 15)}%` }}
                                          title={`Equity: ${equityPct}%`}
                                      >
                                          {equityPct}%
                                      </div>
                                      {debtPct > 0 && (
                                          <div 
                                              className="h-full bg-rose-500 text-[8px] flex items-center justify-center font-bold text-white transition-all" 
                                              style={{ width: `${debtPct}%` }}
                                              title={`Liabilities: ${debtPct}%`}
                                          >
                                              {debtPct}%
                                          </div>
                                      )}
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-[9px] font-bold">
                                      <div className="flex items-center gap-1.5 text-[#01585d]">
                                          <span className="w-2 h-2 rounded-full bg-[#1e585d]"></span>
                                          <span>Modal & Laba Ditahan ({accounts.filter(a => a.type === 'Equity').length} Rekening)</span>
                                      </div>
                                      <div className="text-[#01585d]">Rp {tEquity.toLocaleString('id-ID')}</div>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-[9px] font-bold">
                                      <div className="flex items-center gap-1.5 text-rose-600">
                                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                          <span>Hutang Dagang ({accounts.filter(a => a.type === 'Liability').length} Rekening)</span>
                                      </div>
                                      <div className="text-rose-600">Rp {tLiabilities.toLocaleString('id-ID')}</div>
                                  </div>
                              </div>
                          </div>

                          {/* Efficiency Meter: Revenue vs Expense */}
                          <div className="glow-card p-5 rounded-xl bg-white/40 space-y-3 relative overflow-hidden flex flex-col justify-between">
                              <div>
                                  <h5 className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">Performa Pendapatan vs Beban</h5>
                                  <div className="text-lg font-black text-emerald-800">Rp {(tRevenue - tExpense).toLocaleString('id-ID')} Net</div>
                              </div>

                              <div className="space-y-3">
                                  <div className="flex justify-between items-center text-[9px] font-bold">
                                      <span className="text-emerald-700">Total Revenue:</span>
                                      <span className="text-emerald-700">Rp {tRevenue.toLocaleString('id-ID')}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-bold">
                                      <span className="text-rose-600">Total Expenses & COGS:</span>
                                      <span className="text-rose-600">Rp {tExpense.toLocaleString('id-ID')}</span>
                                  </div>
                                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                          className="h-full bg-emerald-500" 
                                          style={{ width: `${Math.min((tRevenue > 0 ? (tRevenue - tExpense) / tRevenue : 0) * 100, 100)}%` }}
                                      ></div>
                                  </div>
                                  <div className="text-[8px] text-slate-400 font-mono text-right italic">Margin Keuntungan Bersih: {tRevenue > 0 ? ((tRevenue - tExpense)/tRevenue * 100).toFixed(1) : '0'}%</div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="overflow-x-auto">
                              <div className="bg-indigo-100/80 text-indigo-700 glow-border rounded-t-lg p-2 px-4 text-[10px] font-bold uppercase tracking-widest text-center glow-text min-w-[500px]">Balance Sheet Accounts</div>
                              <table className="w-full text-left bg-white/60 border border-white/50 rounded-b-lg overflow-hidden min-w-[500px]">
                                  <tbody className="text-xs text-slate-600 divide-y divide-white/40">
                                      {accounts.filter(a => ['Asset', 'Liability', 'Equity'].includes(a.type)).map(a => (
                                          <tr key={a.code} className="hover:bg-white/40">
                                              <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{a.code}</td>
                                              <td className="px-4 py-3 font-bold text-slate-800">{a.name}</td>
                                              <td className="px-4 py-3"><span className="text-[9px] font-bold glow-border bg-indigo-100/50 text-indigo-700 px-2 py-0.5 rounded uppercase">{a.type}</span></td>
                                              <td className="px-4 py-3 text-right font-medium text-emerald-700 glow-text-purple">Rp {a.balance.toLocaleString('id-ID')}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                          <div className="overflow-x-auto">
                              <div className="bg-emerald-100/80 text-emerald-700 glow-border rounded-t-lg p-2 px-4 text-[10px] font-bold uppercase tracking-widest text-center glow-text-purple min-w-[500px]">Profit & Loss Accounts</div>
                              <table className="w-full text-left bg-white/60 border border-white/50 rounded-b-lg overflow-hidden min-w-[500px]">
                                  <tbody className="text-xs text-slate-600 divide-y divide-white/40">
                                      {accounts.filter(a => ['Revenue', 'Expense'].includes(a.type)).map(a => (
                                          <tr key={a.code} className="hover:bg-white/40">
                                              <td className="px-4 py-3 text-slate-400 font-mono text-[10px]">{a.code}</td>
                                              <td className="px-4 py-3 font-bold text-slate-800">{a.name}</td>
                                              <td className="px-4 py-3"><span className="text-[9px] font-bold glow-border bg-emerald-100/50 text-emerald-700 px-2 py-0.5 rounded uppercase">{a.type}</span></td>
                                              <td className="px-4 py-3 text-right font-medium text-indigo-700 glow-text">Rp {a.balance.toLocaleString('id-ID')}</td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
                  );
              })()}

              {activeTab === 'journal' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="col-span-1 lg:col-span-8">
                          <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold text-slate-800 glow-text">Recent Ledger Entries (Jurnal Umum & Buku Besar)</h4>
                              <div className="flex gap-2">
                                  <input type="month" value={ledgerPeriod} onChange={e=>setLedgerPeriod(e.target.value)} className="text-xs px-2 py-1 glow-input rounded bg-white/60" />
                                  <select value={ledgerAccount} onChange={e=>setLedgerAccount(e.target.value)} className="text-xs px-2 py-1 glow-input rounded bg-white/60 max-w-[150px]">
                                      <option value="ALL">Semua Akun</option>
                                      {accounts.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
                                  </select>
                              </div>
                          </div>
                          <div className="glow-border rounded-xl overflow-x-auto shadow-sm bg-white/60">
                              <table className="w-full min-w-[650px]">
                                  <thead className="bg-white/60 text-[10px] text-indigo-700 uppercase font-bold border-b border-white/50">
                                      <tr>
                                          <th className="text-left px-6 py-3">Ref & Tanggal</th>
                                          <th className="text-left px-6 py-3">Nama Akun</th>
                                          <th className="text-right px-6 py-3">Debet</th>
                                          <th className="text-right px-6 py-3">Kredit</th>
                                      </tr>
                                  </thead>
                                  <tbody className="text-xs text-slate-600 divide-y divide-white/40">
                                      {filteredJournals.map(entry => (
                                          <React.Fragment key={entry.id}>
                                              <tr className="bg-white/60 border-b-2 border-white/50">
                                                  <td colSpan={4} className="px-6 py-2">
                                                      <span className="font-bold text-emerald-700 glow-text-purple">{entry.id}</span>
                                                      <span className="text-[10px] text-slate-400 ml-2">{entry.date} &bull; {entry.description}</span>
                                                  </td>
                                              </tr>
                                              {entry.debits.map((d, i) => (
                                                  <tr key={`d-${i}`}>
                                                      <td className="px-6 py-3"></td>
                                                      <td className="px-6 py-3 font-bold text-slate-800">{accounts.find(a=>a.code===d.accountCode)?.name}</td>
                                                      <td className="px-6 py-3 text-right font-medium text-indigo-700 glow-text">Rp {d.amount.toLocaleString('id-ID')}</td>
                                                      <td className="px-6 py-3 text-right text-slate-500">-</td>
                                                  </tr>
                                              ))}
                                              {entry.credits.map((c, i) => (
                                                  <tr key={`c-${i}`}>
                                                      <td className="px-6 py-3"></td>
                                                      <td className="px-6 py-3 pl-12 text-slate-400">{accounts.find(a=>a.code===c.accountCode)?.name}</td>
                                                      <td className="px-6 py-3 text-right text-slate-500">-</td>
                                                      <td className="px-6 py-3 text-right font-medium text-emerald-700 glow-text-purple">Rp {c.amount.toLocaleString('id-ID')}</td>
                                                  </tr>
                                              ))}
                                          </React.Fragment>
                                      ))}
                                      {filteredJournals.length === 0 && (
                                          <tr><td colSpan={4} className="p-6 text-center text-xs text-slate-500">Data jurnal tidak ditemukan untuk filter ini.</td></tr>
                                      )}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                      
                      <div className="col-span-1 lg:col-span-4 glow-card p-6 rounded-xl h-fit">
                          <h4 className="text-xs font-bold text-slate-800 mb-4 border-b border-white/50 pb-3 glow-text">Posting Jurnal Manual</h4>
                          <form onSubmit={handleJournalSubmit} className="space-y-4">
                              <div>
                                  <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Tanggal</label>
                                  <input type="date" required value={jDate} onChange={e=>setJDate(e.target.value)} className="w-full px-3 py-2 glow-input rounded-md text-xs"/>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Keterangan / Memo</label>
                                  <input type="text" required value={jDesc} onChange={e=>setJDesc(e.target.value)} className="w-full px-3 py-2 glow-input rounded-md text-xs" placeholder="Koreksi stok, dll"/>
                              </div>
                              <div className="space-y-2 pt-2 border-t border-white/50">
                                  {rows.map((r, i) => (
                                      <div key={i} className="flex gap-2 items-center">
                                          <select value={r.acc} onChange={e=>updateJRow(i, 'acc', e.target.value)} className="w-full px-2 py-2 glow-input rounded-md text-xs cursor-pointer">
                                              {accounts.map(a => <option key={a.code} value={a.code} className="bg-white/60">{a.name}</option>)}
                                          </select>
                                          <select value={r.type} onChange={e=>updateJRow(i, 'type', e.target.value)} className="w-16 px-2 py-2 glow-input rounded-md text-xs font-bold cursor-pointer text-center">
                                              <option value="D" className="bg-white/60 text-indigo-700">D</option>
                                              <option value="K" className="bg-white/60 text-emerald-700">K</option>
                                          </select>
                                          <input type="number" required min="0" value={r.amount} onChange={e=>updateJRow(i, 'amount', parseInt(e.target.value)||0)} className="w-full px-2 py-2 glow-input rounded-md text-xs" placeholder="Rp"/>
                                      </div>
                                  ))}
                                  <button type="button" onClick={() => setRows([...rows, {acc: '1-1000', type: 'D', amount: 0}])} className="text-[10px] text-indigo-700 font-bold uppercase tracking-wide hover:underline mt-2 glow-text">+ Tambah Baris Akun</button>
                              </div>
                              <button type="submit" className="w-full glow-button font-bold text-xs py-2.5 rounded-md shadow-sm transition-colors mt-6 uppercase tracking-wider">Pusatkan ke Buku Besar</button>
                          </form>
                      </div>
                  </div>
              )}

              {activeTab === 'reports' && (
                  <div className="print-area">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 no-print border-b border-indigo-100 pb-4 gap-3">
                          <div>
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest glow-text">Financial Reports Engine</h4>
                              <p className="text-[10px] text-indigo-700 opacity-80">Laporan di-generate secara real-time dari buku besar.</p>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={handleDownloadPDF} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center transition-all active:scale-95">
                                  <Download size={14} className="mr-2"/> EXPORT PDF
                              </button>
                          </div>
                      </div>

                      <div ref={reportRef} className="bg-white p-3 sm:p-6 md:p-10 rounded-xl border border-slate-200/50 shadow-sm" id="report-content">
                          {/* Printable Header with Logo and Company Name */}
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b-2 border-slate-300 pb-6 mb-8 gap-4 text-slate-800">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-left">
                                  <div className="w-16 h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm mx-auto sm:mx-0">
                                      <img src="/logo cbs.png" alt="Logo PT. Caraca Bintang Samudra" className="w-full h-full object-contain p-1" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                      <h1 className="text-sm sm:text-base md:text-lg font-bold tracking-tight text-slate-800 uppercase leading-snug">PT. CARACA BINTANG SAMUDRA</h1>
                                      <p className="text-[9px] sm:text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">Enterprise Maritime Supplier & Logistics</p>
                                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-1">Jl. Pelabuhan Raya No. 88, Tanjung Priok, Jakarta Utara, 14310</p>
                                  </div>
                              </div>
                              <div className="text-left md:text-right shrink-0">
                                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-indigo-700">LAPORAN KEUANGAN KONSOLIDASI</h2>
                                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono mt-0.5">Generated: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                              {/* Laporan Laba Rugi */}
                              <div className="glow-card p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-4 mb-6 gap-2">
                                      <div className="text-left w-full sm:w-auto">
                                          <h3 className="text-xs sm:text-sm font-bold text-slate-850 uppercase tracking-widest glow-text">LAPORAN LABA RUGI</h3>
                                          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Pendapatan dan Kinerja Periode Berjalan</p>
                                      </div>
                                  </div>
                                  
                                  <div className="space-y-4 text-xs">
                                      <div className="border-b border-white/50 pb-3 mb-3">
                                          <div className="flex justify-between items-center font-bold text-indigo-750 text-[11px] sm:text-xs md:text-sm glow-text gap-2">
                                              <span>PENDAPATAN PENJUALAN</span>
                                              <span className="font-mono">Rp {revenueBalance.toLocaleString('id-ID')}</span>
                                          </div>
                                      </div>
                                      <div className="border-b border-white/50 pb-3 mb-3">
                                          <p className="font-bold text-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider mb-2.5">BEBAN POKOK & BIAYA:</p>
                                          {accounts.filter(a => a.type === 'Expense').map(a => (
                                              <div key={a.code} className="flex justify-between items-center text-slate-600 pl-2 sm:pl-4 mb-2 text-[11px] sm:text-xs gap-2">
                                                  <span className="truncate" title={a.name}>{a.name}</span>
                                                  <span className="font-mono font-medium shrink-0 text-slate-500">(Rp {a.balance.toLocaleString('id-ID')})</span>
                                              </div>
                                          ))}
                                          <div className="flex justify-between items-center font-bold text-slate-800 pl-2 sm:pl-4 pt-3 mt-3 border-t border-slate-200">
                                              <span className="text-[11px] sm:text-xs">TOTAL BEBAN OPERASIONAL</span>
                                              <span className="text-red-600 font-mono text-[11px] sm:text-xs shrink-0">(Rp {expenseBalance.toLocaleString('id-ID')})</span>
                                          </div>
                                      </div>
                                      <div className="flex justify-between items-center font-bold text-xs sm:text-sm md:text-base text-slate-800 border-b-2 border-indigo-500 pb-2 pt-2 glow-text gap-2">
                                          <span>LABA BERSIH (PROFIT)</span>
                                          <span className={`font-mono shrink-0 ${retainedEarnings >= 0 ? 'text-emerald-600 font-black' : 'text-red-600 font-black'}`}>
                                              {retainedEarnings >= 0 ? '' : '-'}Rp {Math.abs(retainedEarnings).toLocaleString('id-ID')}
                                          </span>
                                      </div>
                                  </div>
                              </div>

                              {/* Neraca */}
                              <div className="glow-card p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-indigo-100 pb-4 mb-6 gap-2">
                                      <div className="text-left w-full sm:w-auto">
                                          <h3 className="text-xs sm:text-sm font-bold text-slate-850 uppercase tracking-widest glow-text">NERACA (BALANCE SHEET)</h3>
                                          <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Posisi Keuangan Terkini</p>
                                      </div>
                                      
                                      <div className="no-print self-start sm:self-center shrink-0">
                                          <div className={`flex items-center gap-1.5 p-1 px-2.5 rounded-lg border shadow-sm ${isBalanced ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300' : 'bg-rose-500/10 text-rose-700 border-rose-300'}`}>
                                              <div className={`w-1.5 h-1.5 rounded-full ${isBalanced ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`}></div>
                                              <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider">{isBalanced ? 'BALANCED' : 'UNBALANCED'}</span>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="space-y-6 text-xs">
                                      {/* Aset */}
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-[10px] sm:text-[11px] bg-indigo-100/80 px-3 py-1.5 rounded uppercase tracking-wide mb-3 glow-text text-left">AKTIVA (ASET)</h4>
                                          {accounts.filter(a => a.type === 'Asset').map(a => (
                                              <div key={a.code} className="flex justify-between items-center text-slate-600 pl-2 mb-2 text-[11px] sm:text-xs gap-2">
                                                  <span className="truncate" title={a.name}>{a.name}</span>
                                                  <span className="font-mono font-medium text-slate-800 shrink-0">Rp {a.balance.toLocaleString('id-ID')}</span>
                                              </div>
                                          ))}
                                          <div className="flex justify-between items-center font-bold text-indigo-750 bg-slate-50 px-2 py-2 mt-3 border-y border-slate-200 text-[11px] sm:text-xs md:text-sm gap-2">
                                              <span>TOTAL ASET</span>
                                              <span className="font-mono text-indigo-800 font-bold shrink-0">Rp {assetBalance.toLocaleString('id-ID')}</span>
                                          </div>
                                      </div>

                                      {/* Kewajiban & Ekuitas */}
                                      <div>
                                          <h4 className="font-bold text-slate-800 text-[10px] sm:text-[11px] bg-emerald-100/80 px-3 py-1.5 rounded uppercase tracking-wide mb-3 glow-text-purple text-left">PASIVA (KEWAJIBAN & EKUITAS)</h4>
                                          
                                          <p className="font-bold text-emerald-800 mt-2 mb-2 pl-2 text-[10px] uppercase tracking-wider">Kewajiban / Hutang</p>
                                          {accounts.filter(a => a.type === 'Liability').map(a => (
                                              <div key={a.code} className="flex justify-between items-center text-slate-600 pl-4 mb-2 text-[11px] sm:text-xs gap-2">
                                                  <span className="truncate" title={a.name}>{a.name}</span>
                                                  <span className="font-mono text-slate-800 shrink-0">Rp {a.balance.toLocaleString('id-ID')}</span>
                                              </div>
                                          ))}
                                          
                                          <p className="font-bold text-emerald-800 mt-4 mb-2 pl-2 text-[10px] uppercase tracking-wider">Ekuitas & Modal</p>
                                          {accounts.filter(a => a.type === 'Equity').map(a => (
                                              <div key={a.code} className="flex justify-between items-center text-slate-600 pl-4 mb-2 text-[11px] sm:text-xs gap-2">
                                                  <span className="truncate" title={a.name}>{a.name}</span>
                                                  <span className="font-mono text-slate-800 shrink-0">Rp {a.balance.toLocaleString('id-ID')}</span>
                                              </div>
                                          ))}
                                          {/* Inject Laba Berjalan */}
                                          <div className="flex justify-between items-center text-slate-600 pl-4 mb-2 pt-2 border-t border-slate-150 text-[11px] sm:text-xs gap-2">
                                              <span className="italic">Laba/(Rugi) Periode Berjalan</span>
                                              <span className="font-mono font-bold text-slate-800 shrink-0">Rp {retainedEarnings.toLocaleString('id-ID')}</span>
                                          </div>

                                          <div className="flex justify-between items-center font-bold text-emerald-750 bg-slate-50 px-2 py-2 mt-3 border-y border-slate-200 text-[11px] sm:text-xs md:text-sm gap-2">
                                              <span>TOTAL PASIVA</span>
                                              <span className="font-mono text-emerald-800 font-bold shrink-0">Rp {(liabilityBalance + equityBalance + retainedEarnings).toLocaleString('id-ID')}</span>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mt-6 md:mt-12">
                              {/* Arus Kas Sederhana */}
                              <div className="glow-card p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
                                  <div className="border-b border-indigo-100 pb-3 mb-6">
                                      <h3 className="text-xs sm:text-sm font-bold text-slate-850 uppercase tracking-widest glow-text">ARUS KAS (CASH FLOW)</h3>
                                      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Laporan Ketersediaan Saldo Kas & Bank</p>
                                  </div>
                                  
                                  <div className="space-y-4 text-xs">
                                      {accounts.filter(a => ['1-1000', '1-1010'].includes(a.code)).map(a => (
                                          <div key={a.code} className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 text-[11px] sm:text-xs text-slate-600 gap-2">
                                              <span className="truncate" title={a.name}>{a.name}</span>
                                              <span className="font-mono font-bold text-indigo-700 shrink-0">Rp {a.balance.toLocaleString('id-ID')}</span>
                                          </div>
                                      ))}
                                      <div className="flex justify-between items-center font-bold text-xs sm:text-sm text-slate-850 border-b-2 border-indigo-500 pb-2 pt-2 gap-2">
                                          <span>TOTAL KAS TERSEDIA</span>
                                          <span className="font-mono text-indigo-750 font-black shrink-0">Rp {accounts.filter(a => ['1-1000', '1-1010'].includes(a.code)).reduce((sum, a) => sum + a.balance, 0).toLocaleString('id-ID')}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Hutang & Piutang */}
                              <div className="glow-card p-4 sm:p-6 md:p-8 rounded-xl shadow-sm">
                                  <div className="border-b border-indigo-100 pb-3 mb-6">
                                      <h3 className="text-xs sm:text-sm font-bold text-slate-850 uppercase tracking-widest glow-text">LAPORAN HUTANG & PIUTANG</h3>
                                      <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Ringkasan Nilai Kewajiban & Tagihan Pelanggan</p>
                                  </div>
                                  
                                  <div className="space-y-4 text-xs">
                                      <div className="border-b border-slate-150 pb-3 mb-3">
                                          <p className="font-bold text-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider mb-2">PIUTANG USAHA (TAGIHAN CUSTOMER):</p>
                                          {accounts.filter(a => a.code === '1-2000').map(a => (
                                              <div key={a.code} className="flex justify-between items-center text-slate-600 pl-2 sm:pl-4 mb-1.5 text-[11px] sm:text-xs gap-2">
                                                  <span className="truncate" title={a.name}>{a.name}</span>
                                                  <span className="font-mono font-bold text-emerald-600 shrink-0">Rp {a.balance.toLocaleString('id-ID')}</span>
                                              </div>
                                          ))}
                                      </div>
                                      <div className="border-b border-slate-150 pb-3 mb-3">
                                          <p className="font-bold text-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider mb-2">HUTANG USAHA (TAGIHAN SUPPLIER):</p>
                                          {accounts.filter(a => a.code === '2-1000').map(a => (
                                              <div key={a.code} className="flex justify-between items-center text-slate-600 pl-2 sm:pl-4 mb-1.5 text-[11px] sm:text-xs gap-2">
                                                  <span className="truncate" title={a.name}>{a.name}</span>
                                                  <span className="font-mono font-bold text-red-500 shrink-0">Rp {a.balance.toLocaleString('id-ID')}</span>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
