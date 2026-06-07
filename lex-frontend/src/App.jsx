import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext.jsx"
import { useAuthContext } from "./context/useAuthContext.js"
import { SessionProvider } from "./context/SessionContext.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import LoginPage from "./pages/LoginPage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import DashboardPage from "./pages/DashboardPage.jsx"
import SituationPage from "./pages/SituationPage.jsx"
import DocumentPage from "./pages/DocumentPage.jsx"
import RightsPage from "./pages/RightsPage.jsx"
import DeadlinesPage from "./pages/DeadlinesPage.jsx"
import CounselPage from "./pages/CounselPage.jsx"
import SignalPage from "./pages/SignalPage.jsx"
import TimelinePage from "./pages/TimelinePage.jsx"
import CourtPrepPage from "./pages/CourtPrepPage.jsx"
import HealthCheckPage from "./pages/HealthCheckPage.jsx"
import LibraryPage from "./pages/LibraryPage.jsx"
import ArticlePage from "./pages/ArticlePage.jsx"
import AlertsPage from "./pages/AlertsPage.jsx"

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4]">
        <div className="w-6 h-6 border-2 border-[#2D5BE3] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  return user ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuthContext()
  if (loading) return null
  return user ? <Navigate to="/dashboard" replace /> : children
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/situation/:sessionId" element={<ProtectedRoute><SituationPage /></ProtectedRoute>} />
    <Route path="/document/:sessionId" element={<ProtectedRoute><DocumentPage /></ProtectedRoute>} />
    <Route path="/rights/:sessionId" element={<ProtectedRoute><RightsPage /></ProtectedRoute>} />
    <Route path="/deadlines/:sessionId" element={<ProtectedRoute><DeadlinesPage /></ProtectedRoute>} />
    <Route path="/counsel/:sessionId" element={<ProtectedRoute><CounselPage /></ProtectedRoute>} />
    <Route path="/signal/:sessionId" element={<ProtectedRoute><SignalPage /></ProtectedRoute>} />
    <Route path="/timeline/:sessionId" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
    <Route path="/court-prep/:sessionId" element={<ProtectedRoute><CourtPrepPage /></ProtectedRoute>} />
    <Route path="/health-check" element={<ProtectedRoute><HealthCheckPage /></ProtectedRoute>} />
    <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
    <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
    <Route path="/library/:articleId" element={<ProtectedRoute><ArticlePage /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SessionProvider>
          <AppRoutes />
        </SessionProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
