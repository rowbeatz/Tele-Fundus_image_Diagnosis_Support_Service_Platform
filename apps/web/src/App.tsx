import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './lib/i18n'
import { MainLayout } from './components/layout/MainLayout'
import Login from './pages/Login'
import Uploads from './pages/ClientPortal/Uploads'
import DiagnosticViewer from './pages/Viewer/DiagnosticViewer'
import TaskBoard from './pages/Operator/TaskBoard'
import BillingDashboard from './pages/Admin/BillingDashboard'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<MainLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/uploads" element={<Uploads />} />
              <Route path="/viewer/:screeningId" element={<DiagnosticViewer />} />
              <Route path="/ops/tasks" element={<TaskBoard />} />
              <Route path="/admin/billing" element={<BillingDashboard />} />
              {/* Additional routes */}
              <Route path="/patients" element={<Dashboard />} />
              <Route path="/readings" element={<Dashboard />} />
              <Route path="/ops/qc" element={<TaskBoard />} />
              <Route path="/admin/organizations" element={<Dashboard />} />
              <Route path="/admin/settings" element={<Dashboard />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
