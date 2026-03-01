import { useState, useEffect } from 'react'
import { useTranslation } from '../../lib/i18n'
import { Building2, Users, Phone, Mail, MapPin, Edit2, Plus, Search, MoreVertical, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '../../lib/api'

interface Organization {
    id: string
    code: string
    name: string
    billingName?: string
    contactName?: string
    email?: string
    phone?: string
    address?: string
    status: string
    createdAt: string
}

// Mock matching seed data
const mockOrganizations: Organization[] = [
    { id: '11111111-1111-1111-1111-111111111111', code: 'SAKURA-CLINIC', name: 'さくら眼科クリニック', billingName: 'さくら眼科クリニック', contactName: '小林 直樹', email: 'info@sakura-eye.jp', phone: '03-1234-5678', address: '東京都渋谷区神宮前1-2-3', status: 'active', createdAt: '2025-06-01' },
    { id: '22222222-2222-2222-2222-222222222222', code: 'TOKYO-CENTRAL', name: '東京中央病院', billingName: '東京中央病院 眼科', contactName: '中村 明美', email: 'eye@tokyo-central.jp', phone: '03-9876-5432', address: '東京都千代田区丸の内4-5-6', status: 'active', createdAt: '2025-04-15' },
    { id: '33333333-3333-3333-3333-333333333333', code: 'OSAKA-MEDICAL', name: '大阪総合医療センター', billingName: '大阪総合医療センター', contactName: '西田 裕子', email: 'ophthalmo@osaka-med.jp', phone: '06-1111-2222', address: '大阪府大阪市中央区本町7-8-9', status: 'active', createdAt: '2025-08-20' },
]

export default function OrganizationManagement() {
    const lang = (localStorage.getItem('lang') || 'ja')
    const [orgs, setOrgs] = useState<Organization[]>([])
    const [search, setSearch] = useState('')
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/organizations')
                setOrgs(res.data)
            } catch {
                setOrgs(mockOrganizations)
            }
        }
        load()
    }, [])

    const filtered = search
        ? orgs.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.code.toLowerCase().includes(search.toLowerCase()))
        : orgs

    return (
        <div className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1>{lang === 'ja' ? '医療機関管理' : 'Organization Management'}</h1>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                        {lang === 'ja' ? '登録医療機関の管理と設定を行います' : 'Manage registered healthcare organizations'}
                    </p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus style={{ width: 16, height: 16 }} />
                    {lang === 'ja' ? '新規登録' : 'Add Organization'}
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-4">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                        <Building2 style={{ width: 24, height: 24, color: '#3b82f6' }} />
                    </div>
                    <div>
                        <div className="stat-value">{orgs.length}</div>
                        <div className="stat-label">{lang === 'ja' ? '登録機関数' : 'Registered'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <CheckCircle2 style={{ width: 24, height: 24, color: '#10b981' }} />
                    </div>
                    <div>
                        <div className="stat-value">{orgs.filter(o => o.status === 'active').length}</div>
                        <div className="stat-label">{lang === 'ja' ? 'アクティブ' : 'Active'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Users style={{ width: 24, height: 24, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <div className="stat-value">—</div>
                        <div className="stat-label">{lang === 'ja' ? '総ユーザー数' : 'Total Users'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
                        <XCircle style={{ width: 24, height: 24, color: '#6b7280' }} />
                    </div>
                    <div>
                        <div className="stat-value">{orgs.filter(o => o.status !== 'active').length}</div>
                        <div className="stat-label">{lang === 'ja' ? '停止中' : 'Inactive'}</div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="panel" style={{ padding: '12px 16px' }}>
                <div style={{ position: 'relative', maxWidth: 300 }}>
                    <Search style={{ width: 14, height: 14, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={lang === 'ja' ? '機関名・コードで検索...' : 'Search organizations...'}
                        style={{
                            padding: '6px 12px 6px 30px', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', background: 'var(--bg-main)',
                            color: 'var(--text-primary)', fontSize: '0.85rem', width: '100%',
                        }}
                    />
                </div>
            </div>

            {/* Organization Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
                {filtered.map(org => (
                    <div
                        key={org.id}
                        className="panel"
                        style={{
                            padding: 20, cursor: 'pointer',
                            border: selectedOrg?.id === org.id ? '2px solid var(--primary)' : undefined,
                            transition: 'border 0.2s',
                        }}
                        onClick={() => setSelectedOrg(selectedOrg?.id === org.id ? null : org)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius)',
                                    background: 'rgba(59,130,246,0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Building2 style={{ width: 20, height: 20, color: '#3b82f6' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{org.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{org.code}</div>
                                </div>
                            </div>
                            <span style={{
                                padding: '2px 8px', borderRadius: 10, fontSize: '0.7rem', fontWeight: 600,
                                color: org.status === 'active' ? '#10b981' : '#6b7280',
                                background: org.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(107,114,128,0.1)',
                            }}>
                                {org.status === 'active' ? (lang === 'ja' ? 'アクティブ' : 'Active') : (lang === 'ja' ? '停止中' : 'Inactive')}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Users style={{ width: 13, height: 13, color: 'var(--text-muted)', flexShrink: 0 }} />
                                <span>{org.contactName || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Mail style={{ width: 13, height: 13, color: 'var(--text-muted)', flexShrink: 0 }} />
                                <span>{org.email || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Phone style={{ width: 13, height: 13, color: 'var(--text-muted)', flexShrink: 0 }} />
                                <span>{org.phone || '—'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <MapPin style={{ width: 13, height: 13, color: 'var(--text-muted)', flexShrink: 0 }} />
                                <span>{org.address || '—'}</span>
                            </div>
                        </div>

                        {selectedOrg?.id === org.id && (
                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 4, minHeight: 30 }}>
                                    <Edit2 style={{ width: 13, height: 13 }} />
                                    {lang === 'ja' ? '編集' : 'Edit'}
                                </button>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 12px', minHeight: 30 }}>
                                    {lang === 'ja' ? '請求プラン' : 'Billing Plan'}
                                </button>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '4px 12px', minHeight: 30 }}>
                                    {lang === 'ja' ? 'ユーザー一覧' : 'Users'}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
