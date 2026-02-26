import { Outlet, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function MainLayout() {
    const { user, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16,
            }}>
                <div style={{
                    width: 40, height: 40,
                    border: '3px solid var(--border)',
                    borderTopColor: 'var(--primary)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <span style={{ fontSize: '0.866rem', color: 'var(--text-muted)' }}>Loading…</span>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
            <Sidebar />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Header />
                <main style={{
                    flex: 1, overflowY: 'auto', padding: '24px 28px',
                    scrollBehavior: 'smooth',
                }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }} className="animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}
