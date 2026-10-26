import React from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Mail, Phone, MapPin, Heart, ChevronLeft } from 'lucide-react';

export const Footer: React.FC = () => {
  const { data, setActiveView, setIsJoinModalOpen } = useApp();

  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-850 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-stone-850">
          
          {/* Column 1: Family identity & Motto */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-amber-500/30 overflow-hidden bg-stone-900 flex items-center justify-center shrink-0">
                <img 
                  src={data.settings.logoUrl || '/family_logo.png'} 
                  alt={data.settings.familyName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg text-amber-400">
                  {data.settings.familyName}
                </h3>
                <p className="text-xs text-stone-400">بوابة النسب والتواصل الموحدة</p>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              {data.settings.welcomeMessage || 'منصة جامعة لأبناء وبنات عائلة البكري، صوناً لصلة الأرحام وتوثيقاً للتاريخ العريق.'}
            </p>
            <div className="pt-2 text-xs text-stone-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>نظام موثق ومحمي بضوابط الخصوصية الأسرية</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4">
              أقسام البوابة
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => setActiveView('tree')} 
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3 h-3 text-stone-600" />
                  <span>شجرة العائلة والنسب التفاعلية</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('directory')} 
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3 h-3 text-stone-600" />
                  <span>دليل أفراد العائلة والفروع</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('news')} 
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3 h-3 text-stone-600" />
                  <span>أحدث الأخبار والإعلانات الرسمية</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('events')} 
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3 h-3 text-stone-600" />
                  <span>المناسبات واللقاء السنوي</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveView('archive')} 
                  className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3 h-3 text-stone-600" />
                  <span>أرشيف الوثائق التاريخية والأوقاف</span>
                </button>
              </li>
              {data.settings.enableFund && (
                <li>
                  <button 
                    onClick={() => setActiveView('fund')} 
                    className="hover:text-amber-300 transition-colors flex items-center gap-1.5"
                  >
                    <ChevronLeft className="w-3 h-3 text-stone-600" />
                    <span>صندوق التكافل العائلي والتقارير المالية</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Family Branches */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4">
              فروع العائلة الكريمة
            </h4>
            <ul className="space-y-2 text-xs text-stone-400">
              {data.branches.slice(0, 5).map(branch => (
                <li key={branch.id} className="flex items-center justify-between">
                  <span className="text-stone-300">{branch.name}</span>
                  <span className="text-[11px] text-stone-500">{branch.city}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsJoinModalOpen(true)}
              className="mt-4 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-medium"
            >
              <span>طلب تسجيل فرد في فرع عائلي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Column 4: Contact & Council */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4">
              التواصل مع أمانة المجلس
            </h4>
            <div className="space-y-3 text-xs text-stone-400">
              {data.settings.contactAddress && (
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                  <span>{data.settings.contactAddress}</span>
                </div>
              )}
              {data.settings.contactEmail && (
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-stone-500 shrink-0" />
                  <span>{data.settings.contactEmail}</span>
                </div>
              )}
              {data.settings.contactPhone && (
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                  <span dir="ltr">{data.settings.contactPhone}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-850">
              <p className="text-[11px] text-stone-400 leading-relaxed font-heritage text-sm">
                "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ الواحد"
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Quiet status */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            جميع الحقوق محفوظة © {new Date().getFullYear()} {data.settings.familyName}
          </p>
          <div className="flex items-center gap-4 text-stone-400 text-xs">
            {data.pages.filter(p => p.isPublished && !p.isDeleted).slice(0, 3).map(p => (
              <button
                key={p.id}
                onClick={() => setActiveView('page', p.slug)}
                className="hover:text-stone-300"
              >
                {p.title}
              </button>
            ))}
            <span className="text-stone-700">|</span>
            <span className="text-stone-500">بوابة عائلة البكري والبقري الموحدة</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
