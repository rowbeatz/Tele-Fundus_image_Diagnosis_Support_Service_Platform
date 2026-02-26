import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTranslation, LanguageToggle } from '../../lib/i18n'
import {
    Eye,
    LayoutDashboard,
    Users,
    Image as ImageIcon,
    CheckSquare,
    Building,
    CreditCard,
    Settings,
    ShieldCheck,
    ChevronLeft
} from 'lucide-react'
import { useState } from 'react'

export function Sidebar() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const [collapsed, setCollapsed] = useState(false)

    const role = user?.role

    type NavItem = { to: string; icon: typeof LayoutDashboard; labelKey: Parameters<typeof t>[0]; roles: string[] }
    const links: NavItem[] = [
        { to: '/dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard', roles: ['client', 'physician', 'operator', 'admin'] },
    ]

    if (role === 'client' || role === 'admin') {
        links.push({ to: '/patients', icon: Users, labelKey: 'nav.patients', roles: ['client', 'admin'] })
        links.push({ to: '/uploads', icon: ImageIcon, labelKey: 'nav.uploads', roles: ['client', 'admin'] })
    }
    if (role === 'physician' || role === 'admin') {
        links.push({ to: '/readings', icon: Eye, labelKey: 'nav.readings', roles: ['physician', 'admin'] })
    }
    if (role === 'operator' || role === 'admin') {
        links.push({ to: '/ops/tasks', icon: CheckSquare, labelKey: 'nav.tasks', roles: ['operator', 'admin'] })
        links.push({ to: '/ops/qc', icon: ShieldCheck, labelKey: 'nav.qc', roles: ['operator', 'admin'] })
    }
    if (role === 'admin') {
        links.push({ to: '/admin/organizations', icon: Building, labelKey: 'nav.organizations', roles: ['admin'] })
        links.push({ to: '/admin/billing', icon: CreditCard, labelKey: 'nav.billing', roles: ['admin'] })
        links.push({ to: '/admin/settings', icon: Settings, labelKey: 'nav.settings', roles: ['admin'] })
    }

    return (
        <aside style={{
            width: collapsed ? 72 : 260,
            background: 'var(--sidebar-bg)',
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            flexShrink: 0,
            transition: 'width 0.2s cubic-bezier(0.4,0,0.2,1)',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Logo */}
            <div style={{
                height: 'var(--header-height)',
                display: 'flex',
                alignItems: 'center',
                padding: collapsed ? '0 22px' : '0 20px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                gap: 10, flexShrink: 0,
            }}>
                <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: 'linear-gradient(135deg, var(--teal-500), var(--teal-700))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                    <Eye style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                {!collapsed && (
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                        {t('app.name')}
                    </span>
                )}
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {links.map((link) => {
                        const Icon = link.icon
                        return (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                style={({ isActive }) => ({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: collapsed ? '10px 22px' : '10px 14px',
                                    borderRadius: 8,
                                    fontSize: '0.866rem',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)',
                                    background: isActive ? 'var(--sidebar-active)' : 'transparent',
                                    borderLeft: isActive ? '3px solid var(--teal-400)' : '3px solid transparent',
                                    textDecoration: 'none',
                                    transition: 'all 0.15s ease',
                                    whiteSpace: 'nowrap',
                                })}
                            >
                                <Icon style={{ width: 20, height: 20, flexShrink: 0 }} />
                                {!collapsed && t(link.labelKey)}
                            </NavLink>
                        )
                    })}
                </div>
            </nav>

            {/* Footer */}
            <div style={{
                padding: collapsed ? '12px 8px' : '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
            }}>
                {!collapsed && <LanguageToggle />}
                {!collapsed && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--sidebar-text)', opacity: 0.5 }}>
                        {t('app.version')}
                    </span>
                )}
            </div>

            {/* Collapse toggle */}
            <button
                onClick={() => setCollapsed(c => !c)}
                style={{
                    position: 'absolute', top: 20, right: -12,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--sidebar-bg)', border: '2px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 10,
                    transform: collapsed ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                }}
            >
                <ChevronLeft style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
            </button>
        </aside>
    )
}
