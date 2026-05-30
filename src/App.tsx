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
import { Ship, LayoutDashboard, Users, Package, ShoppingCart, TrendingUp, BookOpen, LogOut, Verified, ShieldCheck, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';

function AppContent() {
  const [showLanding, setShowLanding] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const { role, currentUser, setCurrentUser } = useStore();

  if (showLanding || !currentUser) {
    return <LandingPage onComplete={() => setShowLanding(false)} />;
  }

  const navItems = [
    { section: 'Operational' },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'customer', label: 'Data Customer', icon: <Users size={20} /> },
    { id: 'produk', label: 'Master Produk', icon: <Package size={20} /> },
    { id: 'pembelian', label: 'Pembelian (PO)', icon: <ShoppingCart size={20} /> },
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
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id as string);
                  setIsMobileMenuOpen(false); // auto close on mobile menu select
                }}
                className={`w-full flex items-center ${isSidebarMinimized ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'} rounded-lg text-sm transition-all duration-200 group relative ${
                  activeMenu === item.id 
                    ? 'bg-indigo-500 text-white font-medium shadow-md shadow-indigo-500/20' 
                    : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
                title={isSidebarMinimized ? item.label : undefined}
              >
                <div className={activeMenu === item.id ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}>
                    {item.icon}
                </div>
                {!isSidebarMinimized && <span className="truncate">{item.label}</span>}
                
                {/* Tooltip for minimized state */}
                {isSidebarMinimized && (
                    <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                        {item.label}
                    </div>
                )}
              </button>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/50 flex flex-col gap-3">
            {!isSidebarMinimized ? (
                <div className="bg-white/60 rounded-xl p-3 glow-border">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-800 font-bold truncate pr-1">{currentUser.name}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded uppercase glow-border shrink-0 ${role === 'Admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{role}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate">
                    {currentUser.email}
                  </p>
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
                {activeMenu === 'pembelian' && <PurchaseModule />}
                {activeMenu === 'penjualan' && <SalesModule />}
                {activeMenu === 'akuntansi' && role === 'Admin' && <AccountingModule />}
                {activeMenu === 'users' && role === 'Admin' && <UserManagement />}
            </div>
        </div>
      </main>
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
