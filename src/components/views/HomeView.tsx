import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GitFork, 
  Users, 
  Newspaper, 
  Calendar, 
  ShieldCheck, 
  Coins, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  FileText,
  Sparkles,
  ChevronLeft,
  Building,
  CheckCircle
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { data, setActiveView, can, setIsJoinModalOpen, rsvpEvent, currentUser } = useApp();

  const enabledSections = [...data.sections]
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order);

  // Statistics
  const totalMembers = data.members.filter(m => !m.isDeleted).length;
  const livingMembers = data.members.filter(m => !m.isDeleted && m.isAlive).length;
  const totalBranches = data.branches.length;
  const totalDocs = data.documents.filter(d => !d.isDeleted).length;
  const upcomingEvents = data.events.filter(e => !e.isDeleted && e.status === 'upcoming');
  const recentNews = data.news.filter(n => !n.isDeleted && n.status === 'published').slice(0, 3);
  const featuredMedia = data.albums.filter(a => !a.isDeleted).slice(0, 2);

  // Treasury stats
  const totalIncome = data.transactions
    .filter(t => !t.isDeleted && t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = data.transactions
    .filter(t => !t.isDeleted && t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpense;

  return (
    <div className="space-y-16">
      
      {/* Dynamic Sections Loop */}
      {enabledSections.map((sec) => {

        // 1. HERO SECTION
        if (sec.sectionKey === 'hero') {
          return (
            <section key={sec.id} className="relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-900 text-stone-100 shadow-2xl">
              {/* Background with measured contrast scrim */}
              <div className="absolute inset-0 z-0">
                <img
                  src={data.settings.heroImageUrl || '/src/assets/images/isdud_panoramic_heritage_1793007031421.jpg'}
                  alt="بلدة إسدود التاريخية في فلسطين - موطن عائلة البكري والبقري الأصلي"
                  className="w-full h-full object-cover object-center filter brightness-50 contrast-105 scale-100 hover:scale-102 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/70 to-stone-900/30"></div>
                <div className="absolute inset-0 bg-radial from-transparent via-stone-950/40 to-stone-950/80"></div>
              </div>

              {/* Content Box */}
              <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 sm:py-28 text-center flex flex-col items-center">
                
                {/* Emblem */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-amber-400/50 shadow-2xl overflow-hidden bg-stone-950/80 mb-6 p-1 backdrop-blur-md">
                  <img
                    src={data.settings.logoUrl || '/family_logo.png'}
                    alt="شعار عائلة البكري والبقري"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                    الموقع والمنظومة الرسمية الموحدة
                  </span>
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-heading text-stone-100 tracking-tight leading-tight">
                    {data.settings.siteTitle || 'بوابة عائلة البكري الرسمية'}
                  </h1>
                </div>

                <p className="text-base sm:text-xl font-heritage text-amber-200/90 max-w-2xl mb-6">
                  "{data.settings.motto || 'أصالة النسب، وبرّ الأرحام، وتلاحم الأجيال'}"
                </p>

                <p className="text-sm sm:text-base text-stone-300 max-w-3xl leading-relaxed mb-10">
                  {data.settings.welcomeMessage}
                </p>

                {/* Primary CTA buttons */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => setActiveView('tree')}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <GitFork className="w-4 h-4" />
                    <span>استكشاف شجرة النسب التفاعلية</span>
                  </button>

                  <button
                    onClick={() => setActiveView('directory')}
                    className="px-6 py-3 bg-stone-850/90 hover:bg-stone-800 text-stone-100 border border-stone-700 font-medium text-sm rounded-xl transition-all backdrop-blur-md flex items-center gap-2 cursor-pointer"
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>دليل أفراد العائلة</span>
                  </button>

                  <button
                    onClick={() => setIsJoinModalOpen(true)}
                    className="px-5 py-3 text-amber-300 hover:text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>طلب انضمام لعضو جديد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* CMS Quick edit shortcut if admin */}
                {can('cms', 'manageSections') && (
                  <button
                    onClick={() => setActiveView('admin')}
                    className="mt-8 text-[11px] text-stone-400 hover:text-amber-300 flex items-center gap-1.5 bg-stone-950/60 px-3 py-1 rounded-full border border-stone-800"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>تعديل نصوص وصور الواجهة من لوحة التحكم</span>
                  </button>
                )}
              </div>
            </section>
          );
        }

        // 2. QUICK STATS STRIP
        if (sec.sectionKey === 'stats') {
          return (
            <section key={sec.id} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-6 text-right space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-medium">الأفراد المسجلون</span>
                  <Users className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-stone-100">
                  {totalMembers}
                </div>
                <div className="text-[11px] text-stone-500">
                  <span>{livingMembers} فرد على قيد الحياة</span>
                  <span className="mx-1">·</span>
                  <span>5 أجيال موثقة</span>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-6 text-right space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-medium">الفروع الكبرى</span>
                  <Building className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-stone-100">
                  {totalBranches}
                </div>
                <div className="text-[11px] text-stone-500">
                  <span>الرياض · الحجاز · القصيم · الشرقية · حائل</span>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-6 text-right space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-medium">الوثائق التاريخية</span>
                  <FileText className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-stone-100">
                  {totalDocs}
                </div>
                <div className="text-[11px] text-stone-500">
                  <span>صكوك أوقاف ومشجرات معتمدة شرعاً</span>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800/80 rounded-2xl p-6 text-right space-y-1 shadow-sm">
                <div className="flex items-center justify-between text-stone-400 mb-2">
                  <span className="text-xs font-medium">اللقاءات والمناسبات</span>
                  <Calendar className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-3xl font-bold font-mono tabular-nums text-stone-100">
                  {upcomingEvents.length}
                </div>
                <div className="text-[11px] text-stone-500">
                  <span>مناسبات قادمة لصلة الرحم واللقاء السنوي</span>
                </div>
              </div>
            </section>
          );
        }

        // 3. ABOUT & HISTORICAL OVERVIEW
        if (sec.sectionKey === 'about') {
          return (
            <section key={sec.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-stone-900 border border-stone-800 rounded-3xl p-8 sm:p-12">
              <div className="lg:col-span-7 space-y-6 text-right">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    {sec.subtitle || 'أصالة النسب ومسيرة الأجداد'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
                    {sec.title || 'نبذة عن عائلة البكري وتاريخها العريق'}
                  </h2>
                </div>

                <p className="text-sm text-stone-300 leading-relaxed font-normal">
                  {data.settings.aboutText}
                </p>

                <p className="text-sm text-stone-400 leading-relaxed font-normal">
                  {data.settings.historicalOverview}
                </p>

                <div className="pt-2 flex items-center gap-4">
                  <button
                    onClick={() => setActiveView('archive')}
                    className="px-5 py-2.5 bg-stone-800 hover:bg-stone-750 text-amber-300 border border-stone-700 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>تصفح وثائق النسب والأرشيف التاريخي</span>
                  </button>

                  <button
                    onClick={() => setActiveView('page', 'family-charter')}
                    className="text-xs text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    قراءة ميثاق الأسرة ولائحة الصندوق ←
                  </button>
                </div>
              </div>

              {/* Archival Manuscript Showcase */}
              <div className="lg:col-span-5 relative group">
                <div className="overflow-hidden rounded-2xl border border-stone-750 shadow-xl bg-stone-950 aspect-[4/3]">
                  <img
                    src="/src/assets/images/isdud_historic_document_1793007087282.jpg"
                    alt="طابو أرض إسدود - فلسطين ومفتاح العودة التاريخي"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700"
                  />
                </div>
                <p className="text-[11px] text-stone-500 italic mt-2.5 text-center">
                  طابو أرض إسدود التاريخي لسلالة عائلة البكري والبقري ومفتاح العودة المحفوظ جيلاً بعد جيل
                </p>
              </div>
            </section>
          );
        }

        // 4. BRANCHES SHOWCASE
        if (sec.sectionKey === 'branches') {
          return (
            <section key={sec.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-right">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    {sec.subtitle || 'امتداد الأسرة وتنوع حواضرها'}
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-stone-100 mt-1">
                    {sec.title || 'فروع عائلة البكري'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('directory')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>عرض جميع الأفراد بحسب الفروع</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.branches.map((branch) => {
                  const branchMembers = data.members.filter(m => !m.isDeleted && m.branchId === branch.id);

                  return (
                    <div
                      key={branch.id}
                      className="bg-stone-900 border border-stone-800 hover:border-amber-500/40 rounded-2xl p-6 text-right space-y-4 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-400">{branch.city}</span>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: branch.colorHex || '#047857' }}
                        />
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-base text-stone-100 group-hover:text-amber-400 transition-colors">
                          {branch.name}
                        </h3>
                        <p className="text-xs text-stone-400 mt-1">
                          عميد الفرع: {branch.leaderName}
                        </p>
                      </div>

                      <p className="text-xs text-stone-400 leading-relaxed line-clamp-2">
                        {branch.description}
                      </p>

                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                        <span className="font-mono tabular-nums">{branchMembers.length} أفراد مسجلين</span>
                        <button
                          onClick={() => setActiveView('directory')}
                          className="text-amber-400 hover:text-amber-300 font-medium text-[11px]"
                        >
                          تصفح الأعضاء ←
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        // 5. LATEST NEWS & ANNOUNCEMENTS
        if (sec.sectionKey === 'news') {
          return (
            <section key={sec.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-right">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    {sec.subtitle || 'أخبار، تهاني، وتكريم'}
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-stone-100 mt-1">
                    {sec.title || 'أحدث الأخبار والإعلانات'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('news')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>عرض جميع الأخبار والأرشيف</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recentNews.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => setActiveView('news')}
                    className="bg-stone-900 border border-stone-800 hover:border-stone-700 rounded-2xl overflow-hidden text-right flex flex-col group cursor-pointer transition-all duration-200"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-stone-950 relative">
                      <img
                        src={item.coverImageUrl || '/src/assets/images/isdud_old_village_1793007072701.jpg'}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        {/* Zero-Pill unboxed metadata text */}
                        <div className="flex items-center gap-2 text-xs text-amber-400/90 mb-2">
                          <span>{item.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-stone-400">{item.publishDate}</span>
                          {item.isMembersOnly && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-amber-500 font-semibold">خاص بالأعضاء</span>
                            </>
                          )}
                        </div>

                        <h3 className="font-heading font-bold text-base text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                          {item.title}
                        </h3>

                        <p className="text-xs text-stone-400 mt-2 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                        <span>{item.authorName}</span>
                        <span className="text-amber-400 group-hover:underline text-[11px]">
                          قراءة الخبر كاملًا
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        }

        // 6. UPCOMING EVENTS
        if (sec.sectionKey === 'events') {
          return (
            <section key={sec.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-right">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    {sec.subtitle || 'صلة الرحم والاجتماعات'}
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-stone-100 mt-1">
                    {sec.title || 'المناسبات واللقاءات القادمة'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('events')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>تقويم الفعاليات الكامل</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {upcomingEvents.slice(0, 2).map((evt) => {
                  const isAttending = evt.attendees?.includes(currentUser.name);

                  return (
                    <div
                      key={evt.id}
                      className="bg-stone-900 border border-stone-800 rounded-2xl p-6 text-right flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-400 font-semibold">{evt.type}</span>
                          <span className="text-stone-400 font-mono tabular-nums">{evt.date}</span>
                        </div>

                        <h3 className="font-heading font-bold text-lg text-stone-100">
                          {evt.title}
                        </h3>

                        <p className="text-xs text-stone-400 leading-relaxed">
                          {evt.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-300 pt-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-stone-500" />
                            <span>{evt.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-stone-500" />
                            <span className="truncate">{evt.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-800 flex items-center justify-between">
                        <div className="text-xs text-stone-400 font-mono tabular-nums">
                          <span>{evt.rsvpCount || 0} مؤكد حضورهم</span>
                        </div>

                        <button
                          onClick={() => rsvpEvent(evt.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isAttending
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                          }`}
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{isAttending ? 'حضورك مؤكد (اضغط للإلغاء)' : 'تأكيد الحضور'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }

        // 7. MEDIA GALLERY HIGHLIGHTS
        if (sec.sectionKey === 'media') {
          return (
            <section key={sec.id} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-right">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                    {sec.subtitle || 'الأرشيف المصور'}
                  </span>
                  <h2 className="text-2xl font-heading font-bold text-stone-100 mt-1">
                    {sec.title || 'المعرض التراثي والمصور'}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveView('media')}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 self-start sm:self-auto"
                >
                  <span>مشاهدة كافة الألبومات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {featuredMedia.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => setActiveView('media')}
                    className="group cursor-pointer rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 text-right"
                  >
                    <div className="aspect-[16/9] overflow-hidden bg-stone-950 relative">
                      <img
                        src={album.coverImageUrl || '/src/assets/images/isdud_panoramic_heritage_1793007031421.jpg'}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 right-4 left-4">
                        <span className="text-xs text-amber-400 font-medium">{album.category}</span>
                        <h3 className="font-heading font-bold text-base text-stone-100 mt-1">
                          {album.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between text-xs text-stone-400">
                      <span>{album.items.length} صورة ووثيقة</span>
                      <span className="text-amber-400">فتح الألبوم ←</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }

        // 8. FAMILY FUND HIGHLIGHT
        if (sec.sectionKey === 'fund_highlight' && data.settings.enableFund) {
          return (
            <section key={sec.id} className="rounded-3xl border border-stone-800 bg-gradient-to-br from-stone-900 to-stone-950 p-8 sm:p-12 text-right relative overflow-hidden">
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Coins className="w-4 h-4" />
                  <span>{sec.subtitle || 'التكافل والتراحم الأسري'}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-stone-100">
                  {sec.title || 'صندوق عائلة البكري التكافلي'}
                </h2>

                <p className="text-sm text-stone-300 leading-relaxed">
                  أنشئ الصندوق للمساهمة في تفريج الكربات، وإعانة الشباب والفتيات على الزواج، وتقديم المنح التعليمية للمتميزين، ورعاية الأرامل والأيتام من أبناء العائلة وفق ضوابط شرعية ومحاسبية صارمة.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 pb-2">
                  <div className="bg-stone-850/80 p-4 rounded-xl border border-stone-750">
                    <span className="text-xs text-stone-400 block mb-1">الرصيد المتاح</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                      {currentBalance.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="bg-stone-850/80 p-4 rounded-xl border border-stone-750">
                    <span className="text-xs text-stone-400 block mb-1">إجمالي الإيرادات</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-stone-200">
                      {totalIncome.toLocaleString()} ر.س
                    </span>
                  </div>
                  <div className="bg-stone-850/80 p-4 rounded-xl border border-stone-750 col-span-2 sm:col-span-1">
                    <span className="text-xs text-stone-400 block mb-1">إجمالي المصروفات</span>
                    <span className="text-xl font-bold font-mono tabular-nums text-stone-200">
                      {totalExpense.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-4">
                  <button
                    onClick={() => setActiveView('fund')}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer"
                  >
                    <span>الدخول لبوابة الصندوق والتقارير المالية</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] text-stone-500">
                    تخضع السجلات للتدقيق المالي الفصلي
                  </span>
                </div>
              </div>
            </section>
          );
        }

        return null;
      })}

    </div>
  );
};
