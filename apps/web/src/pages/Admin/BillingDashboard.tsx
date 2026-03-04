import { useState, useEffect } from 'react'
import { useTranslation } from '../../lib/i18n'
import { api } from '../../lib/api'
import { TrendingUp, Users, DollarSign, Activity, FileText } from 'lucide-react'



export default function BillingDashboard() {
    const [data, setData] = useState<any>(null)
    const [invoices, setInvoices] = useState<any[]>([])
    const [payments, setPayments] = useState<any[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [res, invRes, payRes] = await Promise.all([
                    api.get('/accounting/dashboard'),
                    api.get('/accounting/invoices'),
                    api.get('/accounting/payments')
                ])
                setData(res.data)
                setInvoices(invRes.data)
                setPayments(payRes.data)
            } catch (err) {
                console.error('Failed to fetch dashboard', err)
                setData({ totalBilled: 0, totalPaid: 0, grossMargin: 0, grossMarginPercentage: 0 })
            }
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

            <div className="grid grid-2">
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0 }}>Recent Client Invoices</h3>
                    </div>
                    <div style={{ padding: '0' }}>
                        {invoices.length === 0 ? <div style={{ padding: 20, color: 'var(--text-muted)' }}>No invoices generated</div> : invoices.slice(0, 5).map((inv, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
                                <div className="avatar avatar-lg" style={{ background: 'var(--info-light)', color: '#3b82f6' }}>
                                    <FileText style={{ width: 20, height: 20 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{inv.organization_name} — {inv.billing_month}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total: ¥{Number(inv.total_amount).toLocaleString()} ({inv.status})</div>
                                </div>
                                {inv.status !== 'paid' && (
                                    <button
                                        onClick={async () => {
                                            await api.post(`/accounting/invoices/${inv.id}/pay`);
                                            // Refresh would be ideal here, mock for now
                                            alert('Invoice marked as paid');
                                        }}
                                        style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                        Mark Paid
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0 }}>Recent Physician Payouts</h3>
                    </div>
                    <div style={{ padding: '0' }}>
                        {payments.length === 0 ? <div style={{ padding: 20, color: 'var(--text-muted)' }}>No payouts generated</div> : payments.slice(0, 5).map((pay, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
                                <div className="avatar avatar-lg" style={{ background: 'var(--success-light)', color: '#10b981' }}>
                                    <DollarSign style={{ width: 20, height: 20 }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{pay.physician_name} — {pay.payment_month}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount: ¥{Number(pay.total_amount).toLocaleString()} ({pay.status})</div>
                                </div>
                                {pay.status !== 'paid' && (
                                    <button
                                        onClick={async () => {
                                            await api.post(`/accounting/payments/${pay.id}/pay`);
                                            // Refresh mock
                                            alert('Payout transferred');
                                        }}
                                        style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer' }}>
                                        Transfer
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
