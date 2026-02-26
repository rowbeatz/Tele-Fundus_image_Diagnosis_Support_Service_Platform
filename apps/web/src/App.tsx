import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { MainLayout } from './components/layout/MainLayout'
import Login from './pages/Login'
import Uploads from './pages/ClientPortal/Uploads'
import DiagnosticViewer from './pages/Viewer/DiagnosticViewer'
import TaskBoard from './pages/Operator/TaskBoard'
import BillingDashboard from './pages/Admin/BillingDashboard'

// Placeholder for Dashboard
function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <div className="panel">
        <p>Welcome to the Tele-Fundus platform.</p>
      </div>
    </div>
  )
}

function App() {
  return (
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
            {/* Additional routes will be added per module */}
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
