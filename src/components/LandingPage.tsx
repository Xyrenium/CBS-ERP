import React, { useState } from 'react';
import { Ship, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { User } from '../types';
import { ParticleNetwork } from './ParticleNetwork';

export function LandingPage({ onComplete }: { onComplete: () => void }) {
  const { users, setUsers, setCurrentUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [logoError, setLogoError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    // Bypass requirement: If empty, login as Admin directly
    if (!email && !password) {
        const adminUser = users.find(u => u.role === 'Admin');
        if (adminUser) {
            setCurrentUser(adminUser);
            onComplete();
            return;
        }
    }

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      if (user.status === 'pending') {
        setError('Akun Anda masih menunggu persetujuan Admin.');
      } else {
        setCurrentUser(user);
        onComplete();
      }
    } else {
      setError('Email atau password salah. (Atau kosongkan form untuk bypass sbg Admin)');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (users.find(u => u.email === email)) {
      setError('Email sudah terdaftar.');
      return;
    }
    const newUser: User = {
      id: `U${Date.now()}`,
      name,
      email,
      password,
      role: 'Karyawan',
      status: 'pending' // default
    };
    setUsers([...users, newUser]);
    setSuccessMsg('Registrasi berhasil! Menunggu persetujuan Admin.');
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#e2e8f0]/90 text-slate-800 font-sans p-4 sm:p-6 md:p-8 flex flex-col">
      <ParticleNetwork />
      {/* Aurora Glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-[radial-gradient(ellipse_at_center,rgba(4,192,202,0.22)_0%,rgba(79,70,229,0.15)_50%,transparent_70%)] rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="relative z-10 w-full max-w-5xl mx-auto my-auto flex flex-col md:flex-row shadow-[0_20px_60px_rgba(1,88,93,0.12)] rounded-3xl border border-white/60 overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.35)', backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)' }}>
        
        {/* Left Side - Brand / Visual */}
        <div className="w-full md:w-5/12 bg-indigo-600/85 backdrop-blur-lg p-6 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/75 to-indigo-800/75 mix-blend-multiply"></div>
          {/* Subtle overlay elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_50%)]"></div>
          
          <div className="relative z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center mb-6 sm:mb-8 border border-white/40 shadow-xl overflow-hidden shrink-0">
                {!logoError ? (
                    <img 
                      src="/logo cbs.png" 
                      alt="Logo PT. Caraca Bintang Samudra" 
                      className="w-full h-full object-contain p-1.5" 
                      onError={() => setLogoError(true)}
                      referrerPolicy="no-referrer"
                    />
                ) : (
                    <Ship size={32} className="text-indigo-600 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mb-2 sm:mb-4 drop-shadow-md">
              Internal Enterprise Resource Planning<br/>
              <span className="text-base lg:text-xl opacity-90 mt-1 block font-bold tracking-wide">PT. Caraca Bintang Samudra</span>
            </h1>
          </div>
          
          <div className="relative z-10 mt-6 sm:mt-12 bg-white/10 rounded-xl p-4 sm:p-6 border border-white/20 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-3 mb-2">
                  <ShieldCheck size={18} className="text-emerald-300 drop-shadow-[0_0_5px_rgba(110,231,183,0.8)]" />
                  <h3 className="font-bold text-xs sm:text-sm tracking-wide">Secure Access</h3>
              </div>
              <p className="text-[11px] sm:text-xs text-indigo-100/90 leading-relaxed">Sistem terenkripsi penuh. Seluruh pembuatan akun baru wajib melalui tahap persetujuan Administrator internal.</p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-7/12 p-6 sm:p-10 lg:p-16 bg-white/15 flex flex-col justify-center backdrop-blur-xl border-t md:border-t-0 md:border-l border-white/20">
            
            <div className="mb-8 text-center md:text-left">
                <h2 className="text-2xl lg:text-3xl font-black text-slate-800 mb-2 tracking-tight">
                    {isLogin ? "Selamat Datang" : "Buat Akun Baru"}
                </h2>
                <p className="text-slate-600 font-medium text-sm">
                    {isLogin ? "Silakan masuk ke akun Anda" : "Daftarkan diri sebagai karyawan baru"}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50/70 border border-red-200/50 rounded-lg text-xs font-bold w-full text-center shadow-sm backdrop-blur-sm">
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="mb-6 p-3 bg-emerald-50/70 border border-emerald-200/50 rounded-lg text-xs font-bold w-full text-center shadow-sm backdrop-blur-sm">
                    {successMsg}
                </div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                {!isLogin && (
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Nama Lengkap</label>
                        <div className="relative">
                            <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition-all font-medium text-slate-800 shadow-sm backdrop-blur-sm placeholder-slate-400" 
                                placeholder="Jhon Doe"
                            />
                        </div>
                    </div>
                )}
                
                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email Karyawan</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="email" 
                            required={!isLogin} // Optional for login bypass
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition-all font-medium text-slate-800 shadow-sm backdrop-blur-sm placeholder-slate-400" 
                            placeholder="nama@cbs.com"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Password</label>
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="password" 
                            required={!isLogin} // Optional for login bypass
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/50 transition-all font-medium text-slate-800 shadow-sm backdrop-blur-sm placeholder-slate-400" 
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold tracking-wide transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transform hover:-translate-y-0.5">
                        {isLogin ? 'Masuk ke Sistem' : 'Ajukan Pendaftaran'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center border-t border-slate-200/50 pt-6">
                <p className="text-sm text-slate-600 font-medium">
                    {isLogin ? "Belum memiliki akun?" : "Sudah memiliki akun?"}
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); setEmail(''); setPassword(''); }} className="ml-2 font-bold text-indigo-700 hover:text-indigo-800 transition-colors">
                        {isLogin ? "Daftar sekarang" : "Masuk di sini"}
                    </button>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
