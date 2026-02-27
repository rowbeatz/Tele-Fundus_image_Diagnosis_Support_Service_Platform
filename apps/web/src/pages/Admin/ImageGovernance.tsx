import { useState } from 'react'
import { useTranslation } from '../../lib/i18n'
import { Shield, Building2, User, FileCheck, ChevronDown, Eye, EyeOff } from 'lucide-react'

type Policy = {
    id: string; orgName: string; clientType: 'organization' | 'individual'
    deletion: 'allow' | 'deny' | 'admin_only'; secondaryUse: 'allowed' | 'denied' | 'requires_consent'
    masking: boolean; retentionDays: number
}

type ConsentRecord = {
    id: string; subjectName: string; subjectType: 'examinee' | 'organization' | 'individual'
    consentType: string; status: 'granted' | 'revoked' | 'pending'
    grantedAt: string | null
}

const demoPolicies: Policy[] = [
    { id: '1', orgName: 'さくら眼科クリニック', clientType: 'organization', deletion: 'admin_only', secondaryUse: 'requires_consent', masking: true, retentionDays: 2555 },
    { id: '2', orgName: '東京中央病院', clientType: 'organization', deletion: 'deny', secondaryUse: 'allowed', masking: true, retentionDays: 3650 },
    { id: '3', orgName: '大阪総合医療センター', clientType: 'organization', deletion: 'admin_only', secondaryUse: 'denied', masking: false, retentionDays: 2555 },
]

const demoConsents: ConsentRecord[] = [
    { id: '1', subjectName: '田中 太郎', subjectType: 'examinee', consentType: 'secondary_use', status: 'granted', grantedAt: '2026-01-15' },
    { id: '2', subjectName: '鈴木 花子', subjectType: 'examinee', consentType: 'secondary_use', status: 'pending', grantedAt: null },
    { id: '3', subjectName: '東京中央病院', subjectType: 'organization', consentType: 'data_sharing', status: 'granted', grantedAt: '2025-04-01' },
]

