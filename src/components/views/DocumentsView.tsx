import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';
import { 
  FileText, 
  Search, 
  Download, 
  Lock, 
  Eye, 
  Plus, 
  Trash2, 
  X, 
  ShieldAlert, 
  Calendar,
  FileCheck
} from 'lucide-react';

export const DocumentsView: React.FC = () => {
  const { data, can, saveDocument, deleteDocument, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newDocData, setNewDocData] = useState<Partial<DocumentItem>>({
    title: '',
    documentType: 'وثيقة تاريخية',
    fileSize: '3.2 MB',
    fileExtension: 'PDF',
    description: '',
    isConfidential: true,
    fileUrl: '/src/assets/images/isdud_historic_document_1793007087282.jpg',
  });

  const docTypes = ['وثيقة تاريخية', 'حجة نسب', 'محضر اجتماع', 'تقرير مالي', 'شهادة وإنجاز', 'صك وقفي'];

  const activeDocs = useMemo(() => {
    return data.documents.filter(d => !d.isDeleted);
  }, [data.documents]);

  const filteredDocs = useMemo(() => {
    return activeDocs.filter(d => {
      const matchSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = selectedType === 'all' || d.documentType === selectedType;
      return matchSearch && matchType;
    });
  }, [activeDocs, searchQuery, selectedType]);

  const handleOpenAddModal = () => {
    if (!can('documents', 'create')) {
      showToast('ليس لديك صلاحية لإضافة وثائق', 'error');
      return;
    }
    setNewDocData({
      title: '',
      documentType: 'وثيقة تاريخية',
      fileSize: '2.5 MB',
      fileExtension: 'PDF',
      description: '',
      isConfidential: false,
      fileUrl: '/src/assets/images/isdud_historic_document_1793007087282.jpg',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocData.title) {
      showToast('عنوان الوثيقة مطلوب', 'error');
      return;
    }
    await saveDocument(newDocData);
    setIsAddModalOpen(false);
  };

  const handleDownload = (doc: DocumentItem) => {
    if (doc.isConfidential && !can('documents', 'downloadConfidential')) {
      showToast('هذه الوثيقة سرية وخاصة بأعضاء مجلس الأسرة المصرح لهم فقط', 'error');
      return;
    }
    showToast(`جاري تنزيل: ${doc.title}`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>السجل التاريخي والأوقاف</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            أرشيف وثائق ومخطوطات عائلة البكري
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            مستودع الوثائق الشرعية، صكوك النسب، أوقاف الأسرة، والمحاضر المعتمدة مع نظام حماية المحتوى السري.
          </p>
        </div>

        {can('documents', 'create') && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>أرشفة وثيقة جديدة</span>
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
            placeholder="ابحث في عناوين الوثائق والبيانات..."
            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 pr-9 text-xs text-stone-100 placeholder-stone-500 outline-none"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-200 outline-none"
          >
            <option value="all">كافة أنواع الوثائق ({activeDocs.length})</option>
            {docTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => {
          const isRestricted = doc.isConfidential && !can('documents', 'downloadConfidential');

          return (
            <div
              key={doc.id}
              className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-6 text-right flex flex-col justify-between transition-all duration-200 group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-amber-400 font-semibold">{doc.documentType}</span>
                  {doc.isConfidential ? (
                    <span className="text-[11px] text-amber-500 flex items-center gap-1 font-medium bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
                      <Lock className="w-3 h-3" />
                      <span>وثيقة خاصة</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                      <FileCheck className="w-3 h-3" />
                      <span>عامة</span>
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-base text-stone-100 group-hover:text-amber-300 transition-colors leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                  {doc.description}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center gap-3 text-[11px] text-stone-500 font-mono tabular-nums">
                  <span>الصيغة: {doc.fileExtension}</span>
                  <span>·</span>
                  <span>الحجم: {doc.fileSize}</span>
                  <span>·</span>
                  <span>تاريخ الرفع: {doc.uploadDate}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الوثيقة</span>
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  disabled={isRestricted}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isRestricted
                      ? 'bg-stone-850 text-stone-500 cursor-not-allowed border border-stone-800'
                      : 'bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700'
                  }`}
                  title={isRestricted ? 'يتطلب صلاحية وصول' : 'تحميل المستند'}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isRestricted ? 'محمية' : 'تنزيل'}</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setPreviewDoc(null)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-stone-800 mb-4">
              <span className="text-xs text-amber-400 font-semibold">{previewDoc.documentType}</span>
              <h2 className="font-heading font-bold text-xl text-stone-100 mt-1">
                {previewDoc.title}
              </h2>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                {previewDoc.description}
              </p>
            </div>

            {/* Document Image preview */}
            <div className="rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 aspect-[4/3] max-h-[55vh] flex items-center justify-center p-2">
              <img
                src={previewDoc.fileUrl || '/src/assets/images/isdud_historic_document_1793007087282.jpg'}
                alt={previewDoc.title}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
              <div className="text-xs text-stone-400 font-mono tabular-nums">
                <span>تاريخ التوثيق: {previewDoc.uploadDate} · الصيغة: {previewDoc.fileExtension} ({previewDoc.fileSize})</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload(previewDoc)}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل نسخة عالية الدقة</span>
                </button>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-stone-800 text-stone-400 rounded-xl text-xs hover:bg-stone-750"
                >
                  إغلاق
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Add Document Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right">
            
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-amber-300 pb-4 border-b border-stone-800 mb-6">
              أرشفة وتوثيق مستند تاريخي جديد
            </h3>

            <form onSubmit={handleSaveDoc} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  عنوان الوثيقة أو الصك *
                </label>
                <input
                  type="text"
                  required
                  value={newDocData.title || ''}
                  onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
                  placeholder="مثال: صك وقفية بئر ونخيل عائلة البكري لعام 1288هـ"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    نوع الوثيقة
                  </label>
                  <select
                    value={newDocData.documentType || 'وثيقة تاريخية'}
                    onChange={(e) => setNewDocData({ ...newDocData, documentType: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    {docTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    حجم الملف التقريبي
                  </label>
                  <input
                    type="text"
                    value={newDocData.fileSize || '3.5 MB'}
                    onChange={(e) => setNewDocData({ ...newDocData, fileSize: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الوصف والمضمون التاريخي
                </label>
                <textarea
                  rows={3}
                  value={newDocData.description || ''}
                  onChange={(e) => setNewDocData({ ...newDocData, description: e.target.value })}
                  placeholder="بيان أسماء الشهود وتاريخ التحرير والجهة المصدقة..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  رابط الملف أو الصورة الممسوحة ضوئياً
                </label>
                <input
                  type="text"
                  value={newDocData.fileUrl || ''}
                  onChange={(e) => setNewDocData({ ...newDocData, fileUrl: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-300">
                  <input
                    type="checkbox"
                    checked={newDocData.isConfidential || false}
                    onChange={(e) => setNewDocData({ ...newDocData, isConfidential: e.target.checked })}
                    className="rounded border-stone-700 bg-stone-800 text-amber-500"
                  />
                  <span>وثيقة سرية / خاصة بمجلس الأسرة فقط</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  حفظ الوثيقة بالأرشيف
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
