import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation, LanguageToggle } from '../lib/i18n'
import { Eye, ShieldCheck, BarChart3, Clock, Camera } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || t('auth.error.invalid'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const heroStats = [
        { icon: Camera, value: t('hero.stat1.value'), label: t('hero.stat1.label') },
        { icon: BarChart3, value: t('hero.stat2.value'), label: t('hero.stat2.label') },
        { icon: Clock, value: t('hero.stat3.value'), label: t('hero.stat3.label') },
    ]

    return (
        <div className="login-page">
            {/* Left: Hero */}
            <div className="login-hero">
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
                    <div style={{
                        width: 64, height: 64, borderRadius: 16,
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 24px',
                    }}>
                        <Eye style={{ width: 32, height: 32, color: 'var(--teal-200)' }} />
                    </div>
                    <h1 style={{
                        color: 'white', fontSize: '2.5rem', fontWeight: 700,
                        lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.03em',
                        whiteSpace: 'pre-line',
                    }}>
                        {t('hero.title')}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 40 }}>
                        {t('hero.subtitle')}
                    </p>
                    <div style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
                        {heroStats.map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--teal-200)' }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Form */}
            <div className="login-form-side">
                <div style={{ position: 'absolute', top: 20, right: 20 }}>
                    <LanguageToggle />
                </div>

                <div style={{ width: '100%', maxWidth: 380 }}>
                    <div style={{ textAlign: 'center', marginBottom: 32 }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>{t('auth.title')}</h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t('auth.subtitle')}</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label className="label">{t('auth.email')}</label>
                            <input
                                className="input-field"
                                type="email"
                                placeholder={t('auth.email.placeholder')}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <label className="label" style={{ marginBottom: 0 }}>{t('auth.password')}</label>
                                <a href="#" style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t('auth.forgot')}</a>
                            </div>
                            <input
                                className="input-field"
                                type="password"
                                placeholder={t('auth.password.placeholder')}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div style={{
                                padding: '10px 14px', fontSize: '0.85rem',
                                color: '#991b1b', background: 'var(--danger-light)',
                                border: '1px solid #fecaca', borderRadius: 'var(--radius)',
                            }}>
                                {error}
                            </div>
                        )}

                        <button className="btn btn-primary" type="submit" disabled={isSubmitting}
                            style={{ height: 48, fontSize: '0.95rem', fontWeight: 600 }}>
                            {isSubmitting ? t('auth.signing_in') : t('auth.signin')}
                        </button>
                    </form>

                    <div style={{
                        marginTop: 32, padding: '16px', borderRadius: 'var(--radius)',
                        background: 'var(--bg)', border: '1px solid var(--border)',
                    }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                            {t('auth.demo.title')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                            {t('auth.demo.admin')}<br />
                            {t('auth.demo.operator')}<br />
                            {t('auth.demo.physician')}<br />
                            {t('auth.demo.client')}
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 6, marginTop: 24, color: 'var(--text-muted)', fontSize: '0.8rem',
                    }}>
                        <ShieldCheck style={{ width: 14, height: 14 }} />
                        <span>{t('app.secure')}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
