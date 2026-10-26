import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EventItem } from '../../types';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  CheckCircle2, 
  X, 
  Share2, 
  Building
} from 'lucide-react';

export const EventsView: React.FC = () => {
  const { data, can, saveEvent, deleteEvent, rsvpEvent, currentUser, showToast } = useApp();

  const [filterType, setFilterType] = useState('all'); // all, upcoming, completed
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<EventItem>>({});
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const eventTypes = ['عرس', 'اجتماع سنوي', 'لقاء دوري', 'ندوة ثقافية', 'عزاء', 'نشاط اجتماعي', 'مبادرة شبابية'];

  const activeEvents = useMemo(() => {
    return data.events.filter(e => !e.isDeleted);
  }, [data.events]);

  const filteredEvents = useMemo(() => {
    return activeEvents.filter(e => {
      if (filterType === 'all') return true;
      return e.status === filterType;
    });
  }, [activeEvents, filterType]);

  const handleOpenAddModal = () => {
    if (!can('events', 'create')) {
      showToast('ليس لديك صلاحية لإضافة مناسبات', 'error');
      return;
    }
    setEditingEvent({
      title: '',
      type: 'اجتماع سنوي',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 مساءً',
      location: 'ديوان العائلة المركزي - فلسطين',
      mapLocationName: 'ديوان العائلة',
      description: '',
      coverImageUrl: '/src/assets/images/isdud_family_gathering_1793007101547.jpg',
      status: 'upcoming',
      isMembersOnly: false,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (evt: EventItem) => {
    if (!can('events', 'edit')) {
      showToast('ليس لديك صلاحية لتعديل المناسبات', 'error');
      return;
    }
    setEditingEvent({ ...evt });
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent.title || !editingEvent.date) {
      showToast('عنوان المناسبة وتاريخها مطلوبان', 'error');
      return;
    }
    await saveEvent(editingEvent);
    setIsEditModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>صلة الرحم واللقاءات</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            مناسبات وفعاليات عائلة البكري
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            تقويم الأعراس، الاجتماع السنوي، اللقاءات الدورية، ومجالس التعزية مع إمكانية تأكيد الحضور المباشر.
          </p>
        </div>

        {can('events', 'create') && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة مناسبة أو فعالية</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 p-2 rounded-2xl w-fit">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filterType === 'all' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          كافة المناسبات ({activeEvents.length})
        </button>
        <button
          onClick={() => setFilterType('upcoming')}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filterType === 'upcoming' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          المناسبات القادمة
        </button>
        <button
          onClick={() => setFilterType('completed')}
          className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-colors ${
            filterType === 'completed' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-300 hover:bg-stone-800'
          }`}
        >
          المناسبات السابقة
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map(evt => {
          const isAttending = evt.attendees?.includes(currentUser.name);

          return (
            <div
              key={evt.id}
              className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl overflow-hidden text-right flex flex-col justify-between transition-all duration-200 shadow-sm"
            >
              <div>
                <div className="aspect-[21/9] overflow-hidden bg-stone-950 relative">
                  <img
                    src={evt.coverImageUrl || '/src/assets/images/isdud_family_gathering_1793007101547.jpg'}
                    alt={evt.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-stone-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs text-amber-400 border border-stone-800 font-semibold">
                    {evt.type}
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <span className="text-xs text-amber-400 font-mono tabular-nums block mb-1">
                      {evt.date} · {evt.time}
                    </span>
                    <h3 className="font-heading font-bold text-xl text-stone-100 leading-snug">
                      {evt.title}
                    </h3>
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-400 pt-2 border-t border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-mono tabular-nums">{evt.rsvpCount || 0} فرد أكدوا حضورهم</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-stone-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {can('events', 'edit') && (
                      <button
                        onClick={() => handleOpenEditModal(evt)}
                        className="p-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg border border-stone-700"
                        title="تعديل المناسبة"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {can('events', 'delete') && (
                      <button
                        onClick={() => {
                          if (confirm(`هل ترغب بنقل مناسبة (${evt.title}) لسلة المحذوفات؟`)) {
                            deleteEvent(evt.id);
                          }
                        }}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg border border-rose-800"
                        title="حذف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => rsvpEvent(evt.id)}
                    className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isAttending
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{isAttending ? 'حضورك مؤكد (اضغط للإلغاء)' : 'تأكيد الحضور'}</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add / Edit Event Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-stone-800 mb-6">
              <h3 className="font-heading font-bold text-lg text-amber-300">
                {editingEvent.id ? 'تعديل بيانات المناسبة' : 'إضافة مناسبة أو فعالية جديدة'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  عنوان المناسبة *
                </label>
                <input
                  type="text"
                  required
                  value={editingEvent.title || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                  placeholder="مثال: حفل زفاف الشاب طارق بن خالد البكري"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    نوع المناسبة *
                  </label>
                  <select
                    value={editingEvent.type || 'اجتماع سنوي'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, type: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    {eventTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={editingEvent.status || 'upcoming'}
                    onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    <option value="upcoming">قادمة</option>
                    <option value="ongoing">جارية حاليًا</option>
                    <option value="completed">منتهية</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    required
                    value={editingEvent.date || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الوقت
                  </label>
                  <input
                    type="text"
                    value={editingEvent.time || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, time: e.target.value })}
                    placeholder="08:00 مساءً"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الموقع والقاعة
                </label>
                <input
                  type="text"
                  value={editingEvent.location || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                  placeholder="مثال: فندق ميريديان الخبر - القاعة الكبرى"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  وصف المناسبة وتفاصيل الدعوة
                </label>
                <textarea
                  rows={3}
                  value={editingEvent.description || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                  placeholder="أدخل نص الدعوة أو برنامج المناسبة..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  رابط صورة الغلاف
                </label>
                <input
                  type="text"
                  value={editingEvent.coverImageUrl || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, coverImageUrl: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                  dir="ltr"
                />
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
                  حفظ المناسبة
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
