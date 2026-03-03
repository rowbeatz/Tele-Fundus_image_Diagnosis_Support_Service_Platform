import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { BrandProvider } from './contexts/BrandContext'
import { LanguageProvider } from './lib/i18n'
import { FontSizeProvider } from './contexts/FontSizeContext'
import { TabProvider } from './contexts/TabContext'
import { ToastProvider } from './components/ui/ToastNotification'
import { MainLayout } from './components/layout/MainLayout'
import Login from './pages/Login'
import Uploads from './pages/ClientPortal/Uploads'
import DiagnosticViewer from './pages/Viewer/DiagnosticViewer'
import TaskBoard from './pages/Operator/TaskBoard'
import QualityControl from './pages/Operator/QualityControl'
import BillingDashboard from './pages/Admin/BillingDashboard'
import Dashboard from './pages/Dashboard'
import UserManagement from './pages/Admin/UserManagement'
import RolePermissions from './pages/Admin/RolePermissions'
import ImageGovernance from './pages/Admin/ImageGovernance'
import BrandSettings from './pages/Admin/BrandSettings'
import OrganizationManagement from './pages/Admin/OrganizationManagement'
import PlatformSettings from './pages/Admin/PlatformSettings'
import PatientList from './pages/Patient/PatientList'
import PatientDetail from './pages/Patient/PatientDetail'
import PatientRegister from './pages/Patient/PatientRegister'
import ScreeningRegister from './pages/Screening/ScreeningRegister'
import ReadingQueue from './pages/Reading/ReadingQueue'

function App() {
  return (
    <LanguageProvider>
      <FontSizeProvider>
        <BrandProvider>
          <AuthProvider>
            <ToastProvider>
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
                      <Route path="/ops/qc" element={<QualityControl />} />
                      <Route path="/admin/billing" element={<BillingDashboard />} />
                      {/* Admin Pages */}
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/roles" element={<RolePermissions />} />
                      <Route path="/admin/image-governance" element={<ImageGovernance />} />
                      <Route path="/admin/brand" element={<BrandSettings />} />
                      <Route path="/admin/organizations" element={<OrganizationManagement />} />
                      <Route path="/admin/settings" element={<PlatformSettings />} />
                      {/* Patient & Screening */}
                      <Route path="/patients" element={<PatientList />} />
                      <Route path="/patients/new" element={<PatientRegister />} />
                      <Route path="/patients/:id" element={<PatientDetail />} />
                      <Route path="/screenings/new/:patientId" element={<ScreeningRegister />} />
                      {/* Reading */}
                      <Route path="/readings" element={<ReadingQueue />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </TabProvider>
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </BrandProvider>
      </FontSizeProvider>
    </LanguageProvider>
  )
}

export default App

