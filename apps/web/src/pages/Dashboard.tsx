import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../lib/i18n'
import { Activity, Eye, CheckCircle2, Users, ArrowRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { fetchScreenings, type ScreeningListItem } from '../lib/screeningApi'

const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; key: string }> = {
        'submitted': { cls: 'badge-info', key: 'status.submitted' },
        'reading_assigned': { cls: 'badge-warning', key: 'status.reading_assigned' },
        'in_reading': { cls: 'badge-warning', key: 'status.in_reading' },
        'in_progress': { cls: 'badge-warning', key: 'status.in_reading' },
        'qc_review': { cls: 'badge-neutral', key: 'status.qc_review' },
        'completed': { cls: 'badge-success', key: 'status.completed' },
        'saved': { cls: 'badge-info', key: 'status.submitted' },
        'confirmed': { cls: 'badge-success', key: 'status.completed' },
        'draft': { cls: 'badge-neutral', key: 'status.submitted' },
    }
    return map[status] || { cls: 'badge-neutral', key: status }
}

export default function Dashboard() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const [screenings, setScreenings] = useState<ScreeningListItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                const data = await fetchScreenings()
                if (!cancelled) {
                    setScreenings(data)
                    setLoading(false)
                }
            } catch (err) {
                console.error('Failed to fetch screenings:', err)
                if (!cancelled) {
                    setError('データの読み込みに失敗しました')
                    setLoading(false)
                }
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    // Compute stats from real data
    const totalScreenings = screenings.length
    const pendingCount = screenings.filter(s => s.status === 'submitted' || s.status === 'draft' || s.status === 'saved').length
    const completedCount = screenings.filter(s => s.status === 'completed' || s.status === 'confirmed').length
    const uniqueOrgs = new Set(screenings.map(s => s.organizationId)).size

    const stats = [
        { icon: Eye, value: totalScreenings.toString(), labelKey: 'dashboard.stat.screenings' as const, color: '#0d9488', bg: 'var(--teal-50)' },
        { icon: Activity, value: pendingCount.toString(), labelKey: 'dashboard.stat.pending' as const, color: '#f59e0b', bg: 'var(--warning-light)' },
        { icon: CheckCircle2, value: completedCount.toString(), labelKey: 'dashboard.stat.completed' as const, color: '#10b981', bg: 'var(--success-light)' },
        { icon: Users, value: uniqueOrgs.toString(), labelKey: 'dashboard.stat.physicians' as const, color: '#3b82f6', bg: 'var(--info-light)' },
    ]

    // Take the 5 most recent for dashboard display
    const recentScreenings = screenings.slice(0, 5)

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <h1>{t('dashboard.title')}</h1>
                <p style={{ marginTop: 4 }}>{t('dashboard.welcome')}、{user?.fullName || 'User'}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-4">
                {stats.map((s, i) => {
                    const Icon = s.icon
                    return (
                        <div key={i} className="stat-card animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                            <div className="stat-icon" style={{ background: s.bg }}>
                                <Icon style={{ width: 24, height: 24, color: s.color }} />
                            </div>
                            <div>
                                <div className="stat-value">{loading ? '...' : s.value}</div>
                                <div className="stat-label">{t(s.labelKey)}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Screenings Table */}
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', borderBottom: '1px solid var(--border)',
                }}>
                    <h3 style={{ margin: 0 }}>{t('dashboard.recent')}</h3>
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px', minHeight: 32 }} onClick={() => navigate('/screenings')}>
                        {t('dashboard.view_all')} <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: 8, fontSize: '0.85rem' }}>データを読み込んでいます...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: 40, textAlign: 'center', color: '#ef4444' }}>
                        <p>{error}</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{t('table.patient')}</th>
                                <th>{t('table.organization')}</th>
                                <th>{t('table.status')}</th>
                                <th>{t('table.date')}</th>
                                <th>ID</th>
                                <th>{t('table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentScreenings.map((s) => {
                                const badge = statusBadge(s.status)
                                const dateStr = s.screeningDate ? new Date(s.screeningDate).toLocaleDateString('ja-JP') : '—'
                                return (
                                    <tr key={s.id}>
                                        <td style={{ fontWeight: 500 }}>{s.patientName}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{s.organizationName}</td>
                                        <td><span className={`badge ${badge.cls}`}>{t(badge.key as any)}</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{dateStr}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem', fontFamily: 'monospace' }}>{s.patientId}</td>
                                        <td>
                                            <button
                                                className="btn btn-secondary"
                                                style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }}
                                                onClick={() => navigate(`/viewer/${s.id}`)}
                                            >
                                                {t('table.view')}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
