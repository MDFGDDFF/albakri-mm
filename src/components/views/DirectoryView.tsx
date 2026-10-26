import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  User, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  EyeOff, 
  Eye, 
  ShieldCheck, 
  ChevronLeft,
  X
} from 'lucide-react';

export const DirectoryView: React.FC = () => {
  const { data, can, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all'); // all, living, deceased
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const activeMembers = useMemo(() => {
    return data.members.filter(m => !m.isDeleted);
  }, [data.members]);

  const filteredMembers = useMemo(() => {
    return activeMembers.filter(m => {
      const matchSearch = 
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.occupation || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchBranch = selectedBranch === 'all' || m.branchId === selectedBranch;
      const matchStatus = 
        selectedStatus === 'all' || 
        (selectedStatus === 'living' && m.isAlive) || 
        (selectedStatus === 'deceased' && !m.isAlive);
      return matchSearch && matchBranch && matchStatus;
    });
  }, [activeMembers, searchQuery, selectedBranch, selectedStatus]);

  const handleExportCSV = () => {
    if (!can('members', 'export')) {
      showToast('ليس لديك صلاحية لتصدير دليل الأعضاء', 'error');
      return;
    }
    const headers = ['المعرف', 'الاسم', 'الفرع', 'الجيل', 'المدينة', 'سنة الميلاد', 'الحالة', 'المهنة'];
    const rows = filteredMembers.map(m => [
      m.id,
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.branchName}"`,
      m.generation,
      `"${m.city}"`,
      m.birthYear,
      m.isAlive ? 'حي' : 'متوفى',
      `"${(m.occupation || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `albakri_directory_${Date.now()}.csv`);
    link.click();
    showToast('تم تصدير دليل الأعضاء بنجاح');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>السجل المدني والأسري</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            دليل أفراد عائلة البكري
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-xl">
            دليل منظم للأعضاء مصنف حسب الفروع والحواضر مع حفظ خصوصية أرقام التواصل.
          </p>
        </div>

        {can('members', 'export') && (
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750 text-xs font-medium rounded-xl flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>تصدير دليل الأعضاء (CSV)</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، المهنة، أو المدينة..."
            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 pr-9 text-xs text-stone-100 placeholder-stone-500 outline-none"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute left-2.5 top-2.5 text-stone-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-200 outline-none"
          >
            <option value="all">كافة الفروع ({activeMembers.length})</option>
            {data.branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-200 outline-none"
          >
            <option value="all">كافة الحالات</option>
            <option value="living">الأحياء فقط</option>
            <option value="deceased">المتوفون رحمهم الله</option>
          </select>

          <div className="flex items-center gap-1 bg-stone-850 p-1 rounded-xl border border-stone-750">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              بطاقات
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table' ? 'bg-amber-500 text-stone-950 font-bold' : 'text-stone-400 hover:text-white'
              }`}
            >
              جدول
            </button>
          </div>
        </div>

      </div>

      {/* Privacy Notice Banner if not logged in as authorized member */}
      {!can('members', 'viewPrivate') && (
        <div className="bg-amber-950/30 border border-amber-600/30 rounded-2xl p-4 flex items-center gap-3 text-right">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <p className="text-xs text-amber-200/90 leading-relaxed">
            <strong>تنويه الخصوصية الأسرية:</strong> أرقام الهواتف والبيانات الشخصية الخاصة للأفراد محجوبة عن الزوار العامين وتتاح حصرًا لأبناء العائلة المسجلين بعد تسجيل الدخول.
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredMembers.map((member) => {
            const branch = data.branches.find(b => b.id === member.branchId);

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-5 text-right flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-amber-400 font-semibold">{member.branchName}</span>
                    <span className="text-[10px] text-stone-400 font-mono tabular-nums">الجيل {member.generation}</span>
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 overflow-hidden">
                      {member.avatarUrl ? (
                        <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                      ) : (
                        <User className={`w-6 h-6 ${member.gender === 'female' ? 'text-rose-400' : 'text-amber-400'}`} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-heading font-bold text-sm text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                        {member.fullName}
                      </h3>
                      <p className="text-xs text-stone-400 truncate mt-0.5">
                        {member.occupation || 'عضو في العائلة'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-400 pt-2 border-t border-stone-800/80">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-500" />
                      <span>{member.city}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {can('members', 'viewPrivate') && member.phone ? (
                        <>
                          <Phone className="w-3.5 h-3.5 text-stone-500" />
                          <span dir="ltr">{member.phone}</span>
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3.5 h-3.5 text-stone-600" />
                          <span className="text-[11px] text-stone-500">الهاتف محمي للخصوصية</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="font-mono tabular-nums">مواليد {member.birthYear}</span>
                  <span className="text-amber-400 group-hover:underline">عرض الملف الشخصي ←</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-850 border-b border-stone-800 text-stone-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">الاسم الكامل</th>
                  <th className="py-3 px-4">الفرع</th>
                  <th className="py-3 px-4">الجيل</th>
                  <th className="py-3 px-4">المدينة</th>
                  <th className="py-3 px-4">المهنة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الهاتف</th>
                  <th className="py-3 px-4 text-left">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-200">
                {filteredMembers.map(member => (
                  <tr key={member.id} className="hover:bg-stone-850/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-stone-100">{member.fullName}</td>
                    <td className="py-3 px-4 text-stone-300">{member.branchName}</td>
                    <td className="py-3 px-4 font-mono tabular-nums">{member.generation}</td>
                    <td className="py-3 px-4 text-stone-300">{member.city}</td>
                    <td className="py-3 px-4 text-stone-400">{member.occupation || '—'}</td>
                    <td className="py-3 px-4 text-stone-400">{member.isAlive ? 'حي' : 'متوفى'}</td>
                    <td className="py-3 px-4">
                      {can('members', 'viewPrivate') && member.phone ? (
                        <span dir="ltr">{member.phone}</span>
                      ) : (
                        <span className="text-stone-500 italic">محمي</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-left">
                      <button
                        onClick={() => setSelectedMember(member)}
                        className="text-amber-400 hover:text-amber-300 font-medium"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Profile Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-right">
            
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-6 border-b border-stone-800">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 overflow-hidden">
                <User className={`w-8 h-8 ${selectedMember.gender === 'female' ? 'text-rose-400' : 'text-amber-400'}`} />
              </div>
              <div>
                <span className="text-xs text-amber-400 font-semibold">{selectedMember.branchName} · الجيل {selectedMember.generation}</span>
                <h3 className="font-heading font-bold text-xl text-stone-100 mt-0.5">
                  {selectedMember.fullName}
                </h3>
                <p className="text-xs text-stone-400">
                  {selectedMember.occupation || 'عضو في العائلة'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">المدينة:</span>
                  <span className="font-medium text-stone-200">{selectedMember.city}</span>
                </div>
                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">سنة الميلاد:</span>
                  <span className="font-mono tabular-nums text-stone-200">{selectedMember.birthYear}</span>
                </div>
              </div>

              <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                <span className="text-stone-400 block mb-1">بيانات الاتصال:</span>
                {can('members', 'viewPrivate') ? (
                  <div className="space-y-1 font-mono" dir="ltr">
                    {selectedMember.phone && <p>الهاتف: {selectedMember.phone}</p>}
                    {selectedMember.email && <p>البريد: {selectedMember.email}</p>}
                    {!selectedMember.phone && !selectedMember.email && <p className="text-stone-500">لا توجد بيانات اتصال</p>}
                  </div>
                ) : (
                  <p className="text-stone-500 italic">
                    البيانات خاصة بأفراد العائلة المصرح لهم فقط.
                  </p>
                )}
              </div>

              {selectedMember.bio && (
                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">نبذة:</span>
                  <p className="text-stone-300 leading-relaxed">{selectedMember.bio}</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-4 border-t border-stone-800 text-left">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
