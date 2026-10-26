import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Send, CheckCircle2 } from 'lucide-react';

export const JoinRequestModal: React.FC = () => {
  const { isJoinModalOpen, setIsJoinModalOpen, submitJoinRequest, data } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    fatherName: '',
    grandFatherName: '',
    branchName: data.branches[0]?.name || 'فرع الرياض',
    phone: '',
    email: '',
    city: 'الرياض',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isJoinModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await submitJoinRequest(formData);
    setLoading(false);
    if (success) {
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsJoinModalOpen(false);
            setSubmitted(false);
          }}
          className="absolute top-5 left-5 p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-heading font-bold text-xl text-stone-100">
              تم استلام طلب الانضمام بنجاح
            </h3>
            <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
              شكرًا لك ابن/ابنة العم. ستتم مراجعة صلة النسب وتدقيق الطلب من قبل لجنة شجرة النسب وأعيان الفرع، وسيتم إرسال بيانات الدخول إلى هاتفك فور الاعتماد.
            </p>
            <button
              onClick={() => {
                setIsJoinModalOpen(false);
                setSubmitted(false);
              }}
              className="mt-4 px-6 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs hover:bg-amber-400"
            >
              تم، العودة للموقع
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 pb-4 border-b border-stone-800">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-amber-300">
                  طلب انضمام وتسجيل في شجرة عائلة البكري
                </h3>
                <p className="text-[11px] text-stone-400">
                  يخضع التسجيل للتدقيق الأسري من قِبل لجنة الأنساب قبل التفعيل
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الاسم الرباعي الكامل *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="مثال: فهد بن ماجد بن محمد البكري"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 placeholder-stone-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    فرع العائلة الأقرب *
                  </label>
                  <select
                    value={formData.branchName}
                    onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    {data.branches.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    اسم الوالد والجد
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    placeholder="اسم الوالد"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 placeholder-stone-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    مدينة الإقامة الحالية
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="الرياض / جدة / بريدة..."
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 placeholder-stone-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    رقم الجوال للتواصل والتحقق *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966 5x xxx xxxx"
                    dir="ltr"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 placeholder-stone-500 outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="yourname@domain.com"
                    dir="ltr"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 placeholder-stone-500 outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  ملاحظات أو صلة قرابة تفصيلية للمساعدة في التدقيق
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="ذكر أقرب أبناء العمومة المعروفين في الشجرة أو أي معلومات مساندة..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 placeholder-stone-500 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 mt-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? 'جاري الإرسال...' : 'إرسال طلب الانضمام إلى لجنة النسب'}</span>
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
