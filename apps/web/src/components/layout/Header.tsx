import { useAuth } from '../../contexts/AuthContext'
import { useBrand } from '../../contexts/BrandContext'
import { useTranslation, LanguageToggle } from '../../lib/i18n'
import { Bell, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface HeaderProps {
    onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
    const { user, logout } = useAuth()
    const { brand } = useBrand()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const roleBadgeColor: Record<string, string> = {
        admin: '#ef4444',
        operator: '#f59e0b',
        physician: '#3b82f6',
        client: '#10b981',
    }

    const roleLabels: Record<string, string> = {
        admin: 'Admin',
        operator: 'Operator',
        physician: 'Physician',
        client: 'Client',
    }

    return (
        <header className="header">
            <div className="header-left">
                {/* Hamburger — visible on tablet/mobile only */}
                <button className="hamburger-btn" onClick={onMenuToggle}>
                    <Menu style={{ width: 22, height: 22 }} />
                </button>

                <span className="header-brand">{brand.platformName}</span>
                {user?.role && (
                    <span className="header-role-badge" style={{ background: roleBadgeColor[user.role] || '#6b7280' }}>
                        {roleLabels[user.role] || user.role}
                    </span>
                )}
            </div>

            <div className="header-actions">
                <LanguageToggle />

                <button className="header-icon-btn" style={{ position: 'relative' }}>
                    <Bell style={{ width: 20, height: 20 }} />
                    <span className="notification-dot">3</span>
                </button>

                <div className="header-user">
                    <div className="avatar" style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'var(--primary)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700,
                    }}>
                        {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
                    </div>
                    <span className="header-username">{user?.fullName}</span>
                </div>

                <button className="header-icon-btn" onClick={handleLogout} title={t('auth.signout')}>
                    <LogOut style={{ width: 18, height: 18 }} />
                </button>
            </div>
        </header>
    )
}