export default function ImageGovernance() {
    const { t } = useTranslation()
    const [policies, setPolicies] = useState(demoPolicies)
    const [consents] = useState(demoConsents)
    const [tab, setTab] = useState<'policies' | 'consent'>('policies')

    const consentBadge: Record<string, { cls: string; key: string }> = {
        granted: { cls: 'badge-success', key: 'admin.image.consent.granted' },
        revoked: { cls: 'badge-danger', key: 'admin.image.consent.revoked' },
        pending: { cls: 'badge-warning', key: 'admin.image.consent.pending' },
    }

    return (
        <div className="space-y-6">
            <div>
                <h1>{t('admin.image.title')}</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>
                    {t('admin.image.subtitle' as any)}
                </p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
                {(['policies', 'consent'] as const).map(tb => (
                    <button key={tb} onClick={() => setTab(tb)} style={{
                        padding: '10px 20px', border: 'none', cursor: 'pointer',
                        fontSize: '0.9rem', fontWeight: 600,
                        background: tab === tb ? 'var(--bg-card)' : 'transparent',
                        color: tab === tb ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: tab === tb ? '2px solid var(--primary)' : '2px solid transparent',
                        marginBottom: -2, borderRadius: '8px 8px 0 0',
                        transition: 'all 0.15s ease',
                    }}>
                        {tb === 'policies' ? (
                            <><Shield style={{ width: 16, height: 16, verticalAlign: 'middle', marginRight: 6 }} />{t('admin.image.policies')}</>
                        ) : (
                            <><FileCheck style={{ width: 16, height: 16, verticalAlign: 'middle', marginRight: 6 }} />{t('admin.image.consent')}</>
                        )}
                    </button>
                ))}
            </div>

            {tab === 'policies' && (
                <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ minWidth: 180 }}>{t('admin.image.org' as any)}</th>
                                <th>{t('admin.image.client_type')}</th>
                                <th>{t('admin.image.deletion')}</th>
                                <th>{t('admin.image.secondary')}</th>
                                <th>{t('admin.image.masking')}</th>
                                <th>{t('admin.image.retention' as any)}</th>
                                <th>{t('table.action')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {policies.map(p => {
                                return (
                                    <tr key={p.id}>
                                        <td style={{ fontWeight: 500 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Building2 style={{ width: 16, height: 16, color: 'var(--text-muted)', flexShrink: 0 }} />
                                                {p.orgName}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                {p.clientType === 'organization' ? <Building2 style={{ width: 12, height: 12 }} /> : <User style={{ width: 12, height: 12 }} />}
                                                {t(p.clientType === 'organization' ? 'admin.image.client_type.org' : 'admin.image.client_type.individual')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="select-wrapper" style={{ minWidth: 120 }}>
                                                <select className="input-field" value={p.deletion}
                                                    onChange={e => setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, deletion: e.target.value as Policy['deletion'] } : x))}
                                                    style={{ fontSize: '0.8rem', minHeight: 32, padding: '4px 28px 4px 8px' }}>
                                                    <option value="allow">{t('admin.image.deletion.allow')}</option>
                                                    <option value="deny">{t('admin.image.deletion.deny')}</option>
                                                    <option value="admin_only">{t('admin.image.deletion.admin_only')}</option>
                                                </select>
                                                <ChevronDown className="select-icon" />
                                            </div>
                                        </td>
                                        <td>
                                            <div className="select-wrapper" style={{ minWidth: 130 }}>
                                                <select className="input-field" value={p.secondaryUse}
                                                    onChange={e => setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, secondaryUse: e.target.value as Policy['secondaryUse'] } : x))}
                                                    style={{ fontSize: '0.8rem', minHeight: 32, padding: '4px 28px 4px 8px' }}>
                                                    <option value="allowed">{t('admin.image.secondary.allowed')}</option>
                                                    <option value="denied">{t('admin.image.secondary.denied')}</option>
                                                    <option value="requires_consent">{t('admin.image.secondary.requires_consent')}</option>
                                                </select>
                                                <ChevronDown className="select-icon" />
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => setPolicies(prev => prev.map(x => x.id === p.id ? { ...x, masking: !x.masking } : x))}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                                    padding: '4px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                                    fontSize: '0.8rem', fontWeight: 600,
                                                    background: p.masking ? 'var(--success-light)' : 'var(--border-light)',
                                                    color: p.masking ? 'var(--success)' : 'var(--text-muted)',
                                                }}
                                            >
                                                {p.masking ? <Eye style={{ width: 14, height: 14 }} /> : <EyeOff style={{ width: 14, height: 14 }} />}
                                                {p.masking ? t('admin.image.masking.enabled') : t('admin.image.masking.disabled')}
                                            </button>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                            {t('admin.image.retention.years' as any).replace('{years}', String(Math.round(p.retentionDays / 365)))}
                                        </td>
                                        <td>
                                            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }}>
                                                {t('admin.users.edit')}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {tab === 'consent' && (
                <div className="space-y-4">
                    <div className="panel" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>{t('admin.image.consent.direct')}</h3>
                        <button className="btn btn-primary" style={{ fontSize: '0.8rem' }}>
                            {t('admin.image.consent.new' as any)}
                        </button>
                    </div>

                    <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('admin.image.consent.subject' as any)}</th>
                                    <th>{t('admin.image.client_type')}</th>
                                    <th>{t('admin.image.consent.type' as any)}</th>
                                    <th>{t('admin.image.consent.status')}</th>
                                    <th>{t('admin.image.consent.date' as any)}</th>
                                    <th>{t('table.action')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {consents.map(c => {
                                    const cb = consentBadge[c.status]
                                    return (
                                        <tr key={c.id}>
                                            <td style={{ fontWeight: 500 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {c.subjectType === 'organization' ? <Building2 style={{ width: 16, height: 16, color: 'var(--text-muted)' }} /> : <User style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />}
                                                    {c.subjectName}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-neutral">
                                                    {c.subjectType === 'organization' ? t('admin.image.client_type.org') : t('admin.image.client_type.individual')}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: '0.85rem' }}>{c.consentType.replace(/_/g, ' ')}</td>
                                            <td><span className={`badge ${cb.cls}`}>{t(cb.key as any)}</span></td>
                                            <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{c.grantedAt || '—'}</td>
                                            <td>
                                                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }}>
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
            )}
        </div>
    )
}
