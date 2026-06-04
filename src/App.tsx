import React, { useState } from 'react';
import { StoreProvider, useStore } from './store';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { CustomerManagement } from './components/CustomerManagement';
import { ProductManagement } from './components/ProductManagement';
import { PurchaseModule } from './components/PurchaseModule';
import { SalesModule } from './components/SalesModule';
import { AccountingModule } from './components/AccountingModule';
import { UserManagement } from './components/UserManagement';
import { Ship, LayoutDashboard, Users, Package, ShoppingCart, TrendingUp, BookOpen, LogOut, Verified, ShieldCheck, ChevronLeft, ChevronRight, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isSalesDropdownOpen, setIsSalesDropdownOpen] = useState(false);
  const [isPurchaseDropdownOpen, setIsPurchaseDropdownOpen] = useState(false);
  const { role, currentUser, setCurrentUser, users, setUsers } = useStore();

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentUser) return;
    
    // Validate old password
    if (currentUser.password && oldPassword !== currentUser.password) {
      setPwdError('Password lama salah.');
      return;
    }

    if (newPassword.length < 4) {
      setPwdError('Password baru minimal 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('Konfirmasi password baru tidak cocok.');
      return;
    }

    // Success! Update password
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

    setPwdSuccess('Password berhasil diubah!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
        setShowChangePasswordModal(false);
        setPwdSuccess('');
    }, 1500);
  };

  if (showLanding || !currentUser) {
    return <LandingPage onComplete={() => setShowLanding(false)} />;
  }

  const navItems = [
    { section: 'Operational' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'customer', label: 'Data Customer', icon: <Users size={20} /> },
    { id: 'produk', label: 'Master Produk', icon: <Package size={20} /> },
    { id: 'pembelian', label: 'Pembelian', icon: <ShoppingCart size={20} /> },
    { id: 'penjualan', label: 'Penjualan', icon: <TrendingUp size={20} /> },
    ...(role === 'Admin' ? [
        { section: 'Financial Control' },
        { id: 'akuntansi', label: 'Akuntansi & Laporan', icon: <BookOpen size={20} /> },
        { section: 'Administration' },
        { id: 'users', label: 'Manage Users', icon: <ShieldCheck size={20} /> }
    ] : [])
  ];

  return (
    <div className="flex h-screen w-full glow-bg text-slate-800 font-sans overflow-hidden relative">
      {/* Sidebar Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden transition-all duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative top-0 bottom-0 left-0 h-screen z-40 transform transition-transform duration-300 md:transform-none bg-white md:bg-transparent glow-card flex flex-col shrink-0 no-print border-r border-slate-200 md:border-white/50 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isSidebarMinimized ? 'w-20' : 'w-64'}`}>
        
        {/* Header inside Sidebar */}
        <div className={`p-4 flex items-center border-b border-white/5 h-16 shrink-0 justify-between ${isSidebarMinimized ? 'md:justify-center' : 'px-6 gap-3'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 glow-bg rounded-lg flex items-center justify-center glow-border shrink-0 overflow-hidden bg-white">
               {!logoError ? (
                   <img 
                     src="/logo cbs.png" 
                     alt="Logo" 
                     className="w-full h-full object-contain p-1" 
                     onError={() => setLogoError(true)} 
                     referrerPolicy="no-referrer"
                   />
               ) : (
                   <Ship size={20} className="text-indigo-700" />
               )}
            </div>
            {!isSidebarMinimized && (
                <div className="text-slate-800 glow-text overflow-hidden whitespace-nowrap animate-in fade-in">
                    <h1 className="text-xs font-bold leading-tight uppercase">PT. CARACA</h1>
                    <p className="text-[10px] opacity-70 tracking-widest uppercase mt-0.5 text-indigo-700">BINTANG SAMUDRA</p>
                </div>
            )}
          </div>

          {/* Mobile close button inside mobile drawer */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1 rounded-lg hover:bg-slate-100 text-slate-500 focus:outline-none"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Toggle Button for desktop */}
        <button 
          onClick={() => setIsSidebarMinimized(!isSidebarMinimized)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-indigo-100 rounded-full items-center justify-center text-indigo-600 shadow-md hover:bg-indigo-50 hover:scale-110 transition-all z-30"
        >
          {isSidebarMinimized ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {navItems.map((item, idx) => {
            if (item.section) {
                if (isSidebarMinimized) {
                    return <div key={`sec-${idx}`} className={`h-px bg-indigo-100/50 w-full my-3 ${idx > 0 ? 'mt-4' : ''}`}></div>;
                }
                return <div key={`sec-${idx}`} className={`text-indigo-700 glow-text text-[10px] font-bold uppercase tracking-wider mb-2 px-3 ${idx > 0 ? 'pt-4' : ''}`}>{item.section}</div>;
            }

            const isPenjualan = item.id === 'penjualan';
            const isAnyPenjualanActive = activeMenu.startsWith('penjualan');
            const isPembelian = item.id === 'pembelian';
            const isAnyPurchaseActive = activeMenu.startsWith('pembelian');
            const isItemActive = isPenjualan 
              ? isAnyPenjualanActive 
              : (isPembelian ? isAnyPurchaseActive : (activeMenu === item.id));

            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => {
                    if (isPenjualan) {
                      setIsSalesDropdownOpen(prev => !prev);
                      if (!activeMenu.startsWith('penjualan_')) {
                        setActiveMenu('penjualan_order');
                      }
                    } else if (isPembelian) {
                      setIsPurchaseDropdownOpen(prev => !prev);
                      if (!activeMenu.startsWith('pembelian_')) {
                        setActiveMenu('pembelian_order');
                      }
                    } else {
                      setActiveMenu(item.id as string);
                    }
                    setIsMobileMenuOpen(false); // auto close on mobile menu select
                  }}
                  className={`w-full flex items-center justify-between ${isSidebarMinimized ? 'justify-center p-2' : 'px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group relative ${
                    isItemActive 
                      ? 'bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20' 
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  title={isSidebarMinimized ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className={isItemActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}>
                        {item.icon}
                    </div>
                    {!isSidebarMinimized && <span className="truncate">{item.label}</span>}
                  </div>

                  {!isSidebarMinimized && isPenjualan && (
                    <div className={isItemActive ? 'text-white' : 'text-slate-400'}>
                      {isSalesDropdownOpen || isAnyPenjualanActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  )}

                  {!isSidebarMinimized && isPembelian && (
                    <div className={isItemActive ? 'text-white' : 'text-slate-400'}>
                      {isPurchaseDropdownOpen || isAnyPurchaseActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  )}

                  {/* Tooltip for minimized state */}
                  {isSidebarMinimized && (
                      <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                          {item.label}
                      </div>
                  )}
                </button>

                {/* Dropdown submenus for Penjualan */}
                {isPenjualan && !isSidebarMinimized && (isSalesDropdownOpen || isAnyPenjualanActive) && (
                  <div className="pl-6 pt-1 pb-2 space-y-1 border-l border-indigo-100/50 ml-5 animate-in slide-in-from-top-1 duration-250">
                    {[
                      { id: 'penjualan_order', label: 'Order Penjualan' },
                      { id: 'penjualan_riwayat', label: 'Riwayat Penjualan' },
                      { id: 'penjualan_dp', label: 'Invoice Uang Muka' },
                      { id: 'penjualan_invoice', label: 'Invoice Penjualan' },
                      { id: 'penjualan_kuitansi', label: 'Kuitansi Penjualan' },
                      { id: 'penjualan_jalan', label: 'Surat Jalan' }
                    ].map(sub => {
                      const isSubActive = activeMenu === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveMenu(sub.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center py-1.5 px-3 rounded-md text-[11px] font-bold transition-all text-left ${
                            isSubActive 
                              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm' 
                              : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/40'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${isSubActive ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Dropdown submenus for Pembelian */}
                {isPembelian && !isSidebarMinimized && (isPurchaseDropdownOpen || isAnyPurchaseActive) && (
                  <div className="pl-6 pt-1 pb-2 space-y-1 border-l border-indigo-100/50 ml-5 animate-in slide-in-from-top-1 duration-250">
                    {[
                      { id: 'pembelian_order', label: 'Order Pembelian' },
                      { id: 'pembelian_invoice', label: 'Invoice Pembelian' },
                      { id: 'pembelian_kuitansi', label: 'Kuitansi Pembelian' },
                      { id: 'pembelian_penerimaan', label: 'Surat Penerimaan Barang' }
                    ].map(sub => {
                      const isSubActive = activeMenu === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setActiveMenu(sub.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center py-1.5 px-3 rounded-md text-[11px] font-bold transition-all text-left ${
                            isSubActive 
                              ? 'bg-indigo-50 text-indigo-700 font-extrabold shadow-sm' 
                              : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/40'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-2 shrink-0 ${isSubActive ? 'bg-indigo-600' : 'bg-slate-300'}`}></span>
                          {sub.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/50 flex flex-col gap-3">
            {!isSidebarMinimized ? (
                <div className="bg-white/60 rounded-xl p-3 glow-border">
                  <div className="flex justify-between items-center mb-1 bg-transparent border-0 shadow-none p-0">
                    <span className="text-[10px] text-slate-800 font-bold truncate pr-1">{currentUser.name}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase glow-border shrink-0 ${role === 'Admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{role}</span>
                  </div>
                  <p className="text-[10px] text-indigo-700 font-semibold font-mono truncate mb-2 leading-none">
                    ID: {currentUser.id}
                  </p>
                  <button 
                    onClick={() => setShowChangePasswordModal(true)}
                    className="text-[10px] text-left text-indigo-600 hover:text-indigo-800 hover:underline font-bold transition-all flex items-center gap-1 w-full bg-transparent border-0 cursor-pointer p-0"
                  >
                    Ubah Password
                  </button>
                </div>
            ) : (
                <div className="w-10 h-10 mx-auto bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold shadow-sm" title={currentUser.name}>
                    {currentUser.name.charAt(0).toUpperCase()}
                </div>
            )}
            
            <button 
              title="Sign Out"
              onClick={() => {
                  setCurrentUser(null);
                  setShowLanding(true);
              }} 
              className={`flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 py-2.5 rounded-lg transition-colors text-sm w-full font-medium ${isSidebarMinimized ? 'px-0' : 'px-4'}`}
            >
                <LogOut size={16} /> 
                {!isSidebarMinimized && <span>Keluar</span>}
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 glow-card border-b border-white/50 flex items-center justify-between px-4 md:px-8 shrink-0 no-print z-10">
            <div className="flex items-center gap-3">
                {/* Mobile hamburger menu trigger */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-700 md:hidden focus:outline-none shrink-0"
                >
                    <Menu size={20} />
                </button>

                <h2 className="text-sm md:text-lg font-bold text-slate-800 glow-text truncate">CBS Internal ERP</h2>
            </div>
            <div className="flex items-center gap-6 shrink-0">
                 {/* Hak akses indicator */}
                <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full glow-border flex">
                    <Verified size={14} className={role === 'Admin' ? 'text-emerald-700' : 'text-indigo-700'} />
                    <span className="text-[10px] md:text-xs font-bold text-slate-600">
                        <span className="hidden sm:inline">Terautentikasi sbg </span>{role}
                    </span>
                </div>
            </div>
        </header>

        {/* Dynamic Canvas */}
        <div className="p-4 md:p-8 flex-1 overflow-y-auto">
            <div className="w-full">
                {activeMenu === 'dashboard' && <Dashboard />}
                {activeMenu === 'customer' && <CustomerManagement />}
                {activeMenu === 'produk' && <ProductManagement />}
                {activeMenu.startsWith('pembelian') && <PurchaseModule activeSubView={activeMenu} setActiveView={setActiveMenu} />}
                {activeMenu.startsWith('penjualan') && <SalesModule activeSubView={activeMenu} setActiveView={setActiveMenu} />}
                {activeMenu === 'akuntansi' && role === 'Admin' && <AccountingModule />}
                {activeMenu === 'users' && role === 'Admin' && <UserManagement />}
            </div>
        </div>
      </main>

      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="glow-card rounded-2xl w-full max-w-md overflow-hidden flex flex-col glow-border">
            <div className="p-6 border-b border-indigo-100 flex justify-between items-center bg-white/60">
              <h3 className="text-lg font-bold text-slate-800 glow-text">Ubah Password Anda</h3>
              <button 
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setPwdError('');
                  setPwdSuccess('');
                }} 
                className="text-slate-400 hover:text-slate-800 font-bold text-xl leading-none"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="p-6 space-y-4 bg-white/60">
              {pwdError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-semibold text-center">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-semibold text-center">
                  {pwdSuccess}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Password Lama</label>
                <input 
                  type="password"
                  required
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Password Baru</label>
                <input 
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                  placeholder="Minimal 4 karakter"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1.5">Konfirmasi Password Baru</label>
                <input 
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all font-medium text-slate-800 shadow-sm"
                  placeholder="Ulangi password baru"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-indigo-50/50">
                <button 
                  type="button"
                  onClick={() => {
                    setShowChangePasswordModal(false);
                    setPwdError('');
                    setPwdSuccess('');
                  }}
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-slate-100/80 hover:bg-slate-200 text-slate-600 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
