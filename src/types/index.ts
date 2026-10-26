export type RoleType = 
  | 'admin'
  | 'content_manager'
  | 'genealogist'
  | 'members_admin'
  | 'events_admin'
  | 'archive_admin'
  | 'treasurer'
  | 'member'
  | 'guest';

export interface RolePermissions {
  members: { view: boolean; create: boolean; edit: boolean; delete: boolean; export: boolean; viewPrivate: boolean };
  tree: { view: boolean; edit: boolean; export: boolean };
  news: { view: boolean; create: boolean; edit: boolean; delete: boolean; publish: boolean };
  events: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  media: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  documents: { view: boolean; create: boolean; edit: boolean; delete: boolean; downloadConfidential: boolean };
  fund: { view: boolean; create: boolean; edit: boolean; delete: boolean; exportReports: boolean };
  cms: { manageSections: boolean; managePages: boolean; manageSettings: boolean };
  users: { manageUsers: boolean; manageRoles: boolean };
  audit: { view: boolean };
}

export interface Role {
  id: string;
  name: string;
  code: RoleType | string;
  description: string;
  isSystem: boolean;
  permissions: RolePermissions;
}

export interface UserAccount {
  id: string;
  name: string;
  username?: string;
  email: string;
  password?: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  memberId?: string;
  avatarUrl?: string;
  phone?: string;
  branchName?: string;
  status: 'active' | 'pending' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

export interface FamilyBranch {
  id: string;
  name: string;
  origin: string;
  leaderName: string;
  establishedYear: string;
  description: string;
  colorHex: string;
  city: string;
}

export interface CustomField {
  id: string;
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  options?: string[];
  isRequired: boolean;
  isPublic: boolean;
  order: number;
}

export interface Member {
  id: string;
  fullName: string;
  gender: 'male' | 'female';
  branchId: string;
  branchName: string;
  generation: number;
  fatherId?: string | null;
  motherId?: string | null;
  spouseIds?: string[];
  birthYear: string;
  deathYear?: string;
  isAlive: boolean;
  city: string;
  residenceCountry: string;
  phone?: string;
  email?: string;
  occupation?: string;
  bio?: string;
  avatarUrl?: string;
  isPrivate: boolean; // hide contact & private info from public visitors
  status: 'active' | 'pending' | 'suspended';
  customFields?: Record<string, any>;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'أخبار عامة' | 'تكريم وإنجازات' | 'وفيات وتعازي' | 'أفراح وتبريكات' | 'إعلانات رسمية';
  coverImageUrl?: string;
  authorName: string;
  authorId?: string;
  publishDate: string;
  status: 'published' | 'draft' | 'scheduled';
  isMembersOnly: boolean;
  viewsCount: number;
  tags?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface EventItem {
  id: string;
  title: string;
  type: 'عرس' | 'اجتماع سنوي' | 'لقاء دوري' | 'ندوة ثقافية' | 'عزاء' | 'نشاط اجتماعي' | 'مبادرة شبابية';
  date: string;
  time: string;
  location: string;
  mapLocationName?: string;
  description: string;
  coverImageUrl?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  isMembersOnly: boolean;
  rsvpCount: number;
  attendees?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface MediaItem {
  id: string;
  albumId: string;
  title: string;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
  date: string;
  description?: string;
  order: number;
}

export interface MediaAlbum {
  id: string;
  title: string;
  description: string;
  category: 'معالم بلدة إسدود' | 'تاريخي وتراثي' | 'وثائق ورجالات العائلة' | 'مناسبات حديثة' | 'اجتماعات العائلة' | 'تكريم وجوائز' | 'لقاءات شبابية';
  coverImageUrl?: string;
  isMembersOnly: boolean;
  items: MediaItem[];
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  documentType: 'وثيقة تاريخية' | 'حجة نسب' | 'محضر اجتماع' | 'تقرير مالي' | 'شهادة وإنجاز' | 'صك وقفي';
  fileSize: string;
  fileExtension: string;
  uploadDate: string;
  description: string;
  isConfidential: boolean; // Accessible only to authenticated members with permission
  fileUrl: string;
  downloadCount: number;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface FundTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: 'اشتراكات سنوية' | 'تبرعات خيرية' | 'دعم زواج' | 'إعانات تعليمية' | 'مصاريف تشغيلية' | 'صيانة مقرات' | 'أخرى';
  partyName: string; // donor or beneficiary
  memberId?: string;
  date: string;
  receiptNumber: string;
  description: string;
  attachmentUrl?: string;
  createdBy: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface DynamicSection {
  id: string;
  sectionKey: 'hero' | 'about' | 'stats' | 'branches' | 'news' | 'events' | 'media' | 'fund_highlight' | 'custom_banner';
  title: string;
  subtitle: string;
  enabled: boolean;
  order: number;
  customContent?: string;
  backgroundImageUrl?: string;
}

export interface CustomPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImageUrl?: string;
  isPublished: boolean;
  isMembersOnly: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface NavLinkItem {
  id: string;
  label: string;
  path: string;
  iconName?: string;
  order: number;
  enabled: boolean;
  isMembersOnly: boolean;
}

export interface SiteSettings {
  familyName: string;
  siteTitle: string;
  motto: string;
  welcomeMessage: string;
  aboutText: string;
  historicalOverview: string;
  logoUrl: string;
  heroImageUrl: string;
  themeColor: 'emerald' | 'amber' | 'slate' | 'navy';
  fontFamily: 'tajawal' | 'cairo' | 'amiri';
  enableFund: boolean;
  enablePublicDirectory: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socialLinks: {
    twitter?: string;
    whatsapp?: string;
    youtube?: string;
    telegram?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'create' | 'update' | 'delete' | 'restore' | 'export' | 'login' | 'settings_change' | 'purge';
  entity: 'members' | 'tree' | 'news' | 'events' | 'media' | 'documents' | 'fund' | 'pages' | 'sections' | 'settings' | 'users' | 'roles' | 'custom_fields';
  details: string;
}

export interface JoinRequest {
  id: string;
  fullName: string;
  fatherName: string;
  grandFatherName: string;
  branchName: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DatabaseState {
  settings: SiteSettings;
  sections: DynamicSection[];
  navLinks: NavLinkItem[];
  pages: CustomPage[];
  roles: Role[];
  users: UserAccount[];
  branches: FamilyBranch[];
  customFields: CustomField[];
  members: Member[];
  news: NewsItem[];
  events: EventItem[];
  albums: MediaAlbum[];
  documents: DocumentItem[];
  transactions: FundTransaction[];
  auditLogs: AuditLogEntry[];
  joinRequests: JoinRequest[];
}
