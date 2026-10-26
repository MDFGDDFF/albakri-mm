import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, ArrowRight, Calendar, Edit3 } from 'lucide-react';

export const CustomPageView: React.FC = () => {
  const { data, selectedPageSlug, setActiveView, can } = useApp();

  const page = data.pages.find(p => p.slug === selectedPageSlug && !p.isDeleted);

  if (!page) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center text-stone-300 space-y-4">
        <FileText className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold font-heading">الصفحة المطلوبة غير موجودة</h2>
        <p className="text-xs text-stone-400">ربما تم حذفها أو تعديل مسارها من لوحة التحكم.</p>
        <button
          onClick={() => setActiveView('home')}
          className="px-5 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs hover:bg-amber-400"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right">
      
      {/* Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setActiveView('home')}
            className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </button>

          {can('cms', 'managePages') && (
            <button
              onClick={() => setActiveView('admin')}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 bg-stone-850 px-3 py-1.5 rounded-lg border border-stone-750"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل هذه الصفحة في CMS</span>
            </button>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-heading font-bold text-stone-100 leading-tight">
          {page.title}
        </h1>

        <div className="flex items-center gap-2 text-xs text-stone-400 font-mono tabular-nums pt-2 border-t border-stone-800">
          <span>آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-SA')}</span>
          <span>·</span>
          <span>المسار: /page/{page.slug}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 text-stone-200 leading-relaxed text-sm">
        <div 
          className="prose prose-invert max-w-none text-stone-300 space-y-4 leading-relaxed font-sans"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>

    </div>
  );
};
