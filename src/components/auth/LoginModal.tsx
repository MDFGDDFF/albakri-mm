import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, User, ArrowRight } from 'lucide-react';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login, setIsJoinModalOpen, data } = useApp();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    const success = await login(identifier.trim(), password);
    setLoading(false);
    if (success) {
      setIdentifier('');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-right">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsLoginModalOpen(false);
            setIdentifier('');
            setPassword('');
          }}
          className="absolute top-5 left-5 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Icon and Title */}
        <div className="flex flex-col items-center text-center mt-1 mb-6">
          <div className="w-16 h-16 rounded-full border border-amber-500/40 p-1 bg-stone-950 mb-3 overflow-hidden shadow-xl">
            <img 
              src={data.settings.logoUrl || '/family_logo.png'} 
              alt={data.settings.familyName} 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h3 className="font-heading font-bold text-lg text-amber-300">
            تسجيل الدخول إلى البوابة
          </h3>
          <p className="text-xs text-stone-400 mt-1 max-w-xs leading-relaxed">
            تجمع عائلة البكري والبقري (البلدة الأصلية: إسدود - فلسطين)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1.5 text-right">
              اسم المستخدم أو البريد الإلكتروني *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl py-2.5 px-3.5 pr-10 text-sm text-stone-100 placeholder-stone-500 text-right outline-none transition-all"
                dir="auto"
                autoFocus
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

          <button
            type="submit"
            disabled={loading || !identifier.trim() || !password}
            className="w-full mt-3 py-3 font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 bg-amber-500 hover:bg-amber-400 text-stone-950"
          >
            {loading ? 'جاري التحقق...' : 'دخول'}
            <ArrowRight className="w-4 h-4 rotate-180" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-800 text-center">
          <p className="text-xs text-stone-400">
            أحد أبناء أو بنات العائلة ولست مسجلاً بعد؟{' '}
            <button
              onClick={() => {
                setIsLoginModalOpen(false);
                setIsJoinModalOpen(true);
              }}
              className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4 cursor-pointer"
            >
              تقديم طلب انضمام للعائلة
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};
