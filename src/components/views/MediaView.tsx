import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MediaAlbum, MediaItem } from '../../types';
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Maximize2, 
  Calendar,
  Lock,
  Upload
} from 'lucide-react';

export const MediaView: React.FC = () => {
  const { data, can, saveAlbum, deleteAlbum, addMediaItem, showToast } = useApp();

  const [selectedAlbum, setSelectedAlbum] = useState<MediaAlbum | null>(null);
  const [activeMediaItem, setActiveMediaItem] = useState<MediaItem | null>(null);
  const [isNewAlbumModalOpen, setIsNewAlbumModalOpen] = useState(false);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [newAlbumData, setNewAlbumData] = useState<Partial<MediaAlbum>>({
    title: '',
    description: '',
    category: 'معالم بلدة إسدود',
    coverImageUrl: '/src/assets/images/isdud_panoramic_heritage_1793007031421.jpg',
    isMembersOnly: false,
  });
  const [newMediaItemData, setNewMediaItemData] = useState({
    title: '',
    url: '/src/assets/images/isdud_old_village_1793007072701.jpg',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const activeAlbums = useMemo(() => {
    return data.albums.filter(a => !a.isDeleted);
  }, [data.albums]);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumData.title) {
      showToast('عنوان الألبوم مطلوب', 'error');
      return;
    }
    await saveAlbum(newAlbumData);
    setIsNewAlbumModalOpen(false);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;
    if (!newMediaItemData.title || !newMediaItemData.url) {
      showToast('العنوان ورابط الصورة مطلوبان', 'error');
      return;
    }
    await addMediaItem(selectedAlbum.id, newMediaItemData);
    setIsAddMediaModalOpen(false);
    // Refresh selected album
    const updated = data.albums.find(a => a.id === selectedAlbum.id);
    if (updated) setSelectedAlbum(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <ImageIcon className="w-4 h-4" />
            <span>المكتبة المرئية</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            معرض صور وفيديوهات عائلة البكري
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            أرشيف مصور للزيارات السنوية، توثيق المعالم التراثية، والأفراح العائلية عبر الأجيال.
          </p>
        </div>

        {can('media', 'create') && (
          <button
            onClick={() => setIsNewAlbumModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء ألبوم جديد</span>
          </button>
        )}
      </div>

      {/* Back button if inside album */}
      {selectedAlbum && (
        <div className="flex items-center justify-between bg-stone-900 border border-stone-800 p-4 rounded-2xl text-right">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedAlbum(null)}
              className="p-1.5 bg-stone-850 hover:bg-stone-800 text-amber-400 rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
              <span>العودة لكافة الألبومات</span>
            </button>
            <h2 className="font-heading font-bold text-base text-stone-100">
              {selectedAlbum.title}
            </h2>
          </div>

          {can('media', 'create') && (
            <button
              onClick={() => setIsAddMediaModalOpen(true)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة صورة للألبوم</span>
            </button>
          )}
        </div>
      )}

      {/* Main Albums Grid OR Album Items Grid */}
      {!selectedAlbum ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeAlbums.map(album => (
            <div
              key={album.id}
              onClick={() => setSelectedAlbum(album)}
              className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden text-right flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-sm"
            >
              <div className="aspect-[16/10] overflow-hidden bg-stone-950 relative">
                <img
                  src={album.coverImageUrl || '/src/assets/images/isdud_panoramic_heritage_1793007031421.jpg'}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-4 right-4 left-4">
                  <span className="text-xs text-amber-400 font-semibold">{album.category}</span>
                  <h3 className="font-heading font-bold text-base text-stone-100 mt-0.5 line-clamp-1">
                    {album.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80">
                <span className="font-mono tabular-nums">{album.items.length} صورة ومستند</span>
                <span className="text-amber-400 group-hover:underline">فتح الألبوم ←</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Inside Album: Media Items */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedAlbum.items.map(item => (
              <div
                key={item.id}
                onClick={() => setActiveMediaItem(item)}
                className="group relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 aspect-[4/3] cursor-pointer hover:border-amber-500/40 transition-all shadow-sm"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-right">
                  <span className="text-xs font-semibold text-stone-100 truncate">{item.title}</span>
                  <span className="text-[11px] text-amber-400 font-mono tabular-nums">{item.date}</span>
                </div>
              </div>
            ))}
          </div>

          {selectedAlbum.items.length === 0 && (
            <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl text-stone-400">
              <p className="text-sm">هذا الألبوم فارغ حالياً.</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeMediaItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            
            <button
              onClick={() => setActiveMediaItem(null)}
              className="absolute -top-12 left-0 p-2 text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="rounded-2xl overflow-hidden border border-stone-800 bg-stone-950 max-h-[75vh] flex items-center justify-center">
              <img
                src={activeMediaItem.url}
                alt={activeMediaItem.title}
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>

            <div className="mt-4 text-center text-stone-200 space-y-1">
              <h3 className="font-heading font-bold text-lg text-stone-100">{activeMediaItem.title}</h3>
              {activeMediaItem.description && (
                <p className="text-xs text-stone-400 max-w-lg mx-auto">{activeMediaItem.description}</p>
              )}
              <span className="text-xs text-amber-400 font-mono tabular-nums">{activeMediaItem.date}</span>
            </div>

          </div>
        </div>
      )}

      {/* New Album Modal */}
      {isNewAlbumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right">
            
            <button
              onClick={() => setIsNewAlbumModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-amber-300 pb-4 border-b border-stone-800 mb-6">
              إنشاء ألبوم وسائط جديد
            </h3>

            <form onSubmit={handleCreateAlbum} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  عنوان الألبوم *
                </label>
                <input
                  type="text"
                  required
                  value={newAlbumData.title || ''}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, title: e.target.value })}
                  placeholder="مثال: صور اللقاء السنوي لعام 2026م"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  التصنيف
                </label>
                <select
                  value={newAlbumData.category || 'معالم بلدة إسدود'}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, category: e.target.value as any })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                >
                  <option value="معالم بلدة إسدود">معالم بلدة إسدود</option>
                  <option value="وثائق ورجالات العائلة">وثائق ورجالات العائلة</option>
                  <option value="تاريخي وتراثي">تاريخي وتراثي</option>
                  <option value="اجتماعات العائلة">اجتماعات العائلة</option>
                  <option value="مناسبات حديثة">مناسبات حديثة</option>
                  <option value="تكريم وجوائز">تكريم وجوائز</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الوصف
                </label>
                <textarea
                  rows={2}
                  value={newAlbumData.description || ''}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, description: e.target.value })}
                  placeholder="نبذة عن محتوى الألبوم ومكانه..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  رابط صورة الغلاف
                </label>
                <input
                  type="text"
                  value={newAlbumData.coverImageUrl || ''}
                  onChange={(e) => setNewAlbumData({ ...newAlbumData, coverImageUrl: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewAlbumModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  إنشاء الألبوم
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Add Media Item Modal */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right">
            
            <button
              onClick={() => setIsAddMediaModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-heading font-bold text-lg text-amber-300 pb-4 border-b border-stone-800 mb-6">
              إضافة صورة إلى: {selectedAlbum?.title}
            </h3>

            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  عنوان الصورة *
                </label>
                <input
                  type="text"
                  required
                  value={newMediaItemData.title}
                  onChange={(e) => setNewMediaItemData({ ...newMediaItemData, title: e.target.value })}
                  placeholder="مثال: لقطة تذكارية لأعيان الفرع"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  رابط الصورة أو المسار *
                </label>
                <input
                  type="text"
                  required
                  value={newMediaItemData.url}
                  onChange={(e) => setNewMediaItemData({ ...newMediaItemData, url: e.target.value })}
                  placeholder="/src/assets/images/..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  التاريخ أو المناسبة
                </label>
                <input
                  type="text"
                  value={newMediaItemData.date}
                  onChange={(e) => setNewMediaItemData({ ...newMediaItemData, date: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الوصف والتفاصيل
                </label>
                <textarea
                  rows={2}
                  value={newMediaItemData.description}
                  onChange={(e) => setNewMediaItemData({ ...newMediaItemData, description: e.target.value })}
                  placeholder="بيان أسماء من في الصورة أو المناسبة..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-stone-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMediaModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  إدراج الصورة
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
