import { useState, useEffect } from 'react'
import { useTranslation } from '../../lib/i18n'
import { api } from '../../lib/api'
import { TrendingUp, Users, DollarSign, Activity, FileText } from 'lucide-react'

const dummyDashboard = { totalBilled: 850000, totalPaid: 320000, grossMargin: 530000, grossMarginPercentage: 62.3 }

export default function BillingDashboard() {
    const [data, setData] = useState<any>(null)
    const [isGenerating, setIsGenerating] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/accounting/dashboard')
                setData(res.data.totalBilled === 0 ? dummyDashboard : res.data)
            } catch { setData(dummyDashboard) }
        }
        fetchDashboard()
    }, [])

    const handleRunMonthEnd = async () => {
        setIsGenerating(true)
        try {
            await api.post('/accounting/invoices/generate', { month: '2026-02' })
            await api.post('/accounting/payments/generate', { month: '2026-02' })
            alert('Monthly processing complete!')
        } catch (err: any) { alert('Failed: ' + err.message) }
        finally { setIsGenerating(false) }
    }

    if (!data) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
        </div>
    )

    const stats = [
        { icon: DollarSign, label: t('billing.total_billed'), value: `¥${data.totalBilled.toLocaleString()}`, color: '#3b82f6', bg: 'var(--info-light)' },
        { icon: Users, label: t('billing.total_paid'), value: `¥${data.totalPaid.toLocaleString()}`, color: '#f59e0b', bg: 'var(--warning-light)' },
        { icon: TrendingUp, label: t('billing.gross_margin'), value: `¥${data.grossMargin.toLocaleString()}`, color: '#10b981', bg: 'var(--success-light)' },
        { icon: Activity, label: t('billing.margin_pct'), value: `${data.grossMarginPercentage}%`, color: '#8b5cf6', bg: '#f5f3ff' },
    ]

    return (
        <div className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>{t('billing.title')}</h1>
                <button className="btn btn-primary" onClick={handleRunMonthEnd} disabled={isGenerating}>
                    {isGenerating ? t('billing.processing') : t('billing.run_month')}
                </button>
            </div>

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
                                <div className="stat-label">{s.label}</div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0 }}>{t('billing.recent')}</h3>
                </div>
                <div style={{ padding: '0' }}>
                    {[
                        { icon: FileText, title: 'さくら眼科クリニック 請求書発行', sub: '¥125,000 — 150件 (ボリュームティア: Level 2)', time: '10分前', iconBg: 'var(--info-light)', iconColor: '#3b82f6' },
                        { icon: DollarSign, title: 'Dr. 田中 報酬支払処理', sub: '¥32,000 — 40件 (ティア: Specialist)', time: '1時間前', iconBg: 'var(--success-light)', iconColor: '#10b981' },
                    ].map((item, i) => {
                        const Icon = item.icon
                        return (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '14px 20px', borderBottom: '1px solid var(--border-light)',
                            }}>
                                <div className="avatar avatar-lg" style={{ background: item.iconBg, color: item.iconColor }}>
                                    <Icon style={{ width: 20, height: 20 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.sub}</div>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.time}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
