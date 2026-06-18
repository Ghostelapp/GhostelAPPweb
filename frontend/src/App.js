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
              <Route path="/" element={<Landing />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/delete-account" element={<DeleteAccount />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/account" element={<Account />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
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
