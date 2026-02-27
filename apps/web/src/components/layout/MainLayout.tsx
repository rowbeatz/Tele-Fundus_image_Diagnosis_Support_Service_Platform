import { useState, useCallback } from 'react'
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation } from '../../lib/i18n'
import { useTabs } from '../../contexts/TabContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ChatPanel } from '../communication/ChatPanel'
import { X, Pin, MessageSquare } from 'lucide-react'

// Detect if on the viewer page (which has its own inline chat)
const isViewerPath = (path: string) => path.startsWith('/viewer/')

// Map paths to translation keys for tab titles
const pathToTitleKey: Record<string, string> = {
    '/dashboard': 'nav.dashboard',
    '/patients': 'nav.patients',
    '/uploads': 'nav.uploads',
    '/readings': 'nav.readings',
    '/ops/tasks': 'nav.tasks',
    '/ops/qc': 'nav.qc',
    '/admin/organizations': 'nav.organizations',
    '/admin/billing': 'nav.billing',
    '/admin/settings': 'nav.settings',
    '/admin/users': 'nav.users',
    '/admin/roles': 'nav.roles',
    '/admin/image-governance': 'nav.image_governance',
    '/admin/brand': 'nav.brand',
}

export function MainLayout() {
    const { user, isLoading } = useAuth()
    const { t } = useTranslation()
    const location = useLocation()
    const navigate = useNavigate()
    const { tabs, activeTabId, openTab, closeTab, switchTab } = useTabs()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [chatOpen, setChatOpen] = useState(false)

    const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), [])
    const closeSidebar = useCallback(() => setSidebarOpen(false), [])
    const toggleChat = useCallback(() => setChatOpen(p => !p), [])
    const closeChat = useCallback(() => setChatOpen(false), [])

    // Pin current page as a tab
    const pinCurrentPage = () => {
        const path = location.pathname
        const titleKey = pathToTitleKey[path]
        if (titleKey) {
            openTab({ title: t(titleKey as any), path, pinned: true })
        }
    }

    // Navigate when switching tabs
    const handleTabClick = (tabId: string) => {
        const tab = tabs.find(t => t.id === tabId)
        if (tab) {
            switchTab(tabId)
            navigate(tab.path)
        }
    }

    const handleTabClose = (e: React.MouseEvent, tabId: string) => {
        e.stopPropagation()
        const tab = tabs.find(t => t.id === tabId)
        closeTab(tabId)
        if (tab && activeTabId === tabId) {
            const remaining = tabs.filter(t => t.id !== tabId)
            if (remaining.length > 0) {
                navigate(remaining[remaining.length - 1].path)
            }
        }
    }

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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
                onClick={closeSidebar}
            />
            <Sidebar open={sidebarOpen} onClose={closeSidebar} />

            <div className="layout-content" style={{ flex: 1, minWidth: 0 }}>
                <Header onMenuToggle={toggleSidebar} />

                {/* Tab Bar — only shows pinned tabs (hidden on viewer) */}
                {!isViewerPath(location.pathname) && (
                    <div className="tab-bar">
                        <div className="tab-bar-inner">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    className={`tab-item ${activeTabId === tab.id ? 'active' : ''}`}
                                    onClick={() => handleTabClick(tab.id)}
                                >
                                    <span className={`tab-pin pinned`} title="Pinned">
                                        <Pin style={{ width: 10, height: 10 }} />
                                    </span>
                                    <span className="tab-title">{tab.title}</span>
                                    <span
                                        className="tab-close"
                                        onClick={(e) => handleTabClose(e, tab.id)}
                                    >
                                        <X style={{ width: 12, height: 12 }} />
                                    </span>
                                </button>
                            ))}
                            {/* Pin current page button */}
                            <button
                                className="tab-item"
                                onClick={pinCurrentPage}
                                style={{ opacity: 0.5, fontSize: '0.75rem' }}
                                title="Pin this page"
                            >
                                <Pin style={{ width: 12, height: 12 }} />
                                <span style={{ fontSize: '0.7rem' }}>Pin</span>
                            </button>
                        </div>
                    </div>
                )}

                {isViewerPath(location.pathname) ? (
                    /* Viewer: fullscreen, no scroll, no padding */
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <Outlet />
                    </div>
                ) : (
                    <main style={{
                        flex: 1, overflowY: 'auto', padding: '24px 28px',
                        scrollBehavior: 'smooth',
                    }}>
                        <div style={{ maxWidth: 1280, margin: '0 auto' }} className="animate-page-in">
                            <Outlet />
                        </div>
                    </main>
                )}
            </div>

            {/* Chat Panel — flex sidebar, not overlay (hidden on viewer pages) */}
            {!isViewerPath(location.pathname) && (
                <ChatPanel open={chatOpen} onClose={closeChat} />
            )}

            {/* Interactive Chat Edge Handle (hidden on viewer pages) */}
            {!isViewerPath(location.pathname) && (
                <div
                    className={`chat-edge-handle ${chatOpen ? 'open' : ''}`}
                    onClick={toggleChat}
                    title={chatOpen ? t('chat.close' as any) : t('chat.title' as any)}
                >
                    <div className="handle-content">
                        <MessageSquare className="handle-icon" />
                        {!chatOpen && <span className="handle-dot" />}
                    </div>
                </div>
            )}
        </div>
    )
}
