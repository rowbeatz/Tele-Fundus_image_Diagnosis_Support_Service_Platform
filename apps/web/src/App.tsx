import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { BrandProvider } from './contexts/BrandContext'
import { LanguageProvider } from './lib/i18n'
import { FontSizeProvider } from './contexts/FontSizeContext'
import { TabProvider } from './contexts/TabContext'
import { MainLayout } from './components/layout/MainLayout'
import Login from './pages/Login'
import Uploads from './pages/ClientPortal/Uploads'
import DiagnosticViewer from './pages/Viewer/DiagnosticViewer'
import TaskBoard from './pages/Operator/TaskBoard'
import BillingDashboard from './pages/Admin/BillingDashboard'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/Admin/UserManagement'
import RolePermissions from './pages/Admin/RolePermissions'
import ImageGovernance from './pages/Admin/ImageGovernance'
import BrandSettings from './pages/Admin/BrandSettings'

function App() {
  return (
    <LanguageProvider>
      <FontSizeProvider>
        <BrandProvider>
          <AuthProvider>
            <BrowserRouter>
              <TabProvider>
                <Routes>
                  <Route path="/login" element={<Login />} />

                  <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/uploads" element={<Uploads />} />
                    <Route path="/viewer/:screeningId" element={<DiagnosticViewer />} />
                    <Route path="/ops/tasks" element={<TaskBoard />} />
                    <Route path="/admin/billing" element={<BillingDashboard />} />
                    {/* Admin Pages */}
                    <Route path="/admin/users" element={<UserManagement />} />
                    <Route path="/admin/roles" element={<RolePermissions />} />
                    <Route path="/admin/image-governance" element={<ImageGovernance />} />
                    <Route path="/admin/brand" element={<BrandSettings />} />
                    {/* Placeholder routes */}
                    <Route path="/patients" element={<Dashboard />} />
                    <Route path="/readings" element={<Dashboard />} />
                    <Route path="/ops/qc" element={<TaskBoard />} />
                    <Route path="/admin/organizations" element={<Dashboard />} />
                    <Route path="/admin/settings" element={<Dashboard />} />
                  </Route>

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </TabProvider>
            </BrowserRouter>
          </AuthProvider>
        </BrandProvider>
      </FontSizeProvider>
    </LanguageProvider>
  )
}

export default App
