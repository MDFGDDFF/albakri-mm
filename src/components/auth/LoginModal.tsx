import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User, Shield, ArrowRight, Key, ShieldCheck, Users } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, setIsJoinModalOpen, data } = useApp();
  
  const [loginMode, setLoginMode] = useState<'admin' | 'member'>('admin');
  const [identifier, setIdentifier] = useState('majed1');
  const [password, setPassword] = useState('2468');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(identifier, password);
    setLoading(false);
  };

  const switchMode = (mode: 'admin' | 'member') => {
    setLoginMode(mode);
    if (mode === 'admin') {
      setIdentifier('majed1');
      setPassword('2468');
    } else {
      setIdentifier('user1');
      setPassword('123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-right">
        
        {/* Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-5 left-5 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Icon and Title */}
        <div className="flex flex-col items-center text-center mt-1 mb-5">
          <div className="w-16 h-16 rounded-full border border-amber-500/40 p-1 bg-stone-950 mb-3 overflow-hidden shadow-xl">
            <img 
              src={data.settings.logoUrl || '/family_logo.png'} 
              alt={data.settings.familyName} 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h3 className="font-heading font-bold text-lg text-amber-300">
            {loginMode === 'admin' ? 'دخول إدارة النظام (لوحة التحكم CMS)' : 'دخول أفراد العائلة (بوابة الأعضاء)'}
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-xs leading-relaxed">
            تجمع عائلة البكري والبقري (البلدة الأصلية: إسدود - فلسطين)
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-stone-950 p-1.5 rounded-2xl border border-stone-800 mb-5 text-xs">
          <button
            type="button"
            onClick={() => switchMode('admin')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              loginMode === 'admin'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>لوحة التحكم (الإدارة)</span>
          </button>

          <button
            type="button"
            onClick={() => switchMode('member')}
            className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              loginMode === 'member'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>بوابة أفراد العائلة</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 text-right">
              {loginMode === 'admin' ? 'اسم مستخدم الإدارة *' : 'اسم المستخدم أو البريد الإلكتروني *'}
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={loginMode === 'admin' ? 'majed1 أو majed2' : 'user1 أو البريد المسجل'}
                className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-stone-100 placeholder-stone-500 text-right outline-none transition-all"
                dir="ltr"
              />
              <User className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 text-right">
              كلمة المرور *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-stone-100 placeholder-stone-500 text-right outline-none transition-all"
                dir="ltr"
              />
              <Lock className="w-4 h-4 text-stone-500 absolute right-3.5 top-3.5" />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          {loginMode === 'admin' ? (
            <div className="p-3 bg-stone-850 rounded-2xl border border-stone-800 text-[11px] text-stone-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Key className="w-3.5 h-3.5" />
                <span>حسابات إدارة لوحة التحكم المعتمدة:</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => {
                    setIdentifier('majed1');
                    setPassword('2468');
                  }} 
                  className={`p-2 rounded-xl text-right border transition-all ${
                    identifier === 'majed1'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300">المدير 1 (majed1)</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">كلمة المرور: 2468</div>
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setIdentifier('majed2');
                    setPassword('13579');
                  }} 
                  className={`p-2 rounded-xl text-right border transition-all ${
                    identifier === 'majed2'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="font-bold text-xs text-amber-300">المدير 2 (majed2)</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">كلمة المرور: 13579</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-stone-850 rounded-2xl border border-stone-800 text-[11px] text-stone-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>حساب تجريبي لأفراد العائلة (بوابة الأعضاء):</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setIdentifier('user1');
                  setPassword('123');
                }} 
                className={`w-full p-2.5 rounded-xl text-right border transition-all ${
                  identifier === 'user1'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                    : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300'
                }`}
              >
                <div className="font-bold text-xs text-emerald-300">عضو العائلة (user1 - فهد البكري)</div>
                <div className="text-[10px] text-stone-400 mt-0.5">كلمة المرور: 123 · تصفح حساب العضو وشجرة العائلة</div>
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-2 py-3 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              loginMode === 'admin'
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {loading ? 'جاري التحقق...' : (loginMode === 'admin' ? 'دخول لوحة التحكم' : 'دخول بوابة العضو')}
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-stone-800 text-center">
          <p className="text-xs text-stone-400">
            أحد أبناء أو بنات العائلة ولست مسجلاً بعد؟{' '}
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setIsJoinModalOpen(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
            >
              تقديم طلب انضمام للعائلة
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
