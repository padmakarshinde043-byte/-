import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { Header } from './components/Header';
import { ApplicationForm } from './components/ApplicationForm';
import { Footer } from './components/Footer';
import { NoticeModal } from './components/NoticeModal';
import { SuccessReceiptModal } from './components/SuccessReceiptModal';
import { FormPrintReplica } from './components/FormPrintReplica';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ApplicationFormData, AdminUser } from './types/index';
import { auth } from './utils/firebase';
import { googleSignOut, isAllowedAdminEmail } from './utils/googleSheets';

export default function App() {
  const [currentView, setCurrentView] = useState<'form' | 'admin'>('form');
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [submittedApp, setSubmittedApp] = useState<ApplicationFormData | null>(null);
  const [viewingReplicaApp, setViewingReplicaApp] = useState<ApplicationFormData | null>(null);

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('mss_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.emailVerified && isAllowedAdminEmail(fbUser.email)) {
        const userObj: AdminUser = {
          username: fbUser.email || 'admin',
          name:
            fbUser.displayName || 'धनंजय पाटील - केंद्रीय कार्यालयीन सचिव',
          role: 'Admin',
        };
        setAdminUser(userObj);
        try {
          sessionStorage.setItem('mss_admin_session', JSON.stringify(userObj));
        } catch {
          // Ignore storage error
        }
      } else {
        setAdminUser(null);
        try {
          sessionStorage.removeItem('mss_admin_session');
        } catch {
          // Ignore storage error
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [currentView]);

  const handleFormSubmitSuccess = (application: ApplicationFormData) => {
    setSubmittedApp(application);
    setShowSuccessModal(true);
  };

  const handleLoginSuccess = (user: AdminUser) => {
    setAdminUser(user);
    try {
      sessionStorage.setItem('mss_admin_session', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setCurrentView('admin');
  };

  const handleAdminLogout = async () => {
    await googleSignOut();
    setAdminUser(null);
    try {
      sessionStorage.removeItem('mss_admin_session');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('form');
  };

  const handleAdminButtonClick = () => {
    if (adminUser) {
      setCurrentView('admin');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-[#f2f7fc] text-slate-900 font-noto">
        {currentView === 'admin' && adminUser ? (
          <AdminDashboard
            user={adminUser}
            onLogout={handleAdminLogout}
            onBackToForm={() => setCurrentView('form')}
          />
        ) : (
          <>
            <Header onOpenNoticeModal={() => setShowNoticeModal(true)} />

            <main className="flex-1">
              <ApplicationForm onSubmitSuccess={handleFormSubmitSuccess} />
            </main>

            <Footer
              onAdminClick={handleAdminButtonClick}
              isAdminLoggedIn={!!adminUser}
              onGoToDashboard={() => setCurrentView('admin')}
            />
          </>
        )}

        <NoticeModal
          isOpen={showNoticeModal}
          onClose={() => setShowNoticeModal(false)}
        />

        <AdminLoginModal
          isOpen={showAdminLoginModal}
          onClose={() => setShowAdminLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {showSuccessModal && submittedApp && (
          <SuccessReceiptModal
            application={submittedApp}
            onClose={() => setShowSuccessModal(false)}
            onViewReplica={() => {
              setShowSuccessModal(false);
              setViewingReplicaApp(submittedApp);
            }}
            onNewApplication={() => {
              setShowSuccessModal(false);
              setSubmittedApp(null);
            }}
          />
        )}

        {viewingReplicaApp && (
          <FormPrintReplica
            application={viewingReplicaApp}
            onClose={() => setViewingReplicaApp(null)}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
