import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useBrand } from '../../contexts/BrandContext'
import { useTranslation, LanguageToggle } from '../../lib/i18n'
import {
    LayoutDashboard, Users, Upload, Stethoscope, ClipboardList, ShieldCheck,
    Building2, CreditCard, Settings, ChevronDown, ChevronRight,
    UserCog, Lock, ImageIcon, Palette, X,
} from 'lucide-react'
import { useState } from 'react'

const allNav = [
    { key: 'nav.dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['admin', 'operator', 'physician', 'client'] },
    { key: 'nav.patients', icon: Users, path: '/patients', roles: ['admin', 'operator', 'physician'] },
    { key: 'nav.uploads', icon: Upload, path: '/uploads', roles: ['admin', 'operator', 'client'] },
    { key: 'nav.readings', icon: Stethoscope, path: '/readings', roles: ['admin', 'physician'] },
    { key: 'nav.tasks', icon: ClipboardList, path: '/ops/tasks', roles: ['admin', 'operator'] },
    { key: 'nav.qc', icon: ShieldCheck, path: '/ops/qc', roles: ['admin', 'operator'] },
    { key: 'nav.organizations', icon: Building2, path: '/admin/organizations', roles: ['admin'] },
    { key: 'nav.billing', icon: CreditCard, path: '/admin/billing', roles: ['admin'] },
    { key: 'nav.settings', icon: Settings, path: '/admin/settings', roles: ['admin'] },
] as const

const adminSubNav = [
    { key: 'nav.users', icon: UserCog, path: '/admin/users' },
    { key: 'nav.roles', icon: Lock, path: '/admin/roles' },
    { key: 'nav.image_governance', icon: ImageIcon, path: '/admin/image-governance' },
    { key: 'nav.brand', icon: Palette, path: '/admin/brand' },
] as const

interface SidebarProps {
    open: boolean
    onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const { user } = useAuth()
    const { brand } = useBrand()
    const { t } = useTranslation()
    const location = useLocation()
    const [adminOpen, setAdminOpen] = useState(() => location.pathname.startsWith('/admin/'))
    const role = user?.role || 'client'

    const filteredNav = allNav.filter(n => (n.roles as readonly string[]).includes(role))

    const handleNavClick = () => {
        // Close sidebar on mobile after navigation
        onClose()
    }

    return (
        <aside className={`sidebar ${open ? 'open' : ''}`}>
            {/* Close button (mobile only) */}
            <button className="sidebar-close-btn" onClick={onClose}>
                <X style={{ width: 20, height: 20 }} />
            </button>

            {/* Brand */}
            <div className="sidebar-brand">
                <img
                    src={brand.logoUrl}
                    alt={brand.platformName}
                    style={{ width: 32, height: 32, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.85 }}
                />
                <span className="sidebar-brand-text">{brand.platformName}</span>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {filteredNav.map(item => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon className="sidebar-icon" />
                            <span>{t(item.key as any)}</span>
                        </NavLink>
                    )
                })}

                {/* Admin sub-section */}
                {role === 'admin' && (
                    <>
                        <button
                            className={`sidebar-link sidebar-section-toggle ${adminOpen ? 'active' : ''}`}
                            onClick={() => setAdminOpen(p => !p)}
                            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', color: 'inherit', font: 'inherit' }}
                        >
                            <Settings className="sidebar-icon" />
                            <span>{t('nav.admin')}</span>
                            {adminOpen ? <ChevronDown style={{ width: 14, height: 14, marginLeft: 'auto' }} /> : <ChevronRight style={{ width: 14, height: 14, marginLeft: 'auto' }} />}
                        </button>
                        {adminOpen && (
                            <div className="sidebar-sub-nav">
                                {adminSubNav.map(item => {
                                    const Icon = item.icon
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            onClick={handleNavClick}
                                            className={({ isActive }) => `sidebar-link sidebar-sub-link ${isActive ? 'active' : ''}`}
                                        >
                                            <Icon className="sidebar-icon" />
                                            <span>{t(item.key as any)}</span>
                                        </NavLink>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <LanguageToggle />
                <div className="sidebar-version">{t('app.version')}</div>
            </div>
        </aside>
    )
}
