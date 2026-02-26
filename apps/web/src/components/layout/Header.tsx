import { useAuth } from '../../contexts/AuthContext'
import { useBrand } from '../../contexts/BrandContext'
import { useTranslation, LanguageToggle } from '../../lib/i18n'
import { useFontSize } from '../../contexts/FontSizeContext'
import { Bell, LogOut, Menu, MessageSquare, Type } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fontSizeTooltips = { small: 'Small text', normal: 'Normal text', large: 'Large text' } as const

interface HeaderProps {
    onMenuToggle: () => void
    onChatToggle: () => void
    chatOpen: boolean
}

export function Header({ onMenuToggle, onChatToggle, chatOpen }: HeaderProps) {
    const { user, logout } = useAuth()
    const { brand } = useBrand()
    const { t } = useTranslation()
    const { fontSize, cycleFontSize } = useFontSize()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const roleBadgeColor: Record<string, string> = {
        admin: '#dc2626',
        operator: '#d97706',
        physician: '#2563eb',
        client: '#059669',
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
                {/* Font Size Toggle */}
                <button
                    className="header-icon-btn font-size-btn"
                    onClick={cycleFontSize}
                    title={fontSizeTooltips[fontSize]}
                    style={{ position: 'relative' }}
                >
                    <Type style={{ width: 18, height: 18 }} />
                    <span className="font-size-indicator">{fontSize[0].toUpperCase()}</span>
                </button>

                <LanguageToggle />

                {/* Chat Toggle */}
                <button
                    className={`header-icon-btn ${chatOpen ? 'active' : ''}`}
                    onClick={onChatToggle}
                    title={t('chat.title' as any)}
                >
                    <MessageSquare style={{ width: 20, height: 20 }} />
                </button>

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
