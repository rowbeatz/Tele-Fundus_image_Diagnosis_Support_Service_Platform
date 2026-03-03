import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useBrand } from '../../contexts/BrandContext'
import { useTranslation, LanguageToggle } from '../../lib/i18n'
import { useFontSize } from '../../contexts/FontSizeContext'
import { Bell, LogOut, Menu, Type } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type FontSize = 'small' | 'normal' | 'normalPlus' | 'large'

const fontSizeTooltips: Record<FontSize, string> = { small: 'Small text', normal: 'Normal text', normalPlus: 'Normal+ text', large: 'Large text' }

interface HeaderProps {
    onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
    const { user, logout } = useAuth()
    const { brand } = useBrand()
    const { t, lang } = useTranslation()
    const { fontSize, setFontSize, allSizes } = useFontSize()
    const navigate = useNavigate()
    const [showFontPopup, setShowFontPopup] = useState(false)
    const fontPopupRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    // Close font popup on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (fontPopupRef.current && !fontPopupRef.current.contains(e.target as Node)) {
                setShowFontPopup(false)
            }
        }
        if (showFontPopup) document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showFontPopup])

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
                {/* Font Size Toggle with Gauge Popup */}
                <div style={{ position: 'relative' }} ref={fontPopupRef}>
                    <button
                        className="header-icon-btn font-size-btn"
                        onClick={() => setShowFontPopup(p => !p)}
                        title={fontSizeTooltips[fontSize]}
                    >
                        <Type style={{ width: 18, height: 18 }} />
                        <span className="font-size-indicator">{fontSize[0].toUpperCase()}</span>
                    </button>

                    {showFontPopup && (
                        <div className="font-size-popup">
                            <div className="font-size-popup-label">
                                {lang === 'ja' ? 'フォントサイズ' : 'Font Size'}
                            </div>
                            <div className="font-gauge">
                                {allSizes.map(fs => (
                                    <button
                                        key={fs.key}
                                        className={`font-gauge-btn ${fontSize === fs.key ? 'active' : ''}`}
                                        onClick={() => {
                                            setFontSize(fs.key)
                                            setShowFontPopup(false)
                                        }}
                                    >
                                        <span className="font-gauge-sample" style={{ fontSize: `${fs.px}px` }}>Aa</span>
                                        <span className="font-gauge-label">
                                            {lang === 'ja' ? fs.label.ja : fs.label.en}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

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
