import { useAuth } from '../../contexts/AuthContext'
import { useTranslation, LanguageToggle } from '../../lib/i18n'
import { Bell, LogOut, User } from 'lucide-react'

export function Header() {
    const { user, logout } = useAuth()
    const { t } = useTranslation()

    const initials = (user?.fullName || 'U')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    return (
        <header style={{
            height: 'var(--header-height)',
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            flexShrink: 0,
        }}>
            {/* Left – Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0 }}>
                    {t('app.name')}
                </h2>
                {user?.role && (
                    <span className="badge badge-teal" style={{ textTransform: 'capitalize' }}>
                        {user.role}
                    </span>
                )}
            </div>

            {/* Right – Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <LanguageToggle />

                <button style={{
                    position: 'relative', width: 38, height: 38,
                    borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                    background: 'transparent', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s ease',
                }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                    <Bell style={{ width: 18, height: 18, color: 'var(--text-secondary)' }} />
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'var(--danger)', color: 'white',
                        fontSize: '0.65rem', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>3</span>
                </button>

                <div style={{
                    height: 32, width: 1, background: 'var(--border)',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar avatar-teal">
                        {initials || <User style={{ width: 16, height: 16 }} />}
                    </div>
                    <div style={{ lineHeight: 1.3 }}>
                        <div style={{ fontSize: '0.866rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                            {user?.fullName || 'User'}
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    title={t('auth.signout')}
                    style={{
                        width: 38, height: 38, borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        background: 'transparent', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger-light)'; e.currentTarget.style.borderColor = 'var(--danger)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)' }}
                >
                    <LogOut style={{ width: 18, height: 18, color: 'var(--text-secondary)' }} />
                </button>
            </div>
        </header>
    )
}
