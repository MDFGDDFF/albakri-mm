import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Check, ShieldCheck, UserCheck, Key, RefreshCw } from 'lucide-react';

export const DevUserSwitcher: React.FC = () => {
  const { 
    data, 
    currentUser, 
    currentRole, 
    switchUser, 
    isDevUserSwitcherOpen, 
    setIsDevUserSwitcherOpen,
    resetDatabase 
  } = useApp();

  if (!isDevUserSwitcherOpen) {
    return (
      <aside 
        aria-label="شريط تجربة الصلاحيات"
        className="fixed bottom-4 right-4 z-40 bg-stone-900/90 text-stone-200 border border-amber-500/40 shadow-xl rounded-full px-3 py-1.5 flex items-center gap-2 text-xs backdrop-blur-md hover:bg-stone-850 transition-all cursor-pointer"
        onClick={() => setIsDevUserSwitcherOpen(true)}
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
        <span className="font-medium text-amber-300">الدور الحالي: {currentRole.name}</span>
        <span className="text-[10px] text-stone-400">({currentUser.name.split(' ')[0]})</span>
        <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-amber-400 border border-stone-700">تبديل الصلاحية</span>
      </aside>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-750 text-stone-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <button
            onClick={() => setIsDevUserSwitcherOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading font-bold text-base text-amber-300">
              تبديل أدوار وصلاحيات النظام (Live Roles Switcher)
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-400 mt-3 leading-relaxed">
          يتيح لك هذا المحاكي فحص واختبار كيفية استجابة البوابة ولوحة التحكم لصلاحيات كل دور (مدير النظام، أمين الصندوق، مسؤول شجرة النسب، وعضو العائلة):
        </p>

        {/* User options */}
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {data.users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            const role = data.roles.find(r => r.id === user.roleId) || data.roles[0];

            return (
              <button
                key={user.id}
                onClick={() => {
                  switchUser(user.id);
                  setIsDevUserSwitcherOpen(false);
                }}
                className={`w-full text-right p-3 rounded-xl border transition-all flex items-center justify-between ${
                  isCurrent
                    ? 'bg-amber-950/40 border-amber-500/60 shadow-sm'
                    : 'bg-stone-850/60 border-stone-800 hover:bg-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      <Check className="w-3 h-3" />
                      <span>نشط حالياً</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-stone-400 hover:text-amber-300">
                      اختر الدور
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-stone-100">{user.name}</p>
                    <p className="text-[11px] text-amber-400">{user.roleName} · {user.branchName}</p>
                    <p className="text-[10px] text-stone-400 font-mono" dir="ltr">{user.email}</p>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                    role.code === 'admin' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                    role.code === 'treasurer' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    role.code === 'genealogist' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
                    'bg-stone-700 text-stone-300'
                  }`}>
                    {role.code === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* System Reset Option */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm('هل ترغب بإعادة ضبط كامل قاعدة البيانات والبيانات الأولية للموقع؟')) {
                resetDatabase();
                setIsDevUserSwitcherOpen(false);
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>إعادة ضبط البيانات الأولية (Reset Seed)</span>
          </button>
          
          <button
            onClick={() => setIsDevUserSwitcherOpen(false)}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg text-xs"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
