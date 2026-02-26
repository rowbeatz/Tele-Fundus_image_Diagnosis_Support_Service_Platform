import { useAuth } from '../contexts/AuthContext'
import { useTranslation } from '../lib/i18n'
import { Activity, Eye, CheckCircle2, Users, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const recentScreenings = [
    { id: 1, patient: '田中 太郎', org: 'さくら眼科クリニック', status: 'completed', date: '2026-02-26', physician: 'Dr. 田中' },
    { id: 2, patient: '鈴木 花子', org: '東京中央病院', status: 'in_reading', date: '2026-02-26', physician: 'Dr. 佐藤' },
    { id: 3, patient: '佐藤 健一', org: 'さくら眼科クリニック', status: 'qc_review', date: '2026-02-25', physician: 'Dr. 田中' },
    { id: 4, patient: '山田 美咲', org: '大阪総合医療センター', status: 'submitted', date: '2026-02-25', physician: '—' },
    { id: 5, patient: '高橋 翔太', org: '東京中央病院', status: 'completed', date: '2026-02-24', physician: 'Dr. 佐藤' },
]

const statusBadge = (status: string) => {
    const map: Record<string, { cls: string; key: string }> = {
        'submitted': { cls: 'badge-info', key: 'status.submitted' },
        'reading_assigned': { cls: 'badge-warning', key: 'status.reading_assigned' },
        'in_reading': { cls: 'badge-warning', key: 'status.in_reading' },
        'qc_review': { cls: 'badge-neutral', key: 'status.qc_review' },
        'completed': { cls: 'badge-success', key: 'status.completed' },
    }
    return map[status] || { cls: 'badge-neutral', key: status }
}

export default function Dashboard() {
    const { user } = useAuth()
    const { t } = useTranslation()
    const navigate = useNavigate()

    const stats = [
        { icon: Eye, value: '2,847', labelKey: 'dashboard.stat.screenings' as const, color: '#0d9488', bg: 'var(--teal-50)' },
        { icon: Activity, value: '23', labelKey: 'dashboard.stat.pending' as const, color: '#f59e0b', bg: 'var(--warning-light)' },
        { icon: CheckCircle2, value: '12', labelKey: 'dashboard.stat.completed' as const, color: '#10b981', bg: 'var(--success-light)' },
        { icon: Users, value: '8', labelKey: 'dashboard.stat.physicians' as const, color: '#3b82f6', bg: 'var(--info-light)' },
    ]

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
                                <div className="stat-value">{s.value}</div>
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
                    <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px', minHeight: 32 }}>
                        {t('dashboard.view_all')} <ArrowRight style={{ width: 14, height: 14 }} />
                    </button>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('table.patient')}</th>
                            <th>{t('table.organization')}</th>
                            <th>{t('table.status')}</th>
                            <th>{t('table.date')}</th>
                            <th>{t('table.physician')}</th>
                            <th>{t('table.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentScreenings.map((s) => {
                            const badge = statusBadge(s.status)
                            return (
                                <tr key={s.id}>
                                    <td style={{ fontWeight: 500 }}>{s.patient}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{s.org}</td>
                                    <td><span className={`badge ${badge.cls}`}>{t(badge.key as any)}</span></td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{s.date}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{s.physician}</td>
                                    <td>
                                        <button
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }}
                                            onClick={() => navigate(`/viewer/mock`)}
                                        >
                                            {t('table.view')}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
