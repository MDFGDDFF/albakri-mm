import React, { useState } from 'react';
import { useApp, isAuthorizedAdmin } from '../../context/AppContext';
import { 
  Shield, 
  Menu, 
  X, 
  User, 
  LogOut, 
  ChevronDown,
  Layers,
  Sparkles,
  ShieldCheck,
  UserCheck,
  UserPlus
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    data, 
    activeView, 
    setActiveView, 
    currentUser, 
    currentRole, 
    setIsLoginModalOpen, 
    setIsJoinModalOpen,
    setIsMemberPortalOpen,
    logout
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = data.navLinks.filter(l => l.enabled);
  
  // Strict admin check: Only majed1 and majed2 are authorized to see or access CMS
  const isAdmin = isAuthorizedAdmin(currentUser);
  const isGuest = !currentUser || currentUser.roleCode === 'guest' || currentUser.id === 'usr-guest';
  const isMember = !isGuest && !isAdmin;

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path === '/') setActiveView('home');
    else if (path === '/tree') setActiveView('tree');
    else if (path === '/directory') setActiveView('directory');
    else if (path === '/news') setActiveView('news');
    else if (path === '/events') setActiveView('events');
    else if (path === '/media') setActiveView('media');
    else if (path === '/archive') setActiveView('archive');
    else if (path === '/fund') setActiveView('fund');
    else if (path.startsWith('/page/')) {
      const slug = path.replace('/page/', '');
      setActiveView('page', slug);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar 3-Zone Contract */}
        <div className="flex items-center justify-between gap-8 h-18">
          
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <button
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 text-right group cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-full border border-amber-500/40 overflow-hidden bg-stone-800 flex items-center justify-center shrink-0">
              <img 
                src={data.settings.logoUrl || '/family_logo.png'} 
                alt="شعار عائلة البكري والبقري" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-xl font-bold font-heading text-amber-400 group-hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
                {data.settings.familyName || 'عائلة البكري والبقري'}
              </span>
              <span className="text-[11px] text-stone-400 tracking-wider font-light hidden sm:inline whitespace-nowrap">
                {data.settings.motto || 'أصالة النسب وتلاحم الأجيال'}
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links (concise, whitespace-nowrap) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-300">
            {navLinks.slice(0, 6).map((link) => {
              const isSelected = 
                (link.path === '/' && activeView === 'home') ||
                (link.path === '/tree' && activeView === 'tree') ||
                (link.path === '/directory' && activeView === 'directory') ||
                (link.path === '/news' && activeView === 'news') ||
                (link.path === '/events' && activeView === 'events') ||
                (link.path === '/media' && activeView === 'media') ||
                (link.path === '/archive' && activeView === 'archive') ||
                (link.path === '/fund' && activeView === 'fund');

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.path)}
                  className={`py-1.5 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isSelected
                      ? 'text-amber-400 border-amber-400 font-semibold'
                      : 'border-transparent hover:text-white hover:border-stone-500'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}

            {/* Custom pages in dropdown or direct if few */}
            {data.pages.filter(p => p.isPublished && !p.isDeleted).length > 0 && (
              <div className="relative group">
                <button 
                  className="flex items-center gap-1 py-1.5 text-stone-300 hover:text-white whitespace-nowrap shrink-0"
                >
                  <span>لوائح ومجالس</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-stone-850 border border-stone-750 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 py-1 z-50">
                  {data.pages.filter(p => p.isPublished && !p.isDeleted).map(page => (
                    <button
                      key={page.id}
                      onClick={() => handleNavClick(`/page/${page.slug}`)}
                      className="w-full text-right px-4 py-2 text-xs text-stone-300 hover:bg-stone-750 hover:text-amber-400 transition-colors block truncate"
                    >
                      {page.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Zone 3: Authentication & Action Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Condition 1: Admin User (majed1 or majed2) */}
            {isAdmin && (
              <button
                onClick={() => setActiveView('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-150 whitespace-nowrap shrink-0 ${
                  activeView === 'admin'
                    ? 'bg-amber-500 text-stone-950 shadow-lg ring-2 ring-amber-400/50'
                    : 'bg-stone-800 text-amber-300 border border-amber-500/40 hover:bg-stone-750'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>لوحة التحكم CMS</span>
              </button>
            )}

            {/* Condition 2: Regular Logged-in Member */}
            {isMember && (
              <button
                onClick={() => setIsMemberPortalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/70 border border-emerald-700/60 hover:bg-emerald-900/60 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>بوابة العضو / حسابي</span>
              </button>
            )}

            {/* Condition 3: Visitor / Guest (Not logged in) */}
            {isGuest && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-750 rounded-xl transition-colors whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>طلب انضمام</span>
                </button>

                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-md whitespace-nowrap shrink-0"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>
              </div>
            )}

            {/* Profile Dropdown if logged in (Admin or Member) */}
            {!isGuest && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl text-stone-300 hover:bg-stone-800 hover:text-white transition-colors border border-stone-800"
                  title="الملف الشخصي"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                    isAdmin 
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  }`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="hidden xl:inline text-xs font-medium max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-stone-400" />
                </button>

                {profileDropdownOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-64 rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl py-2 z-50 text-right animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-800">
                      <p className="text-xs font-bold text-stone-100">{currentUser.name}</p>
                      <p className="text-[11px] text-amber-400 mt-0.5">{currentRole.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-mono" dir="ltr">{currentUser.email}</p>
                    </div>

                    <div className="py-1">
                      {/* If Member: Open Member Portal */}
                      {isMember && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setIsMemberPortalOpen(true);
                          }}
                          className="w-full text-right px-4 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>بوابة العضو والبيانات الشخصية</span>
                        </button>
                      )}

                      {/* If Admin: Direct link to CMS */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            setActiveView('admin');
                          }}
                          className="w-full text-right px-4 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400 flex items-center gap-2"
                        >
                          <Layers className="w-3.5 h-3.5 text-amber-400" />
                          <span>لوحة التحكم الشاملة CMS</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          setIsJoinModalOpen(true);
                        }}
                        className="w-full text-right px-4 py-2 text-xs text-stone-300 hover:bg-stone-800 flex items-center gap-2"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-stone-400" />
                        <span>طلب إضافة فرد جديد للعائلة</span>
                      </button>

                      <div className="border-t border-stone-800 my-1 pt-1">
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-right px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5 rotate-180" />
                          <span>تسجيل الخروج</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800"
              aria-label="القائمة"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-stone-800 flex flex-col gap-2">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.path)}
                className="text-right px-3 py-2 text-sm text-stone-200 hover:bg-stone-800 hover:text-amber-400 rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}

            {data.pages.filter(p => p.isPublished && !p.isDeleted).map(p => (
              <button
                key={p.id}
                onClick={() => handleNavClick(`/page/${p.slug}`)}
                className="text-right px-3 py-2 text-sm text-stone-400 hover:bg-stone-800 hover:text-amber-400 rounded-lg transition-colors"
              >
                {p.title}
              </button>
            ))}

            {/* Mobile Admin Link - ONLY for majed1 & majed2 */}
            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setActiveView('admin');
                }}
                className="text-right px-3 py-2 text-sm text-amber-300 font-bold bg-amber-950/40 border border-amber-500/30 rounded-lg mt-2 flex items-center justify-between"
              >
                <span>الدخول إلى لوحة التحكم CMS</span>
                <Layers className="w-4 h-4 text-amber-400" />
              </button>
            )}

            {/* Mobile Member Link */}
            {isMember && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsMemberPortalOpen(true);
                }}
                className="text-right px-3 py-2 text-sm text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/40 rounded-lg mt-2 flex items-center justify-between"
              >
                <span>بوابة العضو / حسابي</span>
                <ShieldCheck className="w-4 h-4" />
              </button>
            )}

            {/* Logout on mobile */}
            {!isGuest && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-right px-3 py-2 text-xs text-rose-400 hover:bg-stone-800 rounded-lg mt-1 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 rotate-180" />
                <span>تسجيل الخروج ({currentUser.name})</span>
              </button>
            )}

            {/* Guest Login on mobile */}
            {isGuest && (
              <div className="pt-2 border-t border-stone-800 flex gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsLoginModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-amber-400 text-stone-950 font-bold text-xs rounded-xl text-center"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsJoinModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-stone-800 text-stone-200 text-xs rounded-xl text-center border border-stone-700"
                >
                  طلب انضمام
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
