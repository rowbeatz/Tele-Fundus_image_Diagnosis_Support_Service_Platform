import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useBrand } from '../contexts/BrandContext'
import { useNavigate } from 'react-router-dom'
import { useTranslation, LanguageToggle } from '../lib/i18n'
import { ShieldCheck } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { login } = useAuth()
    const { brand } = useBrand()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            await login(email, password)
            navigate('/dashboard')
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } }
            setError(axiosErr.response?.data?.error || t('auth.error.invalid'))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="login-page">
            {/* Left: Hero */}
            <div className="login-hero">
                <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 500 }}>
                    <div style={{ marginBottom: 24 }}>
                        <img
                            src={brand.logoUrl}
                            alt={brand.platformName}
                            style={{ width: 80, height: 80, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }}
                        />
                    </div>
                    <h1 style={{
                        color: 'white', fontSize: '3rem', fontWeight: 700,
                        lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.04em',
                    }}>
                        {brand.platformName}
                    </h1>
                    <p style={{
                        color: 'var(--teal-200)', fontSize: '1.1rem', fontWeight: 500,
                        fontStyle: 'italic', letterSpacing: '0.02em', marginBottom: 24,
                    }}>
                        {brand.tagline}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                        {t('hero.subtitle')}
                    </p>
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
                            {t('auth.demo.super_admin')}<br />
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
