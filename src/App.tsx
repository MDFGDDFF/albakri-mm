import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginModal } from './components/auth/LoginModal';
import { JoinRequestModal } from './components/auth/JoinRequestModal';
import { MemberPortalModal } from './components/views/MemberPortalModal';

import { HomeView } from './components/views/HomeView';
import { FamilyTreeView } from './components/views/FamilyTreeView';
import { DirectoryView } from './components/views/DirectoryView';
import { NewsView } from './components/views/NewsView';
import { EventsView } from './components/views/EventsView';
import { MediaView } from './components/views/MediaView';
import { DocumentsView } from './components/views/DocumentsView';
import { FamilyFundView } from './components/views/FamilyFundView';
import { CustomPageView } from './components/views/CustomPageView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AlertCircle, Wrench } from 'lucide-react';

function AppContent() {
  const { activeView, data, currentRole, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center text-stone-200 space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></div>
        <p className="text-sm font-heading font-semibold text-amber-400">جاري تحميل منظومة {data.settings.familyName}...</p>
      </div>
    );
  }

  // Maintenance mode screen for regular non-admin users
  const isMaintenance = data.settings.maintenanceMode && currentRole?.code !== 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Maintenance alert strip for admin */}
      {data.settings.maintenanceMode && currentRole?.code === 'admin' && (
        <div className="bg-amber-500 text-stone-950 py-1.5 px-4 text-center text-xs font-bold flex items-center justify-center gap-2">
          <Wrench className="w-4 h-4" />
          <span>وضع الصيانة مفعّل حالياً (الزوار يشاهدون صفحة الصيانة بينما أنت تتصفح بصفتك مديراً للنظام)</span>
        </div>
      )}

      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {isMaintenance ? (
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center max-w-xl mx-auto my-16 space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Wrench className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-stone-100">الموقع قيد الصيانة والتحديث</h2>
            <p className="text-xs text-stone-400 leading-relaxed">
              {data.settings.maintenanceMessage || 'الموقع قيد التحديث الدوري لخدمة أبناء العائلة بشكل أفضل. نعود إليكم قريبًا بإذن الله.'}
            </p>
          </div>
        ) : (
          <>
            {activeView === 'home' && <HomeView />}
            {activeView === 'tree' && <FamilyTreeView />}
            {activeView === 'directory' && <DirectoryView />}
            {activeView === 'news' && <NewsView />}
            {activeView === 'events' && <EventsView />}
            {activeView === 'media' && <MediaView />}
            {activeView === 'archive' && <DocumentsView />}
            {activeView === 'fund' && <FamilyFundView />}
            {activeView === 'page' && <CustomPageView />}
            {activeView === 'admin' && <AdminDashboard />}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Modals */}
      <LoginModal />
      <JoinRequestModal />
      <MemberPortalModal />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
