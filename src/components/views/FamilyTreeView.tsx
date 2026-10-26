import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Member } from '../../types';
import { 
  GitFork, 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Upload, 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  X, 
  ShieldAlert, 
  Check, 
  Layers, 
  Filter,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

export const FamilyTreeView: React.FC = () => {
  const { data, can, saveMember, deleteMember, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<number | 'all'>('all');
  const [zoom, setZoom] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member>>({});
  const [activeTab, setActiveTab] = useState<'visual' | 'lineage_table'>('visual');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active (non-deleted) members
  const activeMembers = useMemo(() => {
    return data.members.filter(m => !m.isDeleted);
  }, [data.members]);

  // Filtered members for search and views
  const filteredMembers = useMemo(() => {
    return activeMembers.filter(m => {
      const matchSearch = m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.occupation || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchBranch = selectedBranch === 'all' || m.branchId === selectedBranch;
      const matchGen = selectedGeneration === 'all' || m.generation === selectedGeneration;
      return matchSearch && matchBranch && matchGen;
    });
  }, [activeMembers, searchQuery, selectedBranch, selectedGeneration]);

  // Group by generations (1 to 5+)
  const generations = useMemo(() => {
    const map = new Map<number, Member[]>();
    activeMembers.forEach(m => {
      const gen = m.generation || 1;
      if (!map.has(gen)) map.set(gen, []);
      map.get(gen)!.push(m);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [activeMembers]);

  // Check circular lineage prevention
  const validateNoCircularLink = (memberId: string | undefined, fatherId: string | null | undefined): boolean => {
    if (!fatherId) return true;
    if (memberId && memberId === fatherId) return false;
    
    let curId: string | null | undefined = fatherId;
    const visited = new Set<string>();
    while (curId) {
      if (curId === memberId) return false;
      if (visited.has(curId)) return false;
      visited.add(curId);
      const parent = activeMembers.find(m => m.id === curId);
      curId = parent?.fatherId;
    }
    return true;
  };

  const handleOpenAddModal = (parentMember?: Member) => {
    if (!can('tree', 'edit')) {
      showToast('ليس لديك صلاحية لإضافة أفراد للشجرة', 'error');
      return;
    }
    setEditingMember({
      fullName: '',
      gender: 'male',
      branchId: parentMember ? parentMember.branchId : (data.branches[0]?.id || 'br-1'),
      branchName: parentMember ? parentMember.branchName : (data.branches[0]?.name || 'فرع الرياض'),
      generation: parentMember ? parentMember.generation + 1 : 4,
      fatherId: parentMember ? parentMember.id : null,
      birthYear: '2000',
      isAlive: true,
      city: parentMember ? parentMember.city : 'الرياض',
      residenceCountry: 'المملكة العربية السعودية',
      isPrivate: false,
      status: 'active',
      occupation: '',
      phone: '',
      email: '',
      bio: '',
      customFields: {},
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    if (!can('tree', 'edit')) {
      showToast('ليس لديك صلاحية لتعديل بيانات العضو', 'error');
      return;
    }
    setEditingMember({ ...member });
    setIsEditModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember.fullName) {
      showToast('اسم العضو مطلوب', 'error');
      return;
    }

    // Verify circular
    if (!validateNoCircularLink(editingMember.id, editingMember.fatherId)) {
      showToast('خطأ: لا يمكن اختيار هذا الوالد لأنه يسبب حلقة نسب دائرية متناقضة!', 'error');
      return;
    }

    const branch = data.branches.find(b => b.id === editingMember.branchId);
    const memberToSave = {
      ...editingMember,
      branchName: branch ? branch.name : editingMember.branchName,
    };

    const res = await saveMember(memberToSave);
    if (res.success) {
      setIsEditModalOpen(false);
      setSelectedMember(null);
    }
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeMembers, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `albakri_family_tree_${Date.now()}.json`);
    dlAnchor.click();
    showToast('تم تصدير شجرة النسب بصيغة JSON');
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['المعرف', 'الاسم الكامل', 'الجنس', 'الفرع', 'الجيل', 'معرف الأب', 'سنة الميلاد', 'الحالة', 'المدينة', 'المهنة'];
    const rows = activeMembers.map(m => [
      m.id,
      `"${m.fullName.replace(/"/g, '""')}"`,
      m.gender === 'male' ? 'ذكر' : 'أنثى',
      `"${m.branchName}"`,
      m.generation,
      m.fatherId || '',
      m.birthYear,
      m.isAlive ? 'على قيد الحياة' : 'متوفى',
      `"${m.city}"`,
      `"${(m.occupation || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `albakri_family_tree_${Date.now()}.csv`);
    link.click();
    showToast('تم تصدير بيانات الشجرة بصيغة CSV');
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 text-right">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <GitFork className="w-4 h-4" />
            <span>المشجرة والنسب التفاعلي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            شجرة عائلة البكري وسلسلة الأنساب
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            توثيق متصل بالأجيال يبدأ من الجد المؤسس ويتفرع إلى مختلف الحواضر، مع فحص آلي لمنع التناقضات وحماية بيانات الأفراد.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {can('tree', 'export') && (
            <>
              <button
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="تصدير الشجرة لملف Excel/CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصدير CSV</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="px-3.5 py-2 bg-stone-850 hover:bg-stone-800 text-stone-300 border border-stone-750 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="تصدير الشجرة لملف JSON متكامل"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>تصدير JSON</span>
              </button>
            </>
          )}

          {can('tree', 'edit') && (
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة فرد للشجرة</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar: Search, Filters, Zoom, and View Toggle */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو المدينة أو المهنة..."
            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 pr-9 text-xs text-stone-100 placeholder-stone-500 outline-none"
          />
          <Search className="w-4 h-4 text-stone-500 absolute right-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-2.5 text-stone-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-200 outline-none"
          >
            <option value="all">كافة الفروع العائلية</option>
            {data.branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Generation Filter */}
          <select
            value={selectedGeneration}
            onChange={(e) => setSelectedGeneration(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-200 outline-none"
          >
            <option value="all">كافة الأجيال (1 - 5)</option>
            <option value={1}>الجيل الأول (الآباء المؤسسون)</option>
            <option value={2}>الجيل الثاني</option>
            <option value={3}>الجيل الثالث</option>
            <option value={4}>الجيل الرابع (الأعيان)</option>
            <option value={5}>الجيل الخامس (الشباب والأحفاد)</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-1 bg-stone-850 p-1 rounded-xl border border-stone-750">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'visual'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              المشجرة البصرية
            </button>
            <button
              onClick={() => setActiveTab('lineage_table')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                activeTab === 'lineage_table'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              جدول الأنساب
            </button>
          </div>
        </div>

        {/* Zoom Controls (for Visual tree) */}
        {activeTab === 'visual' && (
          <div className="flex items-center gap-1.5 text-xs text-stone-400">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.15, 1.6))}
              className="p-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-750"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="font-mono tabular-nums px-1 text-[11px]">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.65))}
              className="p-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-750"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 bg-stone-850 hover:bg-stone-800 text-stone-300 rounded-lg border border-stone-750"
              title="إعادة ضبط الحجم"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeTab === 'visual' ? (
        <div className="bg-stone-950 border border-stone-800 rounded-3xl p-6 overflow-x-auto min-h-[600px] shadow-inner relative">
          
          <div 
            className="transition-transform duration-200 origin-top flex flex-col items-center gap-12 py-4 min-w-[900px]"
            style={{ transform: `scale(${zoom})` }}
          >
            {generations.map(([genNumber, members]) => {
              const genMembers = members.filter(m => {
                const matchSearch = !searchQuery || m.fullName.toLowerCase().includes(searchQuery.toLowerCase());
                const matchBranch = selectedBranch === 'all' || m.branchId === selectedBranch;
                return matchSearch && matchBranch;
              });

              if (genMembers.length === 0) return null;

              return (
                <div key={genNumber} className="w-full flex flex-col items-center space-y-4">
                  {/* Generation Tag */}
                  <div className="flex items-center gap-3">
                    <div className="h-px w-16 bg-stone-800"></div>
                    <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold bg-stone-900 border border-stone-800 px-3 py-1 rounded-full">
                      الجيل {genNumber === 1 ? 'الأول (المؤسس)' : genNumber === 2 ? 'الثاني' : genNumber === 3 ? 'الثالث' : genNumber === 4 ? 'الرابع' : `الخامس`}
                    </span>
                    <div className="h-px w-16 bg-stone-800"></div>
                  </div>

                  {/* Member Cards in this Generation */}
                  <div className="flex flex-wrap items-center justify-center gap-5 max-w-6xl">
                    {genMembers.map(member => {
                      const branch = data.branches.find(b => b.id === member.branchId);
                      const parent = activeMembers.find(m => m.id === member.fatherId);
                      const isHighlighted = searchQuery && member.fullName.toLowerCase().includes(searchQuery.toLowerCase());

                      return (
                        <div
                          key={member.id}
                          onClick={() => setSelectedMember(member)}
                          className={`w-64 rounded-2xl border p-4 text-right transition-all duration-200 cursor-pointer relative group ${
                            isHighlighted
                              ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                              : 'bg-stone-900/90 border-stone-800 hover:border-amber-500/50 hover:bg-stone-850 shadow-md'
                          }`}
                        >
                          {/* Branch indicator */}
                          <div 
                            className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                            style={{ backgroundColor: branch?.colorHex || '#047857' }}
                          />

                          <div className="flex items-start gap-3 mt-1">
                            <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 overflow-hidden">
                              {member.avatarUrl ? (
                                <img src={member.avatarUrl} alt={member.fullName} className="w-full h-full object-cover" />
                              ) : (
                                <User className={`w-5 h-5 ${member.gender === 'female' ? 'text-rose-400' : 'text-amber-400'}`} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h4 className="font-heading font-bold text-xs text-stone-100 group-hover:text-amber-300 transition-colors truncate">
                                {member.fullName}
                              </h4>
                              <p className="text-[11px] text-stone-400 truncate mt-0.5">
                                {member.branchName}
                              </p>
                              {parent && (
                                <p className="text-[10px] text-stone-500 truncate">
                                  ابن: {parent.fullName.split(' ')[0]} {parent.fullName.split(' ')[1] || ''}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                            <span className="font-mono tabular-nums">
                              {member.birthYear} {member.deathYear ? ` - ${member.deathYear}م` : (member.isAlive ? '· حي' : '· متوفى')}
                            </span>
                            <span className="text-amber-400 group-hover:underline text-[10px]">
                              التفاصيل ←
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        /* Lineage Table View */
        <div className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-stone-850 border-b border-stone-800 text-stone-400 font-semibold">
                <tr>
                  <th className="py-3 px-4">الاسم الكامل</th>
                  <th className="py-3 px-4">الفرع</th>
                  <th className="py-3 px-4">الجيل</th>
                  <th className="py-3 px-4">اسم الوالد</th>
                  <th className="py-3 px-4">سنة الميلاد</th>
                  <th className="py-3 px-4">المدينة</th>
                  <th className="py-3 px-4">المهنة</th>
                  <th className="py-3 px-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-stone-200">
                {filteredMembers.map(member => {
                  const parent = activeMembers.find(m => m.id === member.fatherId);
                  return (
                    <tr key={member.id} className="hover:bg-stone-850/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-stone-100">{member.fullName}</td>
                      <td className="py-3 px-4 text-stone-300">{member.branchName}</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{member.generation}</td>
                      <td className="py-3 px-4 text-stone-400">{parent ? parent.fullName : '—'}</td>
                      <td className="py-3 px-4 font-mono tabular-nums">{member.birthYear}</td>
                      <td className="py-3 px-4 text-stone-300">{member.city}</td>
                      <td className="py-3 px-4 text-stone-400">{member.occupation || '—'}</td>
                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="p-1 hover:text-amber-400 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {can('tree', 'edit') && (
                            <button
                              onClick={() => handleOpenEditModal(member)}
                              className="p-1 hover:text-blue-400 transition-colors"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                          {can('members', 'delete') && (
                            <button
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من نقل العضو (${member.fullName}) إلى سلة المحذوفات؟`)) {
                                  deleteMember(member.id);
                                }
                              }}
                              className="p-1 hover:text-rose-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Member Detail Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pb-6 border-b border-stone-800">
              <div className="w-16 h-16 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center shrink-0 overflow-hidden">
                {selectedMember.avatarUrl ? (
                  <img src={selectedMember.avatarUrl} alt={selectedMember.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className={`w-8 h-8 ${selectedMember.gender === 'female' ? 'text-rose-400' : 'text-amber-400'}`} />
                )}
              </div>
              <div>
                <span className="text-[11px] text-amber-400 font-semibold">{selectedMember.branchName} · الجيل {selectedMember.generation}</span>
                <h3 className="font-heading font-bold text-xl text-stone-100 mt-1">
                  {selectedMember.fullName}
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  {selectedMember.occupation || 'شخصية كريمة من أبناء الأسرة'}
                </p>
              </div>
            </div>

            {/* Lineage Connections */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                الصلات والنسب العائلي
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">الوالد:</span>
                  <span className="font-semibold text-stone-200">
                    {activeMembers.find(m => m.id === selectedMember.fatherId)?.fullName || 'غير مسجل أو الجد المؤسس'}
                  </span>
                </div>

                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">سنة الميلاد / الوفاة:</span>
                  <span className="font-mono tabular-nums text-stone-200">
                    {selectedMember.birthYear} {selectedMember.deathYear ? ` - ${selectedMember.deathYear}` : ''} ({selectedMember.isAlive ? 'على قيد الحياة' : 'متوفى'})
                  </span>
                </div>

                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">المدينة والدولة:</span>
                  <span className="text-stone-200">
                    {selectedMember.city}، {selectedMember.residenceCountry}
                  </span>
                </div>

                {/* Privacy Filter: Only show phone/email to members with permission */}
                <div className="bg-stone-850 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block mb-1">بيانات التواصل:</span>
                  {can('members', 'viewPrivate') ? (
                    <span className="text-stone-200" dir="ltr">
                      {selectedMember.phone || selectedMember.email || 'غير مسجلة'}
                    </span>
                  ) : (
                    <span className="text-stone-500 italic flex items-center gap-1 text-[11px]">
                      <EyeOff className="w-3.5 h-3.5 text-amber-500" />
                      <span>محمية لخصوصية الأفراد (للأعضاء فقط)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Children List */}
              {activeMembers.filter(m => m.fatherId === selectedMember.id).length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-stone-400 block mb-2 font-medium">الأبناء والبنات:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeMembers.filter(m => m.fatherId === selectedMember.id).map(child => (
                      <button
                        key={child.id}
                        onClick={() => setSelectedMember(child)}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 hover:text-amber-400 text-xs rounded-xl border border-stone-700 transition-colors"
                      >
                        {child.fullName}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bio */}
              {selectedMember.bio && (
                <div className="pt-2">
                  <span className="text-xs text-stone-400 block mb-1 font-medium">نبذة تعريفية:</span>
                  <p className="text-xs text-stone-300 leading-relaxed bg-stone-850/50 p-3 rounded-xl border border-stone-800">
                    {selectedMember.bio}
                  </p>
                </div>
              )}

              {/* Custom Fields */}
              {selectedMember.customFields && Object.keys(selectedMember.customFields).length > 0 && (
                <div className="pt-2">
                  <span className="text-xs text-stone-400 block mb-2 font-medium">حقول وبيانات إضافية:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {data.customFields.map(field => {
                      const val = selectedMember.customFields?.[field.key];
                      if (!val) return null;
                      if (!field.isPublic && !can('members', 'viewPrivate')) return null;

                      return (
                        <div key={field.id} className="bg-stone-850 p-2.5 rounded-xl border border-stone-800">
                          <span className="text-stone-500 text-[11px] block">{field.label}:</span>
                          <span className="text-stone-200 font-medium">{val}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="mt-8 pt-4 border-t border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {can('tree', 'edit') && (
                  <button
                    onClick={() => {
                      handleOpenAddModal(selectedMember);
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة ابن/ابنة لهذا الفرد</span>
                  </button>
                )}
                {can('tree', 'edit') && (
                  <button
                    onClick={() => {
                      handleOpenEditModal(selectedMember);
                    }}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs flex items-center gap-1 border border-stone-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل البيانات</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-400 rounded-xl text-xs"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Member Add/Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-right max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-6 left-6 p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b border-stone-800 mb-6">
              <h3 className="font-heading font-bold text-lg text-amber-300">
                {editingMember.id ? 'تعديل بيانات العضو في شجرة النسب' : 'إضافة فرد جديد إلى شجرة النسب'}
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                التحقق الآلي من صحة الروابط ومنع الحلقات المتناقضة مفعل تلقائياً
              </p>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  الاسم الرباعي الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={editingMember.fullName || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, fullName: e.target.value })}
                  placeholder="مثال: فهد بن ماجد بن محمد البكري"
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الفرع العائلي *
                  </label>
                  <select
                    value={editingMember.branchId || 'br-1'}
                    onChange={(e) => setEditingMember({ ...editingMember, branchId: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    {data.branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الجيل العائلي *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editingMember.generation || 4}
                    onChange={(e) => setEditingMember({ ...editingMember, generation: Number(e.target.value) })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Father Link with validation */}
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  صلة النسب (اسم الوالد في الشجرة)
                </label>
                <select
                  value={editingMember.fatherId || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, fatherId: e.target.value || null })}
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                >
                  <option value="">لا يوجد والد مسجل (الجد المؤسس أو غير معروف)</option>
                  {activeMembers
                    .filter(m => m.id !== editingMember.id && m.gender === 'male')
                    .map(m => (
                      <option key={m.id} value={m.id}>
                        {m.fullName} ({m.branchName} · الجيل {m.generation})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الجنس
                  </label>
                  <select
                    value={editingMember.gender || 'male'}
                    onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value as any })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    سنة الميلاد
                  </label>
                  <input
                    type="text"
                    value={editingMember.birthYear || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, birthYear: e.target.value })}
                    placeholder="1990"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none font-mono tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    الحالة
                  </label>
                  <select
                    value={editingMember.isAlive ? 'true' : 'false'}
                    onChange={(e) => setEditingMember({ ...editingMember, isAlive: e.target.value === 'true' })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  >
                    <option value="true">على قيد الحياة</option>
                    <option value="false">متوفى رحمه الله</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    مدينة الإقامة
                  </label>
                  <input
                    type="text"
                    value={editingMember.city || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, city: e.target.value })}
                    placeholder="الرياض"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    المهنة أو التخصص
                  </label>
                  <input
                    type="text"
                    value={editingMember.occupation || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, occupation: e.target.value })}
                    placeholder="مهندس / طبيب / رجل أعمال..."
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    رقم الهاتف (بيانات خاصة)
                  </label>
                  <input
                    type="tel"
                    value={editingMember.phone || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    placeholder="+966 5x xxx xxxx"
                    dir="ltr"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={editingMember.email || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    placeholder="email@example.com"
                    dir="ltr"
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-300 mb-1">
                  نبذة وسيرة موجزة
                </label>
                <textarea
                  rows={2}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  placeholder="معلومات إضافية عن السيرة والاهتمامات..."
                  className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                />
              </div>

              {/* Dynamic Custom Fields configured in CMS */}
              {data.customFields.length > 0 && (
                <div className="pt-2 border-t border-stone-800">
                  <span className="text-xs font-semibold text-amber-400 block mb-2">
                    الحقول المخصصة الإضافية للأعضاء:
                  </span>
                  <div className="space-y-2.5">
                    {data.customFields.map(f => (
                      <div key={f.id}>
                        <label className="block text-xs font-medium text-stone-400 mb-1">
                          {f.label} {f.isRequired && '*'}
                        </label>
                        {f.type === 'select' ? (
                          <select
                            value={editingMember.customFields?.[f.key] || ''}
                            onChange={(e) => {
                              const updated = { ...(editingMember.customFields || {}), [f.key]: e.target.value };
                              setEditingMember({ ...editingMember, customFields: updated });
                            }}
                            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                          >
                            <option value="">-- اختر --</option>
                            {f.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={editingMember.customFields?.[f.key] || ''}
                            onChange={(e) => {
                              const updated = { ...(editingMember.customFields || {}), [f.key]: e.target.value };
                              setEditingMember({ ...editingMember, customFields: updated });
                            }}
                            className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  حفظ بيانات الفرد
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
