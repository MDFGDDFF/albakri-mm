import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  User, 
  ShieldCheck, 
  GitFork, 
  Calendar, 
  Coins, 
  HeartHandshake, 
  LogOut, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';

export const MemberPortalModal: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    isMemberPortalOpen, 
    setIsMemberPortalOpen, 
    data, 
    logout, 
    setActiveView,
    setIsJoinModalOpen,
    rsvpEvent,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'events' | 'fund'>('profile');

  if (!isMemberPortalOpen) return null;

  // Find linked member record if available
  const linkedMember = data.members.find(m => m.id === currentUser.memberId || m.fullName === currentUser.name);
  const memberBranch = linkedMember 
    ? data.branches.find(b => b.id === linkedMember.branchId) 
    : data.branches.find(b => b.name === currentUser.branchName);

  const upcomingEvents = data.events.filter(e => !e.isDeleted);
  const userContributions = data.transactions.filter(t => !t.isDeleted && t.type === 'income');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setIsMemberPortalOpen(false)}
          className="absolute top-5 left-5 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Portal Header */}
        <div className="flex items-center gap-4 border-b border-stone-800 pb-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-heading font-bold text-2xl shadow-inner">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-heading font-bold text-stone-100 truncate">
                {currentUser.name}
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>عضو معتمد</span>
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              بوابة أفراد عائلة البكري والبقري الرسمية · {currentUser.branchName || 'فرع الرياض'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-3 mb-6 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            بطاقة العضو والبيانات
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'events'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <span>المناسبات وتأكيد الحضور</span>
            <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">
              {upcomingEvents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('fund')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'fund'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800'
            }`}
          >
            <span>صندوق العائلة والتكافل</span>
          </button>
        </div>

        {/* Tab 1: Member Profile Card */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Identity Card */}
            <div className="bg-gradient-to-br from-stone-850 via-stone-900 to-amber-950/20 border border-stone-750 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-4">
                <div className="text-left">
                  <span className="text-[10px] text-stone-500 block uppercase font-mono">Membership ID</span>
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {currentUser.memberId || 'BK-2026-M'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-amber-300 font-bold block">
                    {data.settings.familyName}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {data.settings.motto || 'أصالة النسب وتلاحم الأجيال'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2 border-t border-stone-800">
                <div>
                  <span className="text-stone-400 block text-[11px]">الاسم الكامل:</span>
                  <span className="font-bold text-stone-100">{currentUser.name}</span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[11px]">فرع العائلة:</span>
                  <span className="font-bold text-amber-400">{currentUser.branchName || 'فرع الرياض'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Mail className="w-3.5 h-3.5 text-stone-500" />
                  <span dir="ltr">{currentUser.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Phone className="w-3.5 h-3.5 text-stone-500" />
                  <span dir="ltr">{currentUser.phone || '+966 5x xxx xxxx'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <MapPin className="w-3.5 h-3.5 text-stone-500" />
                  <span>{linkedMember?.city || 'الرياض، المملكة العربية السعودية'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>الجيل: {linkedMember?.generation ? `الجيل رقم ${linkedMember.generation}` : 'السادس'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setIsMemberPortalOpen(false);
                  setActiveView('tree');
                }}
                className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/50 rounded-xl text-right flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <GitFork className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 group-hover:text-amber-300">شجرة العائلة والنسب</h4>
                    <p className="text-[10px] text-stone-400">تصفح موقعك في المشجر والآباء والأبناء</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMemberPortalOpen(false);
                  setIsJoinModalOpen(true);
                }}
                className="p-3 bg-stone-850 hover:bg-stone-800 border border-stone-750 hover:border-amber-500/50 rounded-xl text-right flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-100 group-hover:text-amber-300">طلب تحديث أو إضافة مولود</h4>
                    <p className="text-[10px] text-stone-400">إرسال مستجدات إلى لجنة شجرة النسب</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Events & RSVPs */}
        {activeTab === 'events' && (
          <div className="space-y-4 animate-in fade-in">
            <p className="text-xs text-stone-400">
              المناسبات واللقاءات الرسمية القادمة لعائلة البكري والبقري، يمكنك تأكيد الحضور مباشرة:
            </p>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="p-3.5 bg-stone-850 border border-stone-800 rounded-2xl flex items-center justify-between gap-4">
                  <div className="text-right flex-1">
                    <h4 className="text-xs font-bold text-stone-100">{evt.title}</h4>
                    <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{evt.date}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{evt.location}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      await rsvpEvent(evt.id);
                    }}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-sm shrink-0"
                  >
                    تأكيد الحضور ({evt.rsvpCount || 0})
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Fund & Takaful */}
        {activeTab === 'fund' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-emerald-950/30 border border-emerald-800/40 p-4 rounded-2xl text-right">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <HeartHandshake className="w-4 h-4" />
                <span>صندوق التكافل والوفاء لعائلة البكري والبقري</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                يهدف الصندوق لدعم الأيتام والأرامل والشباب المقبلين على الزواج ودعم برامج التفوق العلمي السنوية.
              </p>
            </div>

            <div className="bg-stone-850 border border-stone-800 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between items-center text-stone-300">
                <span>حساب الآيبان الرسمي للصندوق:</span>
                <span className="font-mono text-amber-400 text-[11px]" dir="ltr">SA44 8000 0123 4567 8910 1112</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span>البنك المعتمد:</span>
                <span>مصرف الراجحي - حساب أوقاف العائلة</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span>حالة الاشتراك السنوي:</span>
                <span className="text-emerald-400 font-bold">نشط ومسدد (شكراً لمساهمتك المباركة)</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => {
              logout();
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 py-2 px-3 rounded-xl hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4 rotate-180" />
            <span>تسجيل الخروج من الحساب</span>
          </button>

          <button
            onClick={() => setIsMemberPortalOpen(false)}
            className="px-5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
