import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { INITIAL_DATABASE, GUEST_USER, GUEST_ROLE, isAuthorizedAdmin } from './src/data/initialData.ts';
import { DatabaseState, Member, NewsItem, EventItem, MediaAlbum, DocumentItem, FundTransaction, CustomPage, DynamicSection, SiteSettings, UserAccount, Role, CustomField, JoinRequest } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'albakri_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize database
function loadDatabase(): DatabaseState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading database file, initializing with defaults:', err);
  }
  // Initialize with seed data
  saveDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

function saveDatabase(state: DatabaseState): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database:', err);
  }
}

let db = loadDatabase();

// In-memory active session - default to Guest (Visitors & regular users browse site, only majed1 & majed2 access CMS)
let activeUser: UserAccount = GUEST_USER;

function addAuditLog(action: string, entity: string, details: string) {
  const newLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    userId: activeUser?.id || 'guest',
    userName: activeUser?.name || 'زائر',
    userRole: activeUser?.roleName || 'زائر',
    action: action as any,
    entity: entity as any,
    details,
  };
  db.auditLogs.unshift(newLog);
  // Keep last 300 logs
  if (db.auditLogs.length > 300) {
    db.auditLogs = db.auditLogs.slice(0, 300);
  }
  saveDatabase(db);
}

