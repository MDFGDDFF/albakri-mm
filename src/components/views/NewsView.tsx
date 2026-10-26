import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { NewsItem } from '../../types';
import { 
  Newspaper, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  User, 
  X, 
  Clock, 
  Lock, 
  Share2, 
  CheckCircle2,
  FileText
} from 'lucide-react';

export const NewsView: React.FC = () => {
  const { data, can, saveNews, deleteNews, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [readingArticle, setReadingArticle] = useState<NewsItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Partial<NewsItem>>({});

  const categories = ['أخبار عامة', 'تكريم وإنجازات', 'وفيات وتعازي', 'أفراح وتبريكات', 'إعلانات رسمية'];

  const activeNews = useMemo(() => {
    return data.news.filter(n => !n.isDeleted);
  }, [data.news]);

  const filteredNews = useMemo(() => {
    return activeNews.filter(n => {
      const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || n.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [activeNews, searchQuery, selectedCategory]);

  const handleOpenAddModal = () => {
    if (!can('news', 'create')) {
      showToast('ليس لديك صلاحية لإنشاء أخبار', 'error');
      return;
    }
    setEditingArticle({
      title: '',
      summary: '',
      content: '',
      category: 'أخبار عامة',
      coverImageUrl: '/src/assets/images/isdud_old_village_1793007072701.jpg',
      publishDate: new Date().toISOString().split('T')[0],
      status: 'published',
      isMembersOnly: false,
      tags: [],
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (item: NewsItem) => {
    if (!can('news', 'edit')) {
      showToast('ليس لديك صلاحية لتعديل الأخبار', 'error');
      return;
    }
    setEditingArticle({ ...item });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle.title) {
      showToast('عنوان الخبر مطلوب', 'error');
      return;
    }
    await saveNews(editingArticle);
    setIsEditModalOpen(false);
    setReadingArticle(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Newspaper className="w-4 h-4" />
            <span>المركز الإعلامي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            أخبار وإعلانات عائلة البكري
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            متابعة مستمرة لأخبار الأسرة، المناسبات، التكريمات، والقرارات الرسمية لمجلس العائلة.
          </p>
        </div>

        {can('news', 'create') && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خبر أو إعلان جديد</span>
          </button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في الأخبار والإعلانات..."
            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 pr-9 text-xs text-stone-100 placeholder-stone-500 outline-none"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
        </div>

        {/* Category buttons (Interactive filter controls allowed) */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
            }`}
          >
            الكل ({activeNews.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-850 text-stone-300 hover:bg-stone-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map(item => (
          <article
            key={item.id}
            onClick={() => setReadingArticle(item)}
            className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden text-right flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-sm"
          >
            <div>
              <div className="aspect-[16/9] overflow-hidden bg-stone-950 relative">
                <img
                  src={item.coverImageUrl || '/src/assets/images/isdud_old_village_1793007072701.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>

              <div className="p-5 space-y-3">
                {/* Zero-Pill unboxed metadata text */}
                <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                  <span>{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-stone-400">{item.publishDate}</span>
                  {item.isMembersOnly && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-amber-500 flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>للأعضاء</span>
                      </span>
                    </>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                <span>{item.authorName}</span>
                <span className="text-amber-400 group-hover:underline text-[11px]">
                  قراءة التفاصيل ←
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Article Full Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-2xl w-full p-6 sm:p-10 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setReadingArticle(null)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4 pb-6 border-b border-stone-800">
              <div className="flex items-center gap-2 text-xs text-amber-400">
                <span>{readingArticle.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{readingArticle.publishDate}</span>
                <span aria-hidden="true">·</span>
                <span>بقلم: {readingArticle.authorName}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100 leading-tight">
                {readingArticle.title}
              </h2>

              <p className="text-sm text-stone-300 font-medium leading-relaxed bg-stone-850 p-4 rounded-xl border border-stone-800">
                {readingArticle.summary}
              </p>
            </div>

            {readingArticle.coverImageUrl && (
              <div className="my-6 rounded-2xl overflow-hidden border border-stone-800 aspect-[16/9] bg-stone-950">
                <img
                  src={readingArticle.coverImageUrl}
                  alt={readingArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Rich Content */}
            <div 
              className="prose prose-invert max-w-none text-stone-300 text-sm leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{ __html: readingArticle.content || readingArticle.summary }}
            />

            {/* Footer controls */}
            <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {can('news', 'edit') && (
                  <button
                    onClick={() => {
                      handleOpenEditModal(readingArticle);
                    }}
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs flex items-center gap-1.5 border border-stone-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل الخبر</span>
                  </button>
                )}
                {can('news', 'delete') && (
                  <button
                    onClick={() => {
                      if (confirm(`هل ترغب بنقل الخبر (${readingArticle.title}) لسلة المحذوفات؟`)) {
                        deleteNews(readingArticle.id);
                        setReadingArticle(null);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-xl text-xs flex items-center gap-1.5 border border-rose-800"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>حذف</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setReadingArticle(null)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Add / Edit Article Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-stone-800 mb-6">
              <h3 className="font-heading font-bold text-lg text-amber-300">
                {editingArticle.id ? 'تعديل الخبر أو المقال' : 'نشر خبر أو إعلان رسمي جديد'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  عنوان الخبر أو المقال *
                </label>
                <input
                  type="text"
                  required
                  value={editingArticle.title || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                  placeholder="أدخل عنواناً واضحاً ومعبراً..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    التصنيف *
                  </label>
                  <select
                    value={editingArticle.category || 'أخبار عامة'}
                    onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    تاريخ النشر
                  </label>
                  <input
                    type="date"
                    value={editingArticle.publishDate || ''}
                    onChange={(e) => setEditingArticle({ ...editingArticle, publishDate: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الموجز التحريري
                </label>
                <textarea
                  rows={2}
                  value={editingArticle.summary || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, summary: e.target.value })}
                  placeholder="موجز سريع يظهر في واجهة البطاقة..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  نص الخبر الكامل (يدعم الفقرات وHTML)
                </label>
                <textarea
                  rows={6}
                  value={editingArticle.content || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })}
                  placeholder="اكتب التفاصيل الكاملة هنا..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  رابط صورة الغلاف
                </label>
                <input
                  type="text"
                  value={editingArticle.coverImageUrl || ''}
                  onChange={(e) => setEditingArticle({ ...editingArticle, coverImageUrl: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                  <input
                    type="checkbox"
                    checked={editingArticle.isMembersOnly || false}
                    onChange={(e) => setEditingArticle({ ...editingArticle, isMembersOnly: e.target.checked })}
                    className="rounded border-stone-700 bg-stone-800 text-amber-500"
                  />
                  <span>خاص بأفراد العائلة فقط (محمي من الزوار)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  حفظ ونشر
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
