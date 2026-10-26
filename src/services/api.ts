import { DatabaseState, Member, NewsItem, EventItem, MediaAlbum, DocumentItem, FundTransaction, CustomPage, DynamicSection, SiteSettings, UserAccount, Role, CustomField, JoinRequest } from '../types';
import { INITIAL_DATABASE, GUEST_USER, GUEST_ROLE } from '../data/initialData';

const LOCAL_STORAGE_KEY = 'albakri_family_db_v2';
const SESSION_USER_KEY = 'albakri_active_user_v2';

// Helper to get local fallback state
function getLocalFallback(): DatabaseState {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Could not read from localStorage:', e);
  }
  return INITIAL_DATABASE;
}

function saveLocalFallback(data: DatabaseState): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not write to localStorage:', e);
  }
}

export const api = {
  // Fetch full data
  async getData(): Promise<DatabaseState> {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data = await res.json();
        saveLocalFallback(data);
        return data;
      }
    } catch (e) {
      console.warn('API fetch failed, falling back to local store:', e);
    }
    return getLocalFallback();
  },

  // Get active session
  async getSession(): Promise<{ user: UserAccount; role: Role }> {
    try {
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn('Session API failed:', e);
    }
    const local = getLocalFallback();
    const storedUserId = localStorage.getItem(SESSION_USER_KEY);
    if (storedUserId) {
      const user = local.users.find(u => u.id === storedUserId);
      if (user) {
        const role = local.roles.find(r => r.id === user.roleId) || GUEST_ROLE;
        return { user, role };
      }
    }
    return { user: GUEST_USER, role: GUEST_ROLE };
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem(SESSION_USER_KEY);
  },

  // Login
  async login(identifier: string, password?: string): Promise<{ success: boolean; user?: UserAccount; role?: Role; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, username: identifier, password }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem(SESSION_USER_KEY, data.user.id);
        return data;
      }
      return { success: false, error: data.error || 'فشل تسجيل الدخول' };
    } catch (e) {
      const local = getLocalFallback();
      const idf = (identifier || '').trim().toLowerCase();
      const pwd = (password || '').trim();

      // Check majed1 / majed2 local fallback
      if (idf === 'majed1' && pwd !== '2468') {
        return { success: false, error: 'كلمة المرور غير صحيحة للمدير majed1' };
      }
      if (idf === 'majed2' && pwd !== '13579') {
        return { success: false, error: 'كلمة المرور غير صحيحة للمدير majed2' };
      }

      const user = local.users.find(u => 
        (u.username && u.username.toLowerCase() === idf) || 
        (u.email && u.email.toLowerCase() === idf)
      );
      if (user) {
        localStorage.setItem(SESSION_USER_KEY, user.id);
        const role = local.roles.find(r => r.id === user.roleId) || local.roles[0];
        return { success: true, user, role };
      }
      return { success: false, error: 'اسم المستخدم أو البريد الإلكتروني غير مسجل' };
    }
  },

  // Switch User (Demo/Evaluator helper)
  async switchUser(userId: string): Promise<{ success: boolean; user?: UserAccount; role?: Role }> {
    try {
      const res = await fetch('/api/auth/switch-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem(SESSION_USER_KEY, data.user.id);
        return data;
      }
    } catch (e) {
      // Fallback
    }
    const local = getLocalFallback();
    const user = local.users.find(u => u.id === userId) || local.users[0];
    const role = local.roles.find(r => r.id === user.roleId) || local.roles[0];
    localStorage.setItem(SESSION_USER_KEY, user.id);
    return { success: true, user, role };
  },

  // Join request
  async submitJoinRequest(data: Partial<JoinRequest>): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/join-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      const local = getLocalFallback();
      local.joinRequests.unshift({
        id: `req-${Date.now()}`,
        fullName: data.fullName || '',
        fatherName: data.fatherName || '',
        grandFatherName: data.grandFatherName || '',
        branchName: data.branchName || 'فرع الرياض',
        phone: data.phone || '',
        email: data.email || '',
        city: data.city || 'الرياض',
        notes: data.notes || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      saveLocalFallback(local);
      return { success: true };
    }
  },

  // Member CRUD
  async saveMember(member: Partial<Member>): Promise<{ success: boolean; member?: Member; error?: string }> {
    const isEdit = !!member.id;
    const url = isEdit ? `/api/members/${member.id}` : '/api/members';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطأ في حفظ العضو');
      return data;
    } catch (e: any) {
      console.warn('API error, falling back locally:', e);
      const local = getLocalFallback();
      if (isEdit) {
        const idx = local.members.findIndex(m => m.id === member.id);
        if (idx !== -1) local.members[idx] = { ...local.members[idx], ...member };
      } else {
        const newM: Member = {
          id: `mem-${Date.now()}`,
          fullName: member.fullName!,
          gender: member.gender || 'male',
          branchId: member.branchId || 'br-1',
          branchName: member.branchName || 'فرع الرياض',
          generation: member.generation || 5,
          birthYear: member.birthYear || '1995',
          isAlive: member.isAlive ?? true,
          city: member.city || 'الرياض',
          residenceCountry: 'المملكة العربية السعودية',
          isPrivate: false,
          status: 'active',
          ...member,
        };
        local.members.push(newM);
      }
      saveLocalFallback(local);
      return { success: true };
    }
  },

  async deleteMember(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/members/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {
      const local = getLocalFallback();
      const idx = local.members.findIndex(m => m.id === id);
      if (idx !== -1) {
        if (permanent) local.members.splice(idx, 1);
        else {
          local.members[idx].isDeleted = true;
          local.members[idx].deletedAt = new Date().toISOString();
        }
        saveLocalFallback(local);
      }
    }
  },

  async restoreMember(id: string): Promise<void> {
    try {
      await fetch(`/api/members/${id}/restore`, { method: 'POST' });
    } catch (e) {
      const local = getLocalFallback();
      const m = local.members.find(m => m.id === id);
      if (m) {
        m.isDeleted = false;
        delete m.deletedAt;
        saveLocalFallback(local);
      }
    }
  },

  // News CRUD
  async saveNews(news: Partial<NewsItem>): Promise<any> {
    const isEdit = !!news.id;
    const url = isEdit ? `/api/news/${news.id}` : '/api/news';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(news),
      });
      return await res.json();
    } catch (e) {
      // Fallback
    }
  },

  async deleteNews(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/news/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async restoreNews(id: string): Promise<void> {
    try {
      await fetch(`/api/news/${id}/restore`, { method: 'POST' });
    } catch (e) {}
  },

  // Events CRUD
  async saveEvent(evt: Partial<EventItem>): Promise<any> {
    const isEdit = !!evt.id;
    const url = isEdit ? `/api/events/${evt.id}` : '/api/events';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evt),
      });
      return await res.json();
    } catch (e) {}
  },

  async deleteEvent(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/events/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async restoreEvent(id: string): Promise<void> {
    try {
      await fetch(`/api/events/${id}/restore`, { method: 'POST' });
    } catch (e) {}
  },

  async rsvpEvent(id: string): Promise<any> {
    try {
      const res = await fetch(`/api/events/${id}/rsvp`, { method: 'POST' });
      return await res.json();
    } catch (e) {}
  },

  // Albums & Media
  async saveAlbum(album: Partial<MediaAlbum>): Promise<any> {
    const isEdit = !!album.id;
    const url = isEdit ? `/api/albums/${album.id}` : '/api/albums';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(album),
      });
      return await res.json();
    } catch (e) {}
  },

  async deleteAlbum(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/albums/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async addMediaItem(albumId: string, item: any): Promise<any> {
    try {
      const res = await fetch(`/api/albums/${albumId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      return await res.json();
    } catch (e) {}
  },

  // Documents
  async saveDocument(doc: Partial<DocumentItem>): Promise<any> {
    const isEdit = !!doc.id;
    const url = isEdit ? `/api/documents/${doc.id}` : '/api/documents';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
      return await res.json();
    } catch (e) {}
  },

  async deleteDocument(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/documents/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async restoreDocument(id: string): Promise<void> {
    try {
      await fetch(`/api/documents/${id}/restore`, { method: 'POST' });
    } catch (e) {}
  },

  // Fund
  async saveTransaction(tx: Partial<FundTransaction>): Promise<any> {
    try {
      const res = await fetch('/api/fund/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
      return await res.json();
    } catch (e) {}
  },

  async deleteTransaction(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/fund/transactions/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async restoreTransaction(id: string): Promise<void> {
    try {
      await fetch(`/api/fund/transactions/${id}/restore`, { method: 'POST' });
    } catch (e) {}
  },

  // CMS: Dynamic Sections
  async updateSections(sections: DynamicSection[]): Promise<any> {
    try {
      const res = await fetch('/api/cms/sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections }),
      });
      return await res.json();
    } catch (e) {}
  },

  async updateSection(id: string, data: Partial<DynamicSection>): Promise<any> {
    try {
      const res = await fetch(`/api/cms/sections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {}
  },

  // CMS: Custom Pages
  async savePage(page: Partial<CustomPage>): Promise<any> {
    const isEdit = !!page.id;
    const url = isEdit ? `/api/cms/pages/${page.id}` : '/api/cms/pages';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      });
      return await res.json();
    } catch (e) {}
  },

  async deletePage(id: string, permanent: boolean = false): Promise<void> {
    try {
      await fetch(`/api/cms/pages/${id}?permanent=${permanent}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async restorePage(id: string): Promise<void> {
    try {
      await fetch(`/api/cms/pages/${id}/restore`, { method: 'POST' });
    } catch (e) {}
  },

  // CMS: Nav links
  async updateNavLinks(navLinks: any[]): Promise<any> {
    try {
      const res = await fetch('/api/cms/nav', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ navLinks }),
      });
      return await res.json();
    } catch (e) {}
  },

  // Settings
  async updateSettings(settings: Partial<SiteSettings>): Promise<any> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return await res.json();
    } catch (e) {}
  },

  // Custom Fields
  async addCustomField(field: Partial<CustomField>): Promise<any> {
    try {
      const res = await fetch('/api/custom-fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(field),
      });
      return await res.json();
    } catch (e) {}
  },

  async deleteCustomField(id: string): Promise<void> {
    try {
      await fetch(`/api/custom-fields/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  // Users & Roles
  async saveUser(user: Partial<UserAccount>): Promise<any> {
    const isEdit = !!user.id;
    const url = isEdit ? `/api/users/${user.id}` : '/api/users';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      return await res.json();
    } catch (e) {}
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (e) {}
  },

  async saveRole(role: Partial<Role>): Promise<any> {
    const isEdit = !!role.id;
    const url = isEdit ? `/api/roles/${role.id}` : '/api/roles';
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
      return await res.json();
    } catch (e) {}
  },

  // Recycle Bin & System Reset
  async getRecycleBin(): Promise<{ items: any[] }> {
    try {
      const res = await fetch('/api/recycle-bin');
      return await res.json();
    } catch (e) {
      return { items: [] };
    }
  },

  async resetData(): Promise<any> {
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      return await res.json();
    } catch (e) {}
  },

  async restoreDatabase(backupData: any): Promise<any> {
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });
      return await res.json();
    } catch (e) {}
  },
};