// Circular relation detector for family tree
function hasCircularRelation(members: Member[], memberId: string, targetFatherId?: string | null): boolean {
  if (!targetFatherId) return false;
  if (memberId === targetFatherId) return true;
  
  const visited = new Set<string>();
  let currentId: string | null | undefined = targetFatherId;
  
  while (currentId) {
    if (currentId === memberId) return true;
    if (visited.has(currentId)) return true;
    visited.add(currentId);
    
    const parent = members.find(m => m.id === currentId);
    currentId = parent?.fatherId;
  }
  
  return false;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString(), family: db.settings.familyName });
  });

  // Current session
  app.get('/api/session', (req, res) => {
    if (activeUser.id === 'usr-guest') {
      return res.json({ user: GUEST_USER, role: GUEST_ROLE });
    }
    const role = db.roles.find(r => r.id === activeUser.roleId) || db.roles[0];
    res.json({ user: activeUser, role });
  });

  // Guard middleware: strictly allow only majed1 and majed2 to perform administrative actions
  const requireAdmin = (req: Request, res: Response, next: () => void) => {
    if (!isAuthorizedAdmin(activeUser)) {
      return res.status(403).json({
        error: 'غير مصرح: لوحة التحكم والتعديلات الإدارية محصورة فقط بالمديرين المعتمدين (majed1 و majed2).'
      });
    }
    next();
  };

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, username, password } = req.body;
    const identifier = ((username || email || '').trim()).toLowerCase();
    const pwd = (password || '').toString().trim();

    // Check Admin 1: majed1 (password 2468)
    if (identifier === 'majed1' || identifier === 'majed1@albakri.org') {
      if (pwd !== '2468') {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة للمدير majed1' });
      }
      const adminUser = db.users.find(u => u.username === 'majed1' || u.id === 'usr-admin1') || db.users[0];
      activeUser = adminUser;
      addAuditLog('login', 'settings', `تسجيل دخول ناجح للمدير الأول: ${adminUser.name}`);
      const role = db.roles.find(r => r.id === activeUser.roleId) || db.roles[0];
      return res.json({ success: true, user: activeUser, role });
    }

    // Check Admin 2: majed2 (password 13579)
    if (identifier === 'majed2' || identifier === 'majed2@albakri.org') {
      if (pwd !== '13579') {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة للمدير majed2' });
      }
      const adminUser = db.users.find(u => u.username === 'majed2' || u.id === 'usr-admin2') || db.users[1] || db.users[0];
      activeUser = adminUser;
      addAuditLog('login', 'settings', `تسجيل دخول ناجح للمدير الثاني: ${adminUser.name}`);
      const role = db.roles.find(r => r.id === activeUser.roleId) || db.roles[0];
      return res.json({ success: true, user: activeUser, role });
    }

    // Check in database users list
    const user = db.users.find(u => 
      (u.username && u.username.toLowerCase() === identifier) || 
      (u.email && u.email.toLowerCase() === identifier)
    );

    if (user) {
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'الحساب معطل حالياً، يرجى مراجعة إدارة العائلة.' });
      }
      if (user.password && pwd && user.password !== pwd) {
        return res.status(401).json({ error: 'كلمة المرور غير صحيحة' });
      }
      activeUser = user;
      addAuditLog('login', 'settings', `تسجيل دخول ناجح للمستخدم: ${user.name}`);
      const role = db.roles.find(r => r.id === activeUser.roleId) || db.roles[0];
      return res.json({ success: true, user: activeUser, role });
    }

    // Fallback for general testing emails
    if (identifier === 'admin@albakri.org' || identifier === 'admin') {
      const adminUser = db.users[0];
      activeUser = adminUser;
      addAuditLog('login', 'settings', `تسجيل دخول الإدارة: ${activeUser.name}`);
      const role = db.roles.find(r => r.id === activeUser.roleId) || db.roles[0];
      return res.json({ success: true, user: activeUser, role });
    }

    return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
  });

  // Quick Switch User (Dev & Demo evaluation helper)
  app.post('/api/auth/switch-user', (req, res) => {
    const { userId } = req.body;
    const target = db.users.find(u => u.id === userId);
    if (target) {
      activeUser = target;
      addAuditLog('login', 'users', `تبديل جلسة العمل إلى: ${target.name} (${target.roleName})`);
      const role = db.roles.find(r => r.id === activeUser.roleId) || db.roles[0];
      return res.json({ success: true, user: activeUser, role });
    }
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  });

  // Logout
  app.post('/api/auth/logout', (req, res) => {
    addAuditLog('logout', 'settings', `تسجيل خروج: ${activeUser.name}`);
    activeUser = GUEST_USER;
    res.json({ success: true, user: GUEST_USER, role: GUEST_ROLE });
  });

  // Join request submission
  app.post('/api/auth/join-request', (req, res) => {
    const { fullName, fatherName, grandFatherName, branchName, phone, email, city, notes } = req.body;
    if (!fullName || !phone) {
      return res.status(400).json({ error: 'الاسم ورقم الهاتف مطلوبان لإرسال طلب الانضمام.' });
    }
    const newReq: JoinRequest = {
      id: `req-${Date.now()}`,
      fullName,
      fatherName: fatherName || '',
      grandFatherName: grandFatherName || '',
      branchName: branchName || 'فرع الرياض',
      phone,
      email: email || '',
      city: city || 'الرياض',
      notes: notes || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    db.joinRequests.unshift(newReq);
    addAuditLog('create', 'users', `تقديم طلب انضمام جديد من: ${fullName} (${phone})`);
    saveDatabase(db);
    res.json({ success: true, request: newReq });
  });

  // Get full database (sanitized based on role)
  app.get('/api/data', (req, res) => {
    // Return all data
    res.json(db);
  });

  // --- Members & Tree Management ---
  app.post('/api/members', (req, res) => {
    const memberData: Partial<Member> = req.body;
    if (!memberData.fullName) {
      return res.status(400).json({ error: 'اسم العضو مطلوب.' });
    }

    if (memberData.fatherId && hasCircularRelation(db.members, memberData.id || '', memberData.fatherId)) {
      return res.status(400).json({ error: 'خطأ في صلة النسب: لا يمكن تحديد صلة تؤدي إلى حلقة نسب متناقضة أو دائرية.' });
    }

    const newMember: Member = {
      id: memberData.id || `mem-${Date.now()}`,
      fullName: memberData.fullName,
      gender: memberData.gender || 'male',
      branchId: memberData.branchId || 'br-1',
      branchName: memberData.branchName || 'فرع الرياض',
      generation: memberData.generation || 5,
      fatherId: memberData.fatherId || null,
      motherId: memberData.motherId || null,
      birthYear: memberData.birthYear || '1995',
      deathYear: memberData.deathYear || '',
      isAlive: memberData.isAlive !== undefined ? memberData.isAlive : true,
      city: memberData.city || 'الرياض',
      residenceCountry: memberData.residenceCountry || 'المملكة العربية السعودية',
      phone: memberData.phone || '',
      email: memberData.email || '',
      occupation: memberData.occupation || '',
      bio: memberData.bio || '',
      avatarUrl: memberData.avatarUrl || '',
      isPrivate: memberData.isPrivate || false,
      status: memberData.status || 'active',
      customFields: memberData.customFields || {},
      isDeleted: false,
    };

    db.members.push(newMember);
    addAuditLog('create', 'members', `إضافة عضو جديد: ${newMember.fullName} في ${newMember.branchName}`);
    saveDatabase(db);
    res.json({ success: true, member: newMember });
  });

  app.put('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const memberIndex = db.members.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'العضو غير موجود' });
    }

    const updateData = req.body;
    if (updateData.fatherId && hasCircularRelation(db.members, id, updateData.fatherId)) {
      return res.status(400).json({ error: 'تنبيه تدقيق النسب: الصلة المحددة تؤدي إلى تناقض دائري في الشجرة.' });
    }

    db.members[memberIndex] = { ...db.members[memberIndex], ...updateData };
    addAuditLog('update', 'members', `تحديث بيانات العضو: ${db.members[memberIndex].fullName}`);
    saveDatabase(db);
    res.json({ success: true, member: db.members[memberIndex] });
  });

  app.delete('/api/members/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const memberIndex = db.members.findIndex(m => m.id === id);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'العضو غير موجود' });
    }

    const memberName = db.members[memberIndex].fullName;
    if (permanent === 'true') {
      db.members.splice(memberIndex, 1);
      addAuditLog('purge', 'members', `حذف نهائي للعضو: ${memberName}`);
    } else {
      db.members[memberIndex].isDeleted = true;
      db.members[memberIndex].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'members', `نقل العضو إلى سلة المحذوفات: ${memberName}`);
    }
    saveDatabase(db);
    res.json({ success: true, message: 'تمت العملية بنجاح' });
  });

  app.post('/api/members/:id/restore', (req, res) => {
    const { id } = req.params;
    const member = db.members.find(m => m.id === id);
    if (!member) return res.status(404).json({ error: 'العنصر غير موجود' });
    member.isDeleted = false;
    delete member.deletedAt;
    addAuditLog('restore', 'members', `استعادة العضو من سلة المحذوفات: ${member.fullName}`);
    saveDatabase(db);
    res.json({ success: true, member });
  });

  // --- News & Articles ---
  app.post('/api/news', (req, res) => {
    const newsData: Partial<NewsItem> = req.body;
    if (!newsData.title) return res.status(400).json({ error: 'عنوان الخبر مطلوب.' });

    const newItem: NewsItem = {
      id: `news-${Date.now()}`,
      title: newsData.title,
      summary: newsData.summary || '',
      content: newsData.content || '',
      category: newsData.category || 'أخبار عامة',
      coverImageUrl: newsData.coverImageUrl || '/src/assets/images/hero_albakri_heritage_1792963368870.jpg',
      authorName: activeUser.name,
      authorId: activeUser.id,
      publishDate: newsData.publishDate || new Date().toISOString().split('T')[0],
      status: newsData.status || 'published',
      isMembersOnly: newsData.isMembersOnly || false,
      viewsCount: 0,
      tags: newsData.tags || [],
      isDeleted: false,
    };
    db.news.unshift(newItem);
    addAuditLog('create', 'news', `إضافة خبر جديد: ${newItem.title}`);
    saveDatabase(db);
    res.json({ success: true, news: newItem });
  });

  app.put('/api/news/:id', (req, res) => {
    const { id } = req.params;
    const index = db.news.findIndex(n => n.id === id);
    if (index === -1) return res.status(404).json({ error: 'الخبر غير موجود' });
    db.news[index] = { ...db.news[index], ...req.body };
    addAuditLog('update', 'news', `تحديث الخبر: ${db.news[index].title}`);
    saveDatabase(db);
    res.json({ success: true, news: db.news[index] });
  });

  app.delete('/api/news/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const index = db.news.findIndex(n => n.id === id);
    if (index === -1) return res.status(404).json({ error: 'الخبر غير موجود' });
    const title = db.news[index].title;
    if (permanent === 'true') {
      db.news.splice(index, 1);
      addAuditLog('purge', 'news', `حذف نهائي للخبر: ${title}`);
    } else {
      db.news[index].isDeleted = true;
      db.news[index].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'news', `نقل الخبر إلى سلة المحذوفات: ${title}`);
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/news/:id/restore', (req, res) => {
    const { id } = req.params;
    const item = db.news.find(n => n.id === id);
    if (!item) return res.status(404).json({ error: 'الخبر غير موجود' });
    item.isDeleted = false;
    delete item.deletedAt;
    addAuditLog('restore', 'news', `استعادة الخبر: ${item.title}`);
    saveDatabase(db);
    res.json({ success: true, news: item });
  });

  // --- Events ---
  app.post('/api/events', (req, res) => {
    const evtData: Partial<EventItem> = req.body;
    if (!evtData.title || !evtData.date) {
      return res.status(400).json({ error: 'عنوان المناسبة وتاريخها مطلوبان.' });
    }
    const newEvt: EventItem = {
      id: `evt-${Date.now()}`,
      title: evtData.title,
      type: evtData.type || 'اجتماع سنوي',
      date: evtData.date,
      time: evtData.time || '08:00 مساءً',
      location: evtData.location || 'الرياض',
      mapLocationName: evtData.mapLocationName || evtData.location,
      description: evtData.description || '',
      coverImageUrl: evtData.coverImageUrl || '/src/assets/images/family_gathering_event_1792963370881.jpg',
      status: evtData.status || 'upcoming',
      isMembersOnly: evtData.isMembersOnly || false,
      rsvpCount: 0,
      attendees: [],
      isDeleted: false,
    };
    db.events.unshift(newEvt);
    addAuditLog('create', 'events', `إضافة مناسبة جديدة: ${newEvt.title}`);
    saveDatabase(db);
    res.json({ success: true, event: newEvt });
  });

  app.put('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const index = db.events.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'المناسبة غير موجودة' });
    db.events[index] = { ...db.events[index], ...req.body };
    addAuditLog('update', 'events', `تحديث مناسبة: ${db.events[index].title}`);
    saveDatabase(db);
    res.json({ success: true, event: db.events[index] });
  });

  app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const index = db.events.findIndex(e => e.id === id);
    if (index === -1) return res.status(404).json({ error: 'المناسبة غير موجودة' });
    const title = db.events[index].title;
    if (permanent === 'true') {
      db.events.splice(index, 1);
      addAuditLog('purge', 'events', `حذف نهائي للمناسبة: ${title}`);
    } else {
      db.events[index].isDeleted = true;
      db.events[index].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'events', `نقل المناسبة لسلة المحذوفات: ${title}`);
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/events/:id/restore', (req, res) => {
    const { id } = req.params;
    const item = db.events.find(e => e.id === id);
    if (!item) return res.status(404).json({ error: 'المناسبة غير موجودة' });
    item.isDeleted = false;
    delete item.deletedAt;
    addAuditLog('restore', 'events', `استعادة المناسبة: ${item.title}`);
    saveDatabase(db);
    res.json({ success: true, event: item });
  });

  app.post('/api/events/:id/rsvp', (req, res) => {
    const { id } = req.params;
    const event = db.events.find(e => e.id === id);
    if (!event) return res.status(404).json({ error: 'المناسبة غير موجودة' });
    const attendeeName = activeUser.name;
    if (!event.attendees) event.attendees = [];
    if (!event.attendees.includes(attendeeName)) {
      event.attendees.push(attendeeName);
      event.rsvpCount = event.attendees.length;
      addAuditLog('update', 'events', `تأكيد حضور في: ${event.title}`);
    } else {
      event.attendees = event.attendees.filter(name => name !== attendeeName);
      event.rsvpCount = event.attendees.length;
      addAuditLog('update', 'events', `إلغاء تأكيد حضور في: ${event.title}`);
    }
    saveDatabase(db);
    res.json({ success: true, event });
  });

  // --- Media & Albums ---
  app.post('/api/albums', (req, res) => {
    const albumData: Partial<MediaAlbum> = req.body;
    if (!albumData.title) return res.status(400).json({ error: 'عنوان الألبوم مطلوب.' });
    const newAlbum: MediaAlbum = {
      id: `alb-${Date.now()}`,
      title: albumData.title,
      description: albumData.description || '',
      category: albumData.category || 'اجتماعات العائلة',
      coverImageUrl: albumData.coverImageUrl || '/src/assets/images/family_gathering_event_1792963370881.jpg',
      isMembersOnly: albumData.isMembersOnly || false,
      items: albumData.items || [],
      createdAt: new Date().toISOString().split('T')[0],
      isDeleted: false,
    };
    db.albums.unshift(newAlbum);
    addAuditLog('create', 'media', `إنشاء ألبوم جديد: ${newAlbum.title}`);
    saveDatabase(db);
    res.json({ success: true, album: newAlbum });
  });

  app.put('/api/albums/:id', (req, res) => {
    const { id } = req.params;
    const index = db.albums.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'الألبوم غير موجود' });
    db.albums[index] = { ...db.albums[index], ...req.body };
    addAuditLog('update', 'media', `تحديث الألبوم: ${db.albums[index].title}`);
    saveDatabase(db);
    res.json({ success: true, album: db.albums[index] });
  });

  app.delete('/api/albums/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const index = db.albums.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'الألبوم غير موجود' });
    const title = db.albums[index].title;
    if (permanent === 'true') {
      db.albums.splice(index, 1);
      addAuditLog('purge', 'media', `حذف نهائي للألبوم: ${title}`);
    } else {
      db.albums[index].isDeleted = true;
      db.albums[index].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'media', `نقل الألبوم لسلة المحذوفات: ${title}`);
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/albums/:id/items', (req, res) => {
    const { id } = req.params;
    const album = db.albums.find(a => a.id === id);
    if (!album) return res.status(404).json({ error: 'الألبوم غير موجود' });
    const itemData = req.body;
    const newItem = {
      id: `med-${Date.now()}`,
      albumId: id,
      title: itemData.title || 'صورة جديدة',
      type: itemData.type || 'image',
      url: itemData.url || '/src/assets/images/hero_albakri_heritage_1792963368870.jpg',
      thumbnailUrl: itemData.url || '/src/assets/images/hero_albakri_heritage_1792963368870.jpg',
      date: itemData.date || new Date().toISOString().split('T')[0],
      description: itemData.description || '',
      order: (album.items?.length || 0) + 1,
    };
    album.items.push(newItem);
    addAuditLog('create', 'media', `إضافة صورة/فيديو إلى الألبوم: ${album.title}`);
    saveDatabase(db);
    res.json({ success: true, album });
  });

  // --- Documents Archive ---
  app.post('/api/documents', (req, res) => {
    const docData: Partial<DocumentItem> = req.body;
    if (!docData.title) return res.status(400).json({ error: 'عنوان الوثيقة مطلوب.' });
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: docData.title,
      documentType: docData.documentType || 'وثيقة تاريخية',
      fileSize: docData.fileSize || '2.5 MB',
      fileExtension: docData.fileExtension || 'PDF',
      uploadDate: new Date().toISOString().split('T')[0],
      description: docData.description || '',
      isConfidential: docData.isConfidential || false,
      fileUrl: docData.fileUrl || '/src/assets/images/family_archive_document_1792963370486.jpg',
      downloadCount: 0,
      isDeleted: false,
    };
    db.documents.unshift(newDoc);
    addAuditLog('create', 'documents', `رفع وثيقة جديدة: ${newDoc.title}`);
    saveDatabase(db);
    res.json({ success: true, document: newDoc });
  });

  app.put('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const index = db.documents.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'الوثيقة غير موجودة' });
    db.documents[index] = { ...db.documents[index], ...req.body };
    addAuditLog('update', 'documents', `تحديث الوثيقة: ${db.documents[index].title}`);
    saveDatabase(db);
    res.json({ success: true, document: db.documents[index] });
  });

  app.delete('/api/documents/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const index = db.documents.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'الوثيقة غير موجودة' });
    const title = db.documents[index].title;
    if (permanent === 'true') {
      db.documents.splice(index, 1);
      addAuditLog('purge', 'documents', `حذف نهائي للوثيقة: ${title}`);
    } else {
      db.documents[index].isDeleted = true;
      db.documents[index].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'documents', `نقل الوثيقة لسلة المحذوفات: ${title}`);
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/documents/:id/restore', (req, res) => {
    const { id } = req.params;
    const item = db.documents.find(d => d.id === id);
    if (!item) return res.status(404).json({ error: 'الوثيقة غير موجودة' });
    item.isDeleted = false;
    delete item.deletedAt;
    addAuditLog('restore', 'documents', `استعادة الوثيقة: ${item.title}`);
    saveDatabase(db);
    res.json({ success: true, document: item });
  });

  // --- Family Treasury / Fund ---
  app.post('/api/fund/transactions', (req, res) => {
    const txData: Partial<FundTransaction> = req.body;
    if (!txData.amount || !txData.partyName) {
      return res.status(400).json({ error: 'المبلغ والجهة/الطرف مطلوبان لتسجيل المعاملة.' });
    }
    const newTx: FundTransaction = {
      id: `tx-${Date.now()}`,
      type: txData.type || 'income',
      amount: Number(txData.amount),
      category: txData.category || 'اشتراكات سنوية',
      partyName: txData.partyName,
      memberId: txData.memberId,
      date: txData.date || new Date().toISOString().split('T')[0],
      receiptNumber: txData.receiptNumber || `TX-${Date.now().toString().slice(-6)}`,
      description: txData.description || '',
      attachmentUrl: txData.attachmentUrl,
      createdBy: activeUser.name,
      isDeleted: false,
    };
    db.transactions.unshift(newTx);
    addAuditLog('create', 'fund', `تسجيل سند مالي جديد (${newTx.type === 'income' ? 'قبض' : 'صرف'}) بمبلغ ${newTx.amount.toLocaleString()} ر.س.`);
    saveDatabase(db);
    res.json({ success: true, transaction: newTx });
  });

  app.delete('/api/fund/transactions/:id', (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const index = db.transactions.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ error: 'السند المالي غير موجود' });
    const receipt = db.transactions[index].receiptNumber;
    if (permanent === 'true') {
      db.transactions.splice(index, 1);
      addAuditLog('purge', 'fund', `حذف نهائي للسند المالي: ${receipt}`);
    } else {
      db.transactions[index].isDeleted = true;
      db.transactions[index].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'fund', `نقل السند المالي لسلة المحذوفات: ${receipt}`);
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/fund/transactions/:id/restore', (req, res) => {
    const { id } = req.params;
    const item = db.transactions.find(t => t.id === id);
    if (!item) return res.status(404).json({ error: 'السند غير موجود' });
    item.isDeleted = false;
    delete item.deletedAt;
    addAuditLog('restore', 'fund', `استعادة السند المالي: ${item.receiptNumber}`);
    saveDatabase(db);
    res.json({ success: true, transaction: item });
  });

  // --- CMS: Dynamic Sections Management ---
  app.put('/api/cms/sections', requireAdmin, (req, res) => {
    const { sections } = req.body;
    if (Array.isArray(sections)) {
      db.sections = sections;
      addAuditLog('update', 'sections', 'تحديث ترتيب وإعدادات الأقسام بالصفحة الرئيسية');
      saveDatabase(db);
      return res.json({ success: true, sections: db.sections });
    }
    res.status(400).json({ error: 'بيانات الأقسام غير صحيحة' });
  });

  app.put('/api/cms/sections/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const index = db.sections.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'القسم غير موجود' });
    db.sections[index] = { ...db.sections[index], ...req.body };
    addAuditLog('update', 'sections', `تحديث القسم: ${db.sections[index].title} (ظهور: ${db.sections[index].enabled ? 'نعم' : 'مخفي'})`);
    saveDatabase(db);
    res.json({ success: true, section: db.sections[index] });
  });

  // --- CMS: Custom Pages Management ---
  app.post('/api/cms/pages', requireAdmin, (req, res) => {
    const pageData: Partial<CustomPage> = req.body;
    if (!pageData.title || !pageData.slug) {
      return res.status(400).json({ error: 'عنوان الصفحة والرابط التعريفي مطلوبان.' });
    }
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      slug: pageData.slug.toLowerCase().trim().replace(/\s+/g, '-'),
      title: pageData.title,
      content: pageData.content || '',
      coverImageUrl: pageData.coverImageUrl,
      isPublished: pageData.isPublished !== undefined ? pageData.isPublished : true,
      isMembersOnly: pageData.isMembersOnly || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    };
    db.pages.push(newPage);
    addAuditLog('create', 'pages', `إنشاء صفحة جديدة: ${newPage.title} (${newPage.slug})`);
    saveDatabase(db);
    res.json({ success: true, page: newPage });
  });

  app.put('/api/cms/pages/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const index = db.pages.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'الصفحة غير موجودة' });
    db.pages[index] = { ...db.pages[index], ...req.body, updatedAt: new Date().toISOString() };
    addAuditLog('update', 'pages', `تحديث محتوى الصفحة: ${db.pages[index].title}`);
    saveDatabase(db);
    res.json({ success: true, page: db.pages[index] });
  });

  app.delete('/api/cms/pages/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { permanent } = req.query;
    const index = db.pages.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'الصفحة غير موجودة' });
    const title = db.pages[index].title;
    if (permanent === 'true') {
      db.pages.splice(index, 1);
      addAuditLog('purge', 'pages', `حذف نهائي للصفحة: ${title}`);
    } else {
      db.pages[index].isDeleted = true;
      db.pages[index].deletedAt = new Date().toISOString();
      addAuditLog('delete', 'pages', `نقل الصفحة لسلة المحذوفات: ${title}`);
    }
    saveDatabase(db);
    res.json({ success: true });
  });

  app.post('/api/cms/pages/:id/restore', requireAdmin, (req, res) => {
    const { id } = req.params;
    const item = db.pages.find(p => p.id === id);
    if (!item) return res.status(404).json({ error: 'الصفحة غير موجودة' });
    item.isDeleted = false;
    delete item.deletedAt;
    addAuditLog('restore', 'pages', `استعادة الصفحة: ${item.title}`);
    saveDatabase(db);
    res.json({ success: true, page: item });
  });

  // --- CMS: Navigation Links ---
  app.put('/api/cms/nav', requireAdmin, (req, res) => {
    const { navLinks } = req.body;
    if (Array.isArray(navLinks)) {
      db.navLinks = navLinks;
      addAuditLog('update', 'pages', 'تحديث عناصر وقوائم التنقل العلوية للموقع');
      saveDatabase(db);
      return res.json({ success: true, navLinks: db.navLinks });
    }
    res.status(400).json({ error: 'بيانات القائمة غير صحيحة' });
  });

  // --- Settings & Appearance ---
  app.put('/api/settings', requireAdmin, (req, res) => {
    db.settings = { ...db.settings, ...req.body };
    addAuditLog('settings_change', 'settings', 'تحديث إعدادات الموقع العامة والهوية البصرية');
    saveDatabase(db);
    res.json({ success: true, settings: db.settings });
  });

  // --- Custom Fields Builder ---
  app.post('/api/custom-fields', requireAdmin, (req, res) => {
    const fieldData = req.body;
    if (!fieldData.label || !fieldData.key) {
      return res.status(400).json({ error: 'اسم الحقل والمعرف مطلوبان.' });
    }
    const newField: CustomField = {
      id: `cf-${Date.now()}`,
      key: fieldData.key.trim().replace(/\s+/g, '_'),
      label: fieldData.label,
      type: fieldData.type || 'text',
      options: fieldData.options || [],
      isRequired: fieldData.isRequired || false,
      isPublic: fieldData.isPublic || false,
      order: db.customFields.length + 1,
    };
    db.customFields.push(newField);
    addAuditLog('create', 'custom_fields', `إضافة حقل مخصص جديد للأعضاء: ${newField.label}`);
    saveDatabase(db);
    res.json({ success: true, field: newField });
  });

  app.delete('/api/custom-fields/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const index = db.customFields.findIndex(f => f.id === id);
    if (index === -1) return res.status(404).json({ error: 'الحقل غير موجود' });
    const label = db.customFields[index].label;
    db.customFields.splice(index, 1);
    addAuditLog('delete', 'custom_fields', `حذف حقل الأعضاء المخصص: ${label}`);
    saveDatabase(db);
    res.json({ success: true });
  });

  // --- Users & Roles Management ---
  app.post('/api/users', requireAdmin, (req, res) => {
    const userData: Partial<UserAccount> = req.body;
    if (!userData.name || !userData.email) {
      return res.status(400).json({ error: 'الاسم والبريد الإلكتروني مطلوبان.' });
    }
    const role = db.roles.find(r => r.id === userData.roleId) || db.roles[db.roles.length - 1];
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      roleId: role.id,
      roleName: role.name,
      roleCode: role.code,
      phone: userData.phone || '',
      branchName: userData.branchName || 'فرع الرياض',
      status: userData.status || 'active',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);
    addAuditLog('create', 'users', `إنشاء حساب مستخدم جديد: ${newUser.name} بدور ${newUser.roleName}`);
    saveDatabase(db);
    res.json({ success: true, user: newUser });
  });

  app.put('/api/users/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });
    if (req.body.roleId) {
      const role = db.roles.find(r => r.id === req.body.roleId);
      if (role) {
        req.body.roleName = role.name;
        req.body.roleCode = role.code;
      }
    }
    db.users[index] = { ...db.users[index], ...req.body };
    addAuditLog('update', 'users', `تعديل بيانات المستخدم: ${db.users[index].name}`);
    saveDatabase(db);
    res.json({ success: true, user: db.users[index] });
  });

  app.delete('/api/users/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    if (id === activeUser.id) {
      return res.status(400).json({ error: 'لا يمكن حذف الحساب الحالي المسجل به.' });
    }
    const index = db.users.findIndex(u => u.id === id);
    if (index === -1) return res.status(404).json({ error: 'المستخدم غير موجود' });
    const name = db.users[index].name;
    db.users.splice(index, 1);
    addAuditLog('delete', 'users', `حذف حساب المستخدم: ${name}`);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Roles
  app.post('/api/roles', requireAdmin, (req, res) => {
    const roleData: Partial<Role> = req.body;
    if (!roleData.name) return res.status(400).json({ error: 'اسم الدور مطلوب.' });
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: roleData.name,
      code: `custom_${Date.now()}`,
      description: roleData.description || '',
      isSystem: false,
      permissions: roleData.permissions || db.roles[0].permissions,
    };
    db.roles.push(newRole);
    addAuditLog('create', 'roles', `إنشاء دور وصلاحيات جديدة: ${newRole.name}`);
    saveDatabase(db);
    res.json({ success: true, role: newRole });
  });

  app.put('/api/roles/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const index = db.roles.findIndex(r => r.id === id);
    if (index === -1) return res.status(404).json({ error: 'الدور غير موجود' });
    db.roles[index] = { ...db.roles[index], ...req.body };
    addAuditLog('update', 'roles', `تحديث صلاحيات الدور: ${db.roles[index].name}`);
    saveDatabase(db);
    res.json({ success: true, role: db.roles[index] });
  });

  // Join request approval
  app.put('/api/join-requests/:id', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const reqItem = db.joinRequests.find(r => r.id === id);
    if (!reqItem) return res.status(404).json({ error: 'الطلب غير موجود' });
    reqItem.status = status;
    addAuditLog('update', 'users', `تغيير حالة طلب الانضمام لـ: ${reqItem.fullName} إلى (${status})`);
    saveDatabase(db);
    res.json({ success: true, request: reqItem });
  });

  // --- Recycle Bin ---
  app.get('/api/recycle-bin', (req, res) => {
    const deletedMembers = db.members.filter(m => m.isDeleted).map(m => ({ ...m, _type: 'member', _typeLabel: 'عضو' }));
    const deletedNews = db.news.filter(n => n.isDeleted).map(n => ({ ...n, _type: 'news', _typeLabel: 'خبر' }));
    const deletedEvents = db.events.filter(e => e.isDeleted).map(e => ({ ...e, _type: 'event', _typeLabel: 'مناسبة' }));
    const deletedAlbums = db.albums.filter(a => a.isDeleted).map(a => ({ ...a, _type: 'album', _typeLabel: 'ألبوم' }));
    const deletedDocs = db.documents.filter(d => d.isDeleted).map(d => ({ ...d, _type: 'document', _typeLabel: 'وثيقة' }));
    const deletedTxs = db.transactions.filter(t => t.isDeleted).map(t => ({ ...t, _type: 'fund', _typeLabel: 'سند مالي' }));
    const deletedPages = db.pages.filter(p => p.isDeleted).map(p => ({ ...p, _type: 'page', _typeLabel: 'صفحة مخصصة' }));

    res.json({
      items: [
        ...deletedMembers,
        ...deletedNews,
        ...deletedEvents,
        ...deletedAlbums,
        ...deletedDocs,
        ...deletedTxs,
        ...deletedPages,
      ],
    });
  });

  // Backup & Restore
  app.get('/api/backup', (req, res) => {
    addAuditLog('export', 'settings', 'تصدير نسخة احتياطية كاملة من قاعدة بيانات النظام');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="albakri_backup_${Date.now()}.json"`);
    res.json(db);
  });

  app.post('/api/restore', requireAdmin, (req, res) => {
    const backupData = req.body;
    if (!backupData.settings || !Array.isArray(backupData.members)) {
      return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح أو تالف.' });
    }
    db = backupData;
    addAuditLog('restore', 'settings', 'استعادة قاعدة البيانات من نسخة احتياطية سابقة');
    saveDatabase(db);
    res.json({ success: true, message: 'تمت استعادة البيانات بنجاح.' });
  });

  app.post('/api/reset-data', requireAdmin, (req, res) => {
    db = JSON.parse(JSON.stringify(INITIAL_DATABASE));
    addAuditLog('restore', 'settings', 'إعادة ضبط قاعدة البيانات للحالة الافتراضية الأولية');
    saveDatabase(db);
    res.json({ success: true, database: db });
  });

  // --- Serve Frontend via Vite in Dev, or Static in Prod ---
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Al-Bakri Family Portal] Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
