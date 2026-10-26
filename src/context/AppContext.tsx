import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DatabaseState, UserAccount, Role, Member, NewsItem, EventItem, MediaAlbum, DocumentItem, FundTransaction, CustomPage, DynamicSection, SiteSettings, CustomField, JoinRequest } from '../types';
import { INITIAL_DATABASE, GUEST_USER, GUEST_ROLE, isAuthorizedAdmin } from '../data/initialData';
import { api } from '../services/api';

export { isAuthorizedAdmin };

export type ActiveView = 
  | 'home' 
  | 'tree' 
  | 'directory' 
  | 'news' 
  | 'events' 
  | 'media' 
  | 'archive' 
  | 'fund' 
  | 'page' 
  | 'admin';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  data: DatabaseState;
  loading: boolean;
  currentUser: UserAccount;
  currentRole: Role;
  activeView: ActiveView;
  selectedPageSlug: string | null;
  toasts: Toast[];
  isLoginModalOpen: boolean;
  isJoinModalOpen: boolean;
  isDevUserSwitcherOpen: boolean;
  isMemberPortalOpen: boolean;
  
  // Navigation & View actions
  setActiveView: (view: ActiveView, pageSlug?: string) => void;
  setIsLoginModalOpen: (open: boolean) => void;
  setIsJoinModalOpen: (open: boolean) => void;
  setIsDevUserSwitcherOpen: (open: boolean) => void;
  setIsMemberPortalOpen: (open: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  
  // Permissions checker
  can: (module: keyof Role['permissions'], action: string) => boolean;
  
  // Auth actions
  login: (identifier: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  submitJoinRequest: (reqData: Partial<JoinRequest>) => Promise<boolean>;
  
  // CRUD Actions
  saveMember: (member: Partial<Member>) => Promise<{ success: boolean; error?: string }>;
  deleteMember: (id: string, permanent?: boolean) => Promise<void>;
  restoreMember: (id: string) => Promise<void>;
  
  saveNews: (news: Partial<NewsItem>) => Promise<void>;
  deleteNews: (id: string, permanent?: boolean) => Promise<void>;
  restoreNews: (id: string) => Promise<void>;
  
  saveEvent: (evt: Partial<EventItem>) => Promise<void>;
  deleteEvent: (id: string, permanent?: boolean) => Promise<void>;
  restoreEvent: (id: string) => Promise<void>;
  rsvpEvent: (id: string) => Promise<void>;
  
  saveAlbum: (album: Partial<MediaAlbum>) => Promise<void>;
  deleteAlbum: (id: string, permanent?: boolean) => Promise<void>;
  addMediaItem: (albumId: string, item: any) => Promise<void>;
  
  saveDocument: (doc: Partial<DocumentItem>) => Promise<void>;
  deleteDocument: (id: string, permanent?: boolean) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  
  saveTransaction: (tx: Partial<FundTransaction>) => Promise<void>;
  deleteTransaction: (id: string, permanent?: boolean) => Promise<void>;
  restoreTransaction: (id: string) => Promise<void>;
  
  updateSections: (sections: DynamicSection[]) => Promise<void>;
  updateSection: (id: string, data: Partial<DynamicSection>) => Promise<void>;
  
  savePage: (page: Partial<CustomPage>) => Promise<void>;
  deletePage: (id: string, permanent?: boolean) => Promise<void>;
  restorePage: (id: string) => Promise<void>;
  
  updateNavLinks: (links: any[]) => Promise<void>;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  
  addCustomField: (field: Partial<CustomField>) => Promise<void>;
  deleteCustomField: (id: string) => Promise<void>;
  
  saveUser: (user: Partial<UserAccount>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  saveRole: (role: Partial<Role>) => Promise<void>;
  
  resetDatabase: () => Promise<void>;
  restoreDatabase: (data: any) => Promise<void>;
  reloadAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DatabaseState>(INITIAL_DATABASE);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserAccount>(GUEST_USER);
  const [currentRole, setCurrentRole] = useState<Role>(GUEST_ROLE);
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [selectedPageSlug, setSelectedPageSlug] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isDevUserSwitcherOpen, setIsDevUserSwitcherOpen] = useState(false);
  const [isMemberPortalOpen, setIsMemberPortalOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const loadData = async () => {
    try {
      const [dbData, sessionData] = await Promise.all([
        api.getData(),
        api.getSession(),
      ]);
      if (dbData) setData(dbData);
      if (sessionData && sessionData.user) {
        setCurrentUser(sessionData.user);
        setCurrentRole(sessionData.role);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetActiveView = (view: ActiveView, pageSlug?: string) => {
    setActiveView(view);
    if (pageSlug) setSelectedPageSlug(pageSlug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fine-grained permission checker
  const can = (module: keyof Role['permissions'], action: string): boolean => {
    if (!currentRole || !currentRole.permissions) return false;
    if (currentRole.code === 'admin') return true; // Super admin
    const modPerms = (currentRole.permissions as any)[module];
    if (!modPerms) return false;
    return !!modPerms[action];
  };

  // Auth
  const login = async (identifier: string, password?: string) => {
    const res = await api.login(identifier, password);
    if (res.success && res.user && res.role) {
      setCurrentUser(res.user);
      setCurrentRole(res.role);
      showToast(`مرحبًا بك يا ${res.user.name} (${res.role.name})`, 'success');
      setIsLoginModalOpen(false);
      if (isAuthorizedAdmin(res.user)) {
        setActiveView('admin');
      } else {
        setIsMemberPortalOpen(true);
      }
      return true;
    }
    showToast(res.error || 'فشل تسجيل الدخول', 'error');
    return false;
  };

  const logout = async () => {
    await api.logout();
    setCurrentUser(GUEST_USER);
    setCurrentRole(GUEST_ROLE);
    setIsMemberPortalOpen(false);
    if (activeView === 'admin') {
      setActiveView('home');
    }
    showToast('تم تسجيل الخروج بنجاح', 'info');
  };

  const switchUser = async (userId: string) => {
    const res = await api.switchUser(userId);
    if (res.success && res.user && res.role) {
      setCurrentUser(res.user);
      setCurrentRole(res.role);
      showToast(`تم التبديل إلى: ${res.user.name} (${res.role.name})`, 'info');
      await loadData();
    }
  };

  const submitJoinRequest = async (reqData: Partial<JoinRequest>) => {
    const res = await api.submitJoinRequest(reqData);
    if (res.success) {
      showToast('تم إرسال طلب الانضمام بنجاح وسيتواصل معك منسق الفرع قريباً.', 'success');
      setIsJoinModalOpen(false);
      await loadData();
      return true;
    }
    showToast(res.error || 'حدث خطأ في تقديم الطلب', 'error');
    return false;
  };

  // Members CRUD
  const saveMember = async (member: Partial<Member>) => {
    const res = await api.saveMember(member);
    if (res.success) {
      showToast(member.id ? 'تم تعديل بيانات العضو بنجاح' : 'تمت إضافة العضو بنجاح');
      await loadData();
      return { success: true };
    }
    showToast(res.error || 'حدث خطأ أثناء حفظ العضو', 'error');
    return { success: false, error: res.error };
  };

  const deleteMember = async (id: string, permanent: boolean = false) => {
    await api.deleteMember(id, permanent);
    showToast(permanent ? 'تم حذف العضو نهائياً' : 'تم نقل العضو إلى سلة المحذوفات');
    await loadData();
  };

  const restoreMember = async (id: string) => {
    await api.restoreMember(id);
    showToast('تمت استعادة العضو من سلة المحذوفات بنجاح');
    await loadData();
  };

  // News CRUD
  const saveNews = async (news: Partial<NewsItem>) => {
    await api.saveNews(news);
    showToast(news.id ? 'تم تعديل الخبر بنجاح' : 'تم نشر الخبر بنجاح');
    await loadData();
  };

  const deleteNews = async (id: string, permanent: boolean = false) => {
    await api.deleteNews(id, permanent);
    showToast(permanent ? 'تم حذف الخبر نهائياً' : 'تم نقل الخبر لسلة المحذوفات');
    await loadData();
  };

  const restoreNews = async (id: string) => {
    await api.restoreNews(id);
    showToast('تمت استعادة الخبر بنجاح');
    await loadData();
  };

  // Events CRUD
  const saveEvent = async (evt: Partial<EventItem>) => {
    await api.saveEvent(evt);
    showToast(evt.id ? 'تم تحديث المناسبة' : 'تمت إضافة المناسبة بنجاح');
    await loadData();
  };

  const deleteEvent = async (id: string, permanent: boolean = false) => {
    await api.deleteEvent(id, permanent);
    showToast(permanent ? 'تم حذف المناسبة نهائياً' : 'تم نقل المناسبة لسلة المحذوفات');
    await loadData();
  };

  const restoreEvent = async (id: string) => {
    await api.restoreEvent(id);
    showToast('تمت استعادة المناسبة بنجاح');
    await loadData();
  };

  const rsvpEvent = async (id: string) => {
    await api.rsvpEvent(id);
    showToast('تم تحديث حالة تأكيد الحضور بنجاح');
    await loadData();
  };

  // Albums & Media
  const saveAlbum = async (album: Partial<MediaAlbum>) => {
    await api.saveAlbum(album);
    showToast(album.id ? 'تم تعديل الألبوم' : 'تم إنشاء الألبوم بنجاح');
    await loadData();
  };

  const deleteAlbum = async (id: string, permanent: boolean = false) => {
    await api.deleteAlbum(id, permanent);
    showToast(permanent ? 'تم حذف الألبوم نهائياً' : 'تم نقل الألبوم لسلة المحذوفات');
    await loadData();
  };

  const addMediaItem = async (albumId: string, item: any) => {
    await api.addMediaItem(albumId, item);
    showToast('تمت إضافة الصورة بنجاح');
    await loadData();
  };

  // Documents
  const saveDocument = async (doc: Partial<DocumentItem>) => {
    await api.saveDocument(doc);
    showToast(doc.id ? 'تم تعديل بيانات الوثيقة' : 'تم إدراج الوثيقة بنجاح');
    await loadData();
  };

  const deleteDocument = async (id: string, permanent: boolean = false) => {
    await api.deleteDocument(id, permanent);
    showToast(permanent ? 'تم حذف الوثيقة نهائياً' : 'تم نقل الوثيقة لسلة المحذوفات');
    await loadData();
  };

  const restoreDocument = async (id: string) => {
    await api.restoreDocument(id);
    showToast('تمت استعادة الوثيقة بنجاح');
    await loadData();
  };

  // Fund
  const saveTransaction = async (tx: Partial<FundTransaction>) => {
    await api.saveTransaction(tx);
    showToast('تم تسجيل السند المالي بنجاح');
    await loadData();
  };

  const deleteTransaction = async (id: string, permanent: boolean = false) => {
    await api.deleteTransaction(id, permanent);
    showToast(permanent ? 'تم حذف السند نهائياً' : 'تم نقل السند لسلة المحذوفات');
    await loadData();
  };

  const restoreTransaction = async (id: string) => {
    await api.restoreTransaction(id);
    showToast('تمت استعادة السند المالي بنجاح');
    await loadData();
  };

  // CMS: Dynamic Sections
  const updateSections = async (sections: DynamicSection[]) => {
    await api.updateSections(sections);
    showToast('تم تحديث ترتيب وإعدادات أقسام الصفحة الرئيسية');
    await loadData();
  };

  const updateSection = async (id: string, patch: Partial<DynamicSection>) => {
    await api.updateSection(id, patch);
    showToast('تم حفظ تعديلات القسم بنجاح');
    await loadData();
  };

  // CMS: Pages
  const savePage = async (page: Partial<CustomPage>) => {
    await api.savePage(page);
    showToast(page.id ? 'تم تعديل الصفحة بنجاح' : 'تم إنشاء الصفحة الجديدة بنجاح');
    await loadData();
  };

  const deletePage = async (id: string, permanent: boolean = false) => {
    await api.deletePage(id, permanent);
    showToast(permanent ? 'تم حذف الصفحة نهائياً' : 'تم نقل الصفحة لسلة المحذوفات');
    await loadData();
  };

  const restorePage = async (id: string) => {
    await api.restorePage(id);
    showToast('تمت استعادة الصفحة بنجاح');
    await loadData();
  };

  // CMS: Nav links
  const updateNavLinks = async (links: any[]) => {
    await api.updateNavLinks(links);
    showToast('تم حفظ ترتيب وروابط القائمة العلوية');
    await loadData();
  };

  // Settings
  const updateSettings = async (settings: Partial<SiteSettings>) => {
    await api.updateSettings(settings);
    showToast('تم حفظ إعدادات الموقع والهوية بنجاح');
    await loadData();
  };

  // Custom Fields
  const addCustomField = async (field: Partial<CustomField>) => {
    await api.addCustomField(field);
    showToast('تمت إضافة الحقل المخصص بنجاح');
    await loadData();
  };

  const deleteCustomField = async (id: string) => {
    await api.deleteCustomField(id);
    showToast('تم حذف الحقل المخصص');
    await loadData();
  };

  // Users & Roles
  const saveUser = async (user: Partial<UserAccount>) => {
    await api.saveUser(user);
    showToast(user.id ? 'تم تعديل بيانات المستخدم' : 'تم إنشاء الحساب بنجاح');
    await loadData();
  };

  const deleteUser = async (id: string) => {
    await api.deleteUser(id);
    showToast('تم حذف المستخدم بنجاح');
    await loadData();
  };

  const saveRole = async (role: Partial<Role>) => {
    await api.saveRole(role);
    showToast(role.id ? 'تم تحديث صلاحيات الدور' : 'تم إنشاء الدور الجديد بنجاح');
    await loadData();
  };

  // Reset & Restore
  const resetDatabase = async () => {
    await api.resetData();
    showToast('تمت إعادة ضبط قاعدة البيانات للحالة الافتراضية بنجاح', 'info');
    await loadData();
  };

  const restoreDatabase = async (backupData: any) => {
    const res = await api.restoreDatabase(backupData);
    if (res.success) {
      showToast('تمت استعادة النسخة الاحتياطية بنجاح', 'success');
      await loadData();
    } else {
      showToast(res.error || 'فشلت استعادة النسخة الاحتياطية', 'error');
    }
  };

  const reloadAll = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        currentUser,
        currentRole,
        activeView,
        selectedPageSlug,
        toasts,
        isLoginModalOpen,
        isJoinModalOpen,
        isDevUserSwitcherOpen,
        isMemberPortalOpen,
        setActiveView: handleSetActiveView,
        setIsLoginModalOpen,
        setIsJoinModalOpen,
        setIsDevUserSwitcherOpen,
        setIsMemberPortalOpen,
        showToast,
        can,
        login,
        logout,
        switchUser,
        submitJoinRequest,
        saveMember,
        deleteMember,
        restoreMember,
        saveNews,
        deleteNews,
        restoreNews,
        saveEvent,
        deleteEvent,
        restoreEvent,
        rsvpEvent,
        saveAlbum,
        deleteAlbum,
        addMediaItem,
        saveDocument,
        deleteDocument,
        restoreDocument,
        saveTransaction,
        deleteTransaction,
        restoreTransaction,
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
        resetDatabase,
        restoreDatabase,
        reloadAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
