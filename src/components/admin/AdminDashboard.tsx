import React, { useState, useEffect } from 'react';
import { useApp, isAuthorizedAdmin } from '../../context/AppContext';
import { 
  DynamicSection, 
  CustomPage, 
  NavLinkItem, 
  CustomField, 
  UserAccount, 
  Role, 
  SiteSettings 
} from '../../types';
import { 
  Layers, 
  FileText, 
  Users, 
  GitFork, 
  Sliders, 
  Newspaper, 
  Calendar, 
  Image as ImageIcon, 
  Coins, 
  Shield, 
  Trash2, 
  History, 
  Settings as SettingsIcon, 
  Check, 
  X, 
  Plus, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle,
  UserCheck,
  Building,
  Save,
  Key,
  LogOut
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const { 
    data, 
    currentRole, 
    currentUser, 
    can, 
    updateSections, 
    updateSection, 
    savePage, 
    deletePage, 
    restorePage, 
    updateNavLinks, 
    updateSettings, 
    addCustomField, 
    deleteCustomField, 
    saveUser, 
    deleteUser, 
    saveRole, 
    deleteMember,
    restoreMember,
    deleteNews,
    restoreNews,
    deleteEvent,
    restoreEvent,
    deleteDocument,
    restoreDocument,
    deleteTransaction,
    restoreTransaction,
    resetDatabase,
    restoreDatabase,
    showToast,
    setActiveView,
    setIsLoginModalOpen,
    logout
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    | 'sections'
    | 'pages_nav'
    | 'members_tree'
    | 'custom_fields'
    | 'news'
    | 'events'
    | 'fund'
    | 'users_roles'
    | 'join_requests'
    | 'recycle_bin'
    | 'audit_log'
    | 'settings'
  >('sections');

  // Recycle bin items
  const [recycleBinItems, setRecycleBinItems] = useState<any[]>([]);

  // Modals inside CMS
  const [isNewPageModalOpen, setIsNewPageModalOpen] = useState(false);
  const [newPageData, setNewPageData] = useState<Partial<CustomPage>>({
    title: '',
    slug: '',
    content: '<p>محتوى الصفحة الجديد...</p>',
    isPublished: true,
  });

  const [isNewFieldModalOpen, setIsNewFieldModalOpen] = useState(false);
  const [newFieldData, setNewFieldData] = useState<Partial<CustomField>>({
    label: '',
    key: '',
    type: 'text',
    isRequired: false,
    isPublic: true,
  });

  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserData, setNewUserData] = useState<Partial<UserAccount>>({
    name: '',
    email: '',
    roleId: data.roles[0]?.id || 'role-admin',
    phone: '',
    branchName: 'فرع الرياض',
    status: 'active',
  });

  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState<Partial<Role>>({
    name: '',
    description: '',
    permissions: JSON.parse(JSON.stringify(data.roles[0].permissions)),
  });

  // Settings local state for saving
  const [localSettings, setLocalSettings] = useState<SiteSettings>(data.settings);

  useEffect(() => {
    setLocalSettings(data.settings);
  }, [data.settings]);

  // Load recycle bin items
  const loadRecycleBin = async () => {
    const res = await api.getRecycleBin();
    if (res && res.items) {
      setRecycleBinItems(res.items);
    }
  };

  useEffect(() => {
    if (activeTab === 'recycle_bin') {
      loadRecycleBin();
    }
  }, [activeTab, data]);

  // Section Reorder Handlers
  const moveSection = async (index: number, direction: 'up' | 'down') => {
    const currentSections = [...data.sections].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    // Swap order values
    const tempOrder = currentSections[index].order;
    currentSections[index].order = currentSections[targetIndex].order;
    currentSections[targetIndex].order = tempOrder;

    await updateSections(currentSections);
  };

  const toggleSectionEnabled = async (section: DynamicSection) => {
    await updateSection(section.id, { enabled: !section.enabled });
  };

  // Nav Links Reorder
  const moveNavLink = async (index: number, direction: 'up' | 'down') => {
    const links = [...data.navLinks].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const temp = links[index].order;
    links[index].order = links[targetIndex].order;
    links[targetIndex].order = temp;

    await updateNavLinks(links);
  };

  // Backup Download
  const handleDownloadBackup = () => {
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', jsonStr);
    dl.setAttribute('download', `albakri_full_backup_${Date.now()}.json`);
    dl.click();
    showToast('تم تصدير نسخة احتياطية كاملة من النظام بنجاح');
  };

  // Restore Backup
  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        await restoreDatabase(parsed);
      } catch (err) {
        showToast('ملف النسخة الاحتياطية غير صالح', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Strictly block anyone who is not majed1 or majed2
  if (!isAuthorizedAdmin(currentUser)) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto my-12 space-y-6 shadow-2xl animate-in fade-in">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-stone-100">
            منطقة محظورة - لوحة التحكم الإدارية
          </h2>
          <p className="text-xs text-stone-400 mt-2 leading-relaxed">
            لوحة التحكم CMS مخصصة فقط لمديري النظام المعتمدين (<span className="text-amber-400 font-bold font-mono">majed1</span> و <span className="text-amber-400 font-bold font-mono">majed2</span>).
            <br />
            تصفح الموقع متاح للجميع، ولكن الوصول إلى أدوات الإدارة والتعديل محصور بهذين الحسابين فقط.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setActiveView('home')}
            className="w-full sm:w-auto px-5 py-2.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold transition-colors"
          >
            العودة للموقع العام
          </button>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold transition-all shadow-md"
          >
            تسجيل دخول الإدارة (Admin)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>لوحة التحكم الشاملة CMS v2.4</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
            إدارة وتطوير منظومة {data.settings.familyName}
          </h1>
          <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
            تحكم كامل في كافة أقسام وصفحات ومحتويات الموقع، مع إدارة الأنساب وفروع العائلة في الداخل والخارج، النماذج المخصصة، الصلاحيات، والنسخ الاحتياطي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-left bg-stone-950/60 px-4 py-2 rounded-xl border border-stone-800 text-xs">
            <span className="text-stone-400 block text-[10px]">الجلسة الإدارية:</span>
            <span className="font-bold text-amber-400">{currentUser.name}</span>
            <span className="text-stone-500 text-[10px] block font-mono">(@{currentUser.username})</span>
          </div>

          <button
            onClick={() => setActiveView('home')}
            className="px-3 py-2 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-xl text-xs border border-stone-700 transition-colors"
            title="معاينة الواجهة العامة للموقع"
          >
            عرض الموقع
          </button>

          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 rounded-xl text-xs border border-rose-800/40 transition-colors"
            title="تسجيل الخروج من الجلسة الإدارية"
          >
            <LogOut className="w-3.5 h-3.5 rotate-180" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Main CMS Layout: Side Menu + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Navigation Tabs Rail */}
        <div className="lg:col-span-3 bg-stone-900 border border-stone-800 rounded-3xl p-3 space-y-1 shadow-sm">
          
          <button
            onClick={() => setActiveTab('sections')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'sections'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>أقسام الصفحة الرئيسية</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.sections.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('pages_nav')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'pages_nav'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4" />
              <span>الصفحات وقوائم التنقل</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.pages.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('members_tree')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'members_tree'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GitFork className="w-4 h-4" />
              <span>شجرة النسب والأعضاء</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.members.filter(m => !m.isDeleted).length}</span>
          </button>

          <button
            onClick={() => setActiveTab('custom_fields')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'custom_fields'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4" />
              <span>منشئ الحقول المخصصة</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.customFields.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'news'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Newspaper className="w-4 h-4" />
              <span>الأخبار والمقالات</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.news.filter(n => !n.isDeleted).length}</span>
          </button>

          <button
            onClick={() => setActiveTab('events')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'events'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4" />
              <span>المناسبات والفعاليات</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.events.filter(e => !e.isDeleted).length}</span>
          </button>

          <button
            onClick={() => setActiveTab('fund')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'fund'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coins className="w-4 h-4" />
              <span>الصندوق المالي والتكافل</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.transactions.filter(t => !t.isDeleted).length}</span>
          </button>

          <button
            onClick={() => setActiveTab('users_roles')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'users_roles'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" />
              <span>المستخدمون والصلاحيات</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.users.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('join_requests')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'join_requests'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4" />
              <span>طلبات الانضمام</span>
            </div>
            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-mono tabular-nums">
              {data.joinRequests.filter(r => r.status === 'pending').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('recycle_bin')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'recycle_bin'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Trash2 className="w-4 h-4" />
              <span>سلة المحذوفات</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">
              {data.members.filter(m => m.isDeleted).length + data.news.filter(n => n.isDeleted).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'audit_log'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <History className="w-4 h-4" />
              <span>سجل التدقيق والعمليات</span>
            </div>
            <span className="text-[10px] opacity-70 font-mono tabular-nums">{data.auditLogs.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-right px-4 py-3 rounded-2xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <SettingsIcon className="w-4 h-4" />
              <span>إعدادات الموقع والهوية</span>
            </div>
          </button>

        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 min-h-[600px] shadow-sm">
          
          {/* TAB 1: DYNAMIC HOMEPAGE SECTIONS */}
          {activeTab === 'sections' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">
                    إدارة أقسام الصفحة الرئيسية (Dynamic Sections)
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    تحكم فوري بإظهار وإخفاء الأقسام وإعادة ترتيبها بالأسهم دون الحاجة لكتابة كود.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[...data.sections].sort((a, b) => a.order - b.order).map((section, idx) => (
                  <div
                    key={section.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      section.enabled
                        ? 'bg-stone-850/90 border-stone-750'
                        : 'bg-stone-950/60 border-stone-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveSection(idx, 'up')}
                          className="p-1 hover:bg-stone-750 text-stone-400 hover:text-white rounded disabled:opacity-30"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={idx === data.sections.length - 1}
                          onClick={() => moveSection(idx, 'down')}
                          className="p-1 hover:bg-stone-750 text-stone-400 hover:text-white rounded disabled:opacity-30"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-xs text-stone-100">{section.title}</h3>
                          <span className="text-[10px] text-amber-400 font-mono">#{section.order}</span>
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">{section.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSectionEnabled(section)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          section.enabled
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-stone-800 text-stone-400 border border-stone-750'
                        }`}
                      >
                        {section.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{section.enabled ? 'ظاهر بالموقع' : 'مخفي حالياً'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOM PAGES & NAVIGATION */}
          {activeTab === 'pages_nav' && (
            <div className="space-y-8">
              
              {/* Custom Pages */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <h2 className="font-heading font-bold text-base text-stone-100">
                      الصفحات التعريفية المخصصة (Custom CMS Pages)
                    </h2>
                    <p className="text-xs text-stone-400">إنشاء وتعديل صفحات مثل: ميثاق الأسرة، مجلس الأعيان، اللجان التنفيذية.</p>
                  </div>
                  <button
                    onClick={() => setIsNewPageModalOpen(true)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء صفحة جديدة</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {data.pages.filter(p => !p.isDeleted).map(page => (
                    <div
                      key={page.id}
                      className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between gap-4"
                    >
                      <div className="text-right">
                        <h4 className="font-bold text-xs text-stone-100">{page.title}</h4>
                        <span className="text-[11px] text-amber-400 font-mono" dir="ltr">/page/{page.slug}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveView('page', page.slug)}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded-lg text-xs"
                        >
                          معاينة
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`هل أنت متأكد من حذف الصفحة (${page.title})؟`)) {
                              deletePage(page.id);
                            }
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Links Order */}
              <div className="space-y-4 pt-4 border-t border-stone-800">
                <h3 className="font-heading font-bold text-base text-stone-100">
                  ترتيب عناصر القائمة العلوية الرئيسية (Top Navigation Links)
                </h3>

                <div className="space-y-2">
                  {[...data.navLinks].sort((a, b) => a.order - b.order).map((link, idx) => (
                    <div
                      key={link.id}
                      className="p-3 bg-stone-850 rounded-xl border border-stone-750 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                          <button
                            disabled={idx === 0}
                            onClick={() => moveNavLink(idx, 'up')}
                            className="p-0.5 text-stone-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={idx === data.navLinks.length - 1}
                            onClick={() => moveNavLink(idx, 'down')}
                            className="p-0.5 text-stone-400 hover:text-white disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-semibold text-stone-200">{link.label}</span>
                        <span className="text-[11px] text-stone-500 font-mono" dir="ltr">{link.path}</span>
                      </div>

                      <span className="text-xs text-amber-400 font-mono">ترتيب #{link.order}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: MEMBERS & FAMILY TREE CMS */}
          {activeTab === 'members_tree' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">
                    إدارة أعضاء العائلة وشجرة النسب
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    إجمالي {data.members.filter(m => !m.isDeleted).length} عضو مسجل موزعين على {data.branches.length} فروع.
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('tree')}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <GitFork className="w-4 h-4" />
                  <span>فتح شجرة النسب التفاعلية</span>
                </button>
              </div>

              {/* Members Quick List */}
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-850 border-b border-stone-800 text-stone-400">
                    <tr>
                      <th className="py-2.5 px-3">الاسم الكامل</th>
                      <th className="py-2.5 px-3">الفرع</th>
                      <th className="py-2.5 px-3">الجيل</th>
                      <th className="py-2.5 px-3">الميلاد</th>
                      <th className="py-2.5 px-3">المدينة</th>
                      <th className="py-2.5 px-3 text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-200">
                    {data.members.filter(m => !m.isDeleted).slice(0, 10).map(m => (
                      <tr key={m.id} className="hover:bg-stone-850/60">
                        <td className="py-2.5 px-3 font-semibold">{m.fullName}</td>
                        <td className="py-2.5 px-3">{m.branchName}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">{m.generation}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">{m.birthYear}</td>
                        <td className="py-2.5 px-3">{m.city}</td>
                        <td className="py-2.5 px-3 text-left">
                          <button
                            onClick={() => {
                              if (confirm(`نقل العضو (${m.fullName}) لسلة المحذوفات؟`)) {
                                deleteMember(m.id);
                              }
                            }}
                            className="p-1 text-rose-400 hover:text-rose-300"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CUSTOM MEMBER FIELDS BUILDER */}
          {activeTab === 'custom_fields' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">
                    منشئ حقول الأعضاء المخصصة (Custom Fields Builder)
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    إمكانية إضافة أي حقل إضافي لبيانات الأعضاء (نص، رقم، تاريخ، قائمة اختيار) دون تعديل ملفات البرمجة.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewFieldModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة حقل جديد</span>
                </button>
              </div>

              <div className="space-y-3">
                {data.customFields.map(field => (
                  <div
                    key={field.id}
                    className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between"
                  >
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-stone-100">{field.label}</h4>
                        <span className="text-[10px] text-amber-400 font-mono" dir="ltr">({field.key})</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-1">
                        <span>النوع: {field.type === 'select' ? 'قائمة منسدلة' : field.type === 'text' ? 'نص حر' : field.type}</span>
                        <span>·</span>
                        <span>{field.isRequired ? 'إجباري' : 'اختياري'}</span>
                        <span>·</span>
                        <span>{field.isPublic ? 'عام' : 'خاص ومحمي'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف الحقل (${field.label})؟`)) {
                          deleteCustomField(field.id);
                        }
                      }}
                      className="p-1.5 text-rose-400 hover:text-rose-300"
                      title="حذف الحقل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NEWS CMS */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">إدارة الأخبار والمقالات</h2>
                  <p className="text-xs text-stone-400">إضافة وتعديل وحذف الأخبار والإعلانات الرسمية للعائلة.</p>
                </div>
                <button
                  onClick={() => setActiveView('news')}
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
                >
                  فتح بوابة الأخبار لإضافة خبر جديد
                </button>
              </div>

              <div className="space-y-3">
                {data.news.filter(n => !n.isDeleted).map(n => (
                  <div key={n.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between">
                    <div className="text-right">
                      <h4 className="font-bold text-xs text-stone-100">{n.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">{n.category} · {n.publishDate}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`حذف الخبر (${n.title})؟`)) deleteNews(n.id);
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: EVENTS CMS */}
          {activeTab === 'events' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">إدارة المناسبات والفعاليات</h2>
                  <p className="text-xs text-stone-400">إدارة تقويم الأعراس واللقاءات السنوية ومجالس التعزية.</p>
                </div>
                <button
                  onClick={() => setActiveView('events')}
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
                >
                  فتح تقويم المناسبات
                </button>
              </div>

              <div className="space-y-3">
                {data.events.filter(e => !e.isDeleted).map(e => (
                  <div key={e.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between">
                    <div className="text-right">
                      <h4 className="font-bold text-xs text-stone-100">{e.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">{e.type} · {e.date} ({e.rsvpCount} حضور مؤكد)</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`حذف المناسبة (${e.title})؟`)) deleteEvent(e.id);
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: FUND CMS */}
          {activeTab === 'fund' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">إدارة صندوق العائلة المالي</h2>
                  <p className="text-xs text-stone-400">تسجيل سندات القبض والصرف واستخراج التقارير المحاسبية المعتمدة.</p>
                </div>
                <button
                  onClick={() => setActiveView('fund')}
                  className="px-4 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl text-xs"
                >
                  فتح سجل المعاملات المالية
                </button>
              </div>

              <div className="space-y-3">
                {data.transactions.filter(t => !t.isDeleted).map(t => (
                  <div key={t.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-100">{t.partyName}</span>
                        <span className={`font-mono text-xs font-bold ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()} ر.س
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{t.receiptNumber} · {t.category} · {t.date}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`حذف السند (${t.receiptNumber})؟`)) deleteTransaction(t.id);
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: USERS & ROLES CMS */}
          {activeTab === 'users_roles' && (
            <div className="space-y-8">
              {/* Users */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div>
                    <h3 className="font-heading font-bold text-base text-stone-100">حسابات المستخدمين والمشرفين</h3>
                    <p className="text-xs text-stone-400">إدارة الحسابات المسجلة وتعيين الأدوار والصلاحيات.</p>
                  </div>
                  <button
                    onClick={() => setIsNewUserModalOpen(true)}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء حساب جديد</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {data.users.map(u => (
                    <div key={u.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between">
                      <div className="text-right">
                        <h4 className="font-bold text-xs text-stone-100">{u.name}</h4>
                        <p className="text-[11px] text-amber-400 mt-0.5">{u.roleName} · {u.branchName} · <span className="text-stone-400" dir="ltr">{u.email}</span></p>
                      </div>
                      {u.id !== currentUser.id && (
                        <button
                          onClick={() => {
                            if (confirm(`حذف حساب المستخدم (${u.name})؟`)) deleteUser(u.id);
                          }}
                          className="p-1 text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Roles */}
              <div className="space-y-4 pt-4 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-stone-100">الأدوار وصلاحيات النظام</h3>
                  <button
                    onClick={() => setIsNewRoleModalOpen(true)}
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-amber-400 border border-stone-700 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إنشاء دور وصلاحيات جديدة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.roles.map(r => (
                    <div key={r.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 text-right space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-100">{r.name}</span>
                        {r.isSystem && <span className="text-[10px] text-stone-500">نظام أساسي</span>}
                      </div>
                      <p className="text-[11px] text-stone-400 leading-relaxed">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: JOIN REQUESTS */}
          {activeTab === 'join_requests' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <h2 className="font-heading font-bold text-lg text-stone-100">
                  مراجعة طلبات الانضمام لشجرة العائلة
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  الطلبات الواردة من أبناء وبنات العمومة للتسجيل وتحديث الأنساب.
                </p>
              </div>

              <div className="space-y-3">
                {data.joinRequests.map(req => (
                  <div key={req.id} className="p-5 bg-stone-850 rounded-2xl border border-stone-750 space-y-3 text-right">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-stone-100">{req.fullName}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full ${
                        req.status === 'pending' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        'bg-rose-950 text-rose-400'
                      }`}>
                        {req.status === 'pending' ? 'قيد التدقيق' : req.status === 'approved' ? 'تم الاعتماد' : 'مرفوض'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-stone-400">
                      <div>الفرع: <span className="text-stone-200">{req.branchName}</span></div>
                      <div>المدينة: <span className="text-stone-200">{req.city}</span></div>
                      <div>الهاتف: <span className="text-stone-200" dir="ltr">{req.phone}</span></div>
                    </div>

                    {req.notes && (
                      <p className="text-xs text-stone-300 bg-stone-900 p-3 rounded-xl border border-stone-800">
                        {req.notes}
                      </p>
                    )}

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                        <button
                          onClick={async () => {
                            await api.saveMember({
                              fullName: req.fullName,
                              gender: 'male',
                              branchId: 'br-1',
                              branchName: req.branchName,
                              generation: 5,
                              city: req.city,
                              phone: req.phone,
                              email: req.email,
                              status: 'active',
                            });
                            req.status = 'approved';
                            showToast(`تم اعتماد وتوثيق العضو (${req.fullName}) في الشجرة`);
                          }}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                        >
                          اعتماد وإضافة للشجرة
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: RECYCLE BIN */}
          {activeTab === 'recycle_bin' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <h2 className="font-heading font-bold text-lg text-stone-100">سلة المحذوفات (Recycle Bin)</h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    استعادة أي عنصر تم حذفه بالخطأ أو حذفه نهائياً لحماية بيانات العائلة من الفقد غير المقصود.
                  </p>
                </div>
              </div>

              {/* Members deleted */}
              {data.members.filter(m => m.isDeleted).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase">الأعضاء في سلة المحذوفات</h3>
                  {data.members.filter(m => m.isDeleted).map(m => (
                    <div key={m.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-stone-100">{m.fullName}</h4>
                        <span className="text-[11px] text-stone-500">حُذف في: {m.deletedAt?.split('T')[0]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restoreMember(m.id)}
                          className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold"
                        >
                          استعادة
                        </button>
                        <button
                          onClick={() => deleteMember(m.id, true)}
                          className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-xs"
                        >
                          حذف نهائي
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* News deleted */}
              {data.news.filter(n => n.isDeleted).length > 0 && (
                <div className="space-y-3 pt-3">
                  <h3 className="text-xs font-bold text-amber-400 uppercase">الأخبار في سلة المحذوفات</h3>
                  {data.news.filter(n => n.isDeleted).map(n => (
                    <div key={n.id} className="p-4 bg-stone-850 rounded-2xl border border-stone-750 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-stone-100">{n.title}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restoreNews(n.id)}
                          className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold"
                        >
                          استعادة
                        </button>
                        <button
                          onClick={() => deleteNews(n.id, true)}
                          className="px-3 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-lg text-xs"
                        >
                          حذف نهائي
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {data.members.filter(m => m.isDeleted).length === 0 && data.news.filter(n => n.isDeleted).length === 0 && (
                <div className="p-12 text-center text-stone-500 bg-stone-950/40 rounded-2xl border border-stone-800">
                  <Trash2 className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  <p className="text-xs">سلة المحذوفات فارغة حالياً.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: AUDIT LOG */}
          {activeTab === 'audit_log' && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <h2 className="font-heading font-bold text-lg text-stone-100">
                  سجل التدقيق والعمليات (Audit Trail)
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  توثيق زمني دقيق لكل عملية إضافة، تعديل، حذف، أو تصدير تمت على المنظومة.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-850 border-b border-stone-800 text-stone-400">
                    <tr>
                      <th className="py-2.5 px-3">التاريخ والوقت</th>
                      <th className="py-2.5 px-3">المستخدم</th>
                      <th className="py-2.5 px-3">الدور</th>
                      <th className="py-2.5 px-3">نوع العملية</th>
                      <th className="py-2.5 px-3">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-200">
                    {data.auditLogs.slice(0, 30).map(log => (
                      <tr key={log.id} className="hover:bg-stone-850/60">
                        <td className="py-2.5 px-3 font-mono tabular-nums text-stone-400" dir="ltr">
                          {log.timestamp.replace('T', ' ').substring(0, 19)}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-stone-100">{log.userName}</td>
                        <td className="py-2.5 px-3 text-amber-400">{log.userRole}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            log.action === 'create' ? 'bg-emerald-950 text-emerald-400' :
                            log.action === 'update' ? 'bg-blue-950 text-blue-400' :
                            log.action === 'delete' ? 'bg-rose-950 text-rose-400' :
                            'bg-stone-800 text-stone-300'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-stone-300">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 12: GENERAL SETTINGS, APPEARANCE & BACKUP */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div className="pb-4 border-b border-stone-800">
                <h2 className="font-heading font-bold text-lg text-stone-100">
                  إعدادات الموقع، الهوية، والنسخ الاحتياطي
                </h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  تعديل اسم العائلة، الشعار، الصور، ألوان السمة، وضع الصيانة، وتصدير واستيراد قاعدة البيانات.
                </p>
              </div>

              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  await updateSettings(localSettings);
                }} 
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">اسم العائلة</label>
                    <input
                      type="text"
                      value={localSettings.familyName}
                      onChange={(e) => setLocalSettings({ ...localSettings, familyName: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">عنوان الموقع الرئيسي</label>
                    <input
                      type="text"
                      value={localSettings.siteTitle}
                      onChange={(e) => setLocalSettings({ ...localSettings, siteTitle: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">شعار / حكمة الأسرة (Motto)</label>
                  <input
                    type="text"
                    value={localSettings.motto}
                    onChange={(e) => setLocalSettings({ ...localSettings, motto: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-300 mb-1">الرسالة الترحيبية بالواجهة</label>
                  <textarea
                    rows={2}
                    value={localSettings.welcomeMessage}
                    onChange={(e) => setLocalSettings({ ...localSettings, welcomeMessage: e.target.value })}
                    className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">مسار/رابط شعار العائلة (Logo)</label>
                    <input
                      type="text"
                      value={localSettings.logoUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, logoUrl: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-300 mb-1">مسار صورة الواجهة الرئيسية (Hero)</label>
                    <input
                      type="text"
                      value={localSettings.heroImageUrl}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroImageUrl: e.target.value })}
                      className="w-full bg-stone-850 border border-stone-750 focus:border-amber-500 rounded-xl py-2 px-3 text-xs text-stone-100 outline-none text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Modules Toggles */}
                <div className="p-4 bg-stone-850 rounded-2xl border border-stone-750 space-y-3">
                  <h3 className="font-bold text-xs text-amber-400">تفعيل وتعطيل الوحدات الاختيارية:</h3>
                  
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-200">
                    <input
                      type="checkbox"
                      checked={localSettings.enableFund}
                      onChange={(e) => setLocalSettings({ ...localSettings, enableFund: e.target.checked })}
                      className="rounded border-stone-700 bg-stone-800 text-amber-500"
                    />
                    <span>تفعيل وحدة صندوق العائلة المالي والتكافل</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-200">
                    <input
                      type="checkbox"
                      checked={localSettings.maintenanceMode}
                      onChange={(e) => setLocalSettings({ ...localSettings, maintenanceMode: e.target.checked })}
                      className="rounded border-stone-700 bg-stone-800 text-amber-500"
                    />
                    <span>وضع الصيانة المخصص (إظهار رسالة صيانة للمستخدمين)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-all shadow cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ كافة الإعدادات والهوية</span>
                  </button>
                </div>
              </form>

              {/* Backup & Restore Box */}
              <div className="pt-6 border-t border-stone-800 space-y-4">
                <h3 className="font-heading font-bold text-base text-stone-100">
                  النسخ الاحتياطي والاستعادة الكاملة (System Backup & Restore)
                </h3>
                <p className="text-xs text-stone-400 leading-relaxed">
                  يمكنك استخراج ملف JSON كامل يتضمن كافة أعضاء الشجرة، السندات المالية، الأخبار، والمستندات، أو استعادته في أي وقت.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleDownloadBackup}
                    className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>تحميل نسخة احتياطية (JSON)</span>
                  </button>

                  <label className="px-4 py-2 bg-stone-850 hover:bg-stone-800 text-stone-200 border border-stone-750 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>استعادة من ملف نسخة احتياطية</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleUploadBackup}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => {
                      if (confirm('تنبيه: هل ترغب بإعادة ضبط كافة بيانات الموقع للحالة الافتراضية الأولية؟')) {
                        resetDatabase();
                      }
                    }}
                    className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>إعادة ضبط المصنع (Reset Seed Data)</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* New Page Modal */}
      {isNewPageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right">
            <button onClick={() => setIsNewPageModalOpen(false)} className="absolute top-5 left-5 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-base text-amber-300 pb-3 border-b border-stone-800 mb-4">إنشاء صفحة مخصصة جديدة</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await savePage(newPageData);
              setIsNewPageModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-stone-300">عنوان الصفحة *</label>
                <input
                  type="text"
                  required
                  value={newPageData.title || ''}
                  onChange={(e) => setNewPageData({ ...newPageData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">الرابط التعريفي (Slug) *</label>
                <input
                  type="text"
                  required
                  value={newPageData.slug || ''}
                  onChange={(e) => setNewPageData({ ...newPageData, slug: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">محتوى الصفحة (HTML)</label>
                <textarea
                  rows={5}
                  value={newPageData.content || ''}
                  onChange={(e) => setNewPageData({ ...newPageData, content: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none font-mono text-[11px]"
                />
              </div>
              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewPageModalOpen(false)} className="px-3 py-1.5 bg-stone-800 rounded-xl">إلغاء</button>
                <button type="submit" className="px-5 py-1.5 bg-amber-500 font-bold text-stone-950 rounded-xl">إنشاء الصفحة</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Custom Field Modal */}
      {isNewFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-right">
            <button onClick={() => setIsNewFieldModalOpen(false)} className="absolute top-5 left-5 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-base text-amber-300 pb-3 border-b border-stone-800 mb-4">إضافة حقل مخصص لبيانات الأعضاء</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await addCustomField(newFieldData);
              setIsNewFieldModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-stone-300">اسم الحقل بالعربية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جهة العمل الحالية"
                  value={newFieldData.label || ''}
                  onChange={(e) => setNewFieldData({ ...newFieldData, label: e.target.value, key: e.target.value.replace(/\s+/g, '_') })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">مفتاح الحقل بالإنجليزية *</label>
                <input
                  type="text"
                  required
                  placeholder="employer"
                  value={newFieldData.key || ''}
                  onChange={(e) => setNewFieldData({ ...newFieldData, key: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">نوع الحقل</label>
                <select
                  value={newFieldData.type || 'text'}
                  onChange={(e) => setNewFieldData({ ...newFieldData, type: e.target.value as any })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                >
                  <option value="text">نص حر (Text)</option>
                  <option value="number">رقم (Number)</option>
                  <option value="date">تاريخ (Date)</option>
                  <option value="select">قائمة خيارات (Dropdown)</option>
                </select>
              </div>
              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewFieldModalOpen(false)} className="px-3 py-1.5 bg-stone-800 rounded-xl">إلغاء</button>
                <button type="submit" className="px-5 py-1.5 bg-amber-500 font-bold text-stone-950 rounded-xl">إضافة الحقل</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New User Account Modal */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full p-6 shadow-2xl relative text-right">
            <button onClick={() => setIsNewUserModalOpen(false)} className="absolute top-5 left-5 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-base text-amber-300 pb-3 border-b border-stone-800 mb-4">إنشاء حساب مستخدم جديد</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await saveUser(newUserData);
              setIsNewUserModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-stone-300">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={newUserData.name || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={newUserData.email || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">الدور والصلاحيات *</label>
                <select
                  value={newUserData.roleId || ''}
                  onChange={(e) => setNewUserData({ ...newUserData, roleId: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                >
                  {data.roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewUserModalOpen(false)} className="px-3 py-1.5 bg-stone-800 rounded-xl">إلغاء</button>
                <button type="submit" className="px-5 py-1.5 bg-amber-500 font-bold text-stone-950 rounded-xl">إنشاء الحساب</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Role Modal */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-right">
            <button onClick={() => setIsNewRoleModalOpen(false)} className="absolute top-5 left-5 text-stone-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-heading font-bold text-base text-amber-300 pb-3 border-b border-stone-800 mb-4">إنشاء دور وصلاحيات جديدة</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await saveRole(newRoleData);
              setIsNewRoleModalOpen(false);
            }} className="space-y-3 text-xs">
              <div>
                <label className="block mb-1 text-stone-300">اسم الدور *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: منسق فعاليات الحجاز"
                  value={newRoleData.name || ''}
                  onChange={(e) => setNewRoleData({ ...newRoleData, name: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                />
              </div>
              <div>
                <label className="block mb-1 text-stone-300">الوصف</label>
                <input
                  type="text"
                  value={newRoleData.description || ''}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  className="w-full bg-stone-850 border border-stone-750 rounded-xl p-2 outline-none"
                />
              </div>
              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button type="button" onClick={() => setIsNewRoleModalOpen(false)} className="px-3 py-1.5 bg-stone-800 rounded-xl">إلغاء</button>
                <button type="submit" className="px-5 py-1.5 bg-amber-500 font-bold text-stone-950 rounded-xl">حفظ الدور</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
