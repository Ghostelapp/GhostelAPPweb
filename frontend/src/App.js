import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Account from "@/pages/Account";
import Privacy from "@/pages/Privacy";
import DeleteAccount from "@/pages/DeleteAccount";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import Status from "@/pages/Status";
import Changelog from "@/pages/Changelog";
import TesterAccess from "@/pages/TesterAccess";
import AdminLayout from "@/pages/AdminLayout";
import Dashboard from "@/pages/admin/Dashboard";
import Users from "@/pages/admin/Users";
import Groups from "@/pages/admin/Groups";
import Moderation from "@/pages/admin/Moderation";
import Notifications from "@/pages/admin/Notifications";
import Support from "@/pages/admin/Support";
import Roles from "@/pages/admin/Roles";
import Settings from "@/pages/admin/Settings";
import Reports from "@/pages/admin/Reports";
import NoAccess from "@/pages/NoAccess";
import WebsiteAnalytics from "@/components/WebsiteAnalytics";
import FloatingSupport from "@/components/FloatingSupport";
import PrivacyConsent from "@/components/PrivacyConsent";
import Seo from "@/components/Seo";
import ScrollToTop from "@/components/ScrollToTop";

const seo = {
  home: {
    title: "ghostel.app | Private encrypted messaging",
    description:
      "Private encrypted conversations, voice calls, push notifications and secure contact management in one app.",
    path: "/",
  },
  privacy: {
    title: "Privacy policy | ghostel.app",
    description:
      "How ghostel.app processes account, device, support and website analytics data.",
    path: "/privacy",
  },
  deleteAccount: {
    title: "Delete account | ghostel.app",
    description:
      "Instructions for deleting your ghostel.app account and related private data.",
    path: "/delete-account",
  },
  terms: {
    title: "Terms | ghostel.app",
    description: "Terms and service rules for ghostel.app.",
    path: "/terms",
  },
  contact: {
    title: "Contact support | ghostel.app",
    description:
      "Contact Ghostel support for account, technical, security or feedback issues.",
    path: "/contact",
  },
  status: {
    title: "System status | ghostel.app",
    description: "Live status for the Ghostel website, mobile API and panel API.",
    path: "/status",
  },
  updates: {
    title: "Build changelog | ghostel.app",
    description: "Public changelog for Ghostel Android, iOS, website and admin panel builds.",
    path: "/updates",
  },
  testers: {
    title: "Ghostel public testing program | Android and iOS",
    description:
      "Join Ghostel public testing on Android and iOS, report bugs and compete for BTC rewards for verified reports.",
    path: "/testers",
  },
  noindex: {
    title: "ghostel.app",
    description: "ghostel.app private area.",
    path: "/",
    robots: "noindex, nofollow",
  },
};

function Page({ meta, children }) {
  return (
    <>
      <Seo {...meta} />
      {children}
    </>
  );
}

function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="text-zinc-400 font-display">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <NoAccess />;
  return children;
}

function App() {
  return (
    <div className="App dark">
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <WebsiteAnalytics />
            <FloatingSupport />
            <ScrollToTop />
            <PrivacyConsent />
            <Toaster
              position="top-right"
              theme="dark"
              toastOptions={{
                style: {
                  background: "rgba(9,9,11,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff",
                  backdropFilter: "blur(20px)",
                },
              }}
            />
            <Routes>
              <Route path="/" element={<Page meta={seo.home}><Landing /></Page>} />
              <Route path="/privacy" element={<Page meta={seo.privacy}><Privacy /></Page>} />
              <Route path="/delete-account" element={<Page meta={seo.deleteAccount}><DeleteAccount /></Page>} />
              <Route path="/terms" element={<Page meta={seo.terms}><Terms /></Page>} />
              <Route path="/contact" element={<Page meta={seo.contact}><Contact /></Page>} />
              <Route path="/status" element={<Page meta={seo.status}><Status /></Page>} />
              <Route path="/updates" element={<Page meta={seo.updates}><Changelog /></Page>} />
              <Route path="/testers" element={<Page meta={seo.testers}><TesterAccess /></Page>} />
              <Route path="/tester-access/ghostel-v1425-join-7k92" element={<Navigate to="/testers" replace />} />
              <Route path="/login" element={<Page meta={seo.noindex}><Login /></Page>} />
              <Route path="/register" element={<Page meta={seo.noindex}><Register /></Page>} />
              <Route path="/account" element={<Page meta={seo.noindex}><Account /></Page>} />
              <Route
                path="/admin"
                element={
                  <Page meta={seo.noindex}>
                    <AdminGuard>
                      <AdminLayout />
                    </AdminGuard>
                  </Page>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="groups" element={<Groups />} />
                <Route path="moderation" element={<Moderation />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="support" element={<Support />} />
                <Route path="roles" element={<Roles />} />
                <Route path="settings" element={<Settings />} />
                <Route path="reports" element={<Reports />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
