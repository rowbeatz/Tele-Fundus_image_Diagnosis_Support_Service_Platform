import { useState } from 'react'
import { useTranslation } from '../../lib/i18n'
import { UserCog, Plus, Search, Shield, ChevronDown } from 'lucide-react'

type DemoUser = {
    id: string; fullName: string; email: string; role: string;
    adminLevel: string; isActive: boolean; lastLogin: string;
}

const demoUsers: DemoUser[] = [
    { id: '1', fullName: 'System Administrator', email: 'admin@retinainsight.jp', role: 'admin', adminLevel: 'super_admin', isActive: true, lastLogin: '2026-02-27 08:30' },
    { id: '2', fullName: 'オペレーター 山口', email: 'operator@retinainsight.jp', role: 'operator', adminLevel: 'standard', isActive: true, lastLogin: '2026-02-27 09:15' },
    { id: '3', fullName: 'Dr. 田中 康夫', email: 'dr.tanaka@retinainsight.jp', role: 'physician', adminLevel: 'standard', isActive: true, lastLogin: '2026-02-26 18:45' },
    { id: '4', fullName: '小林 直樹', email: 'client@sakura-hospital.jp', role: 'client', adminLevel: 'standard', isActive: true, lastLogin: '2026-02-25 14:20' },
    { id: '5', fullName: 'Dr. 佐藤 恵理子', email: 'dr.sato@retinainsight.jp', role: 'physician', adminLevel: 'standard', isActive: true, lastLogin: '2026-02-27 07:50' },
]

const roleBadge: Record<string, { cls: string; label: string }> = {
    admin: { cls: 'badge-danger', label: 'Admin' },
    operator: { cls: 'badge-warning', label: 'Operator' },
    physician: { cls: 'badge-info', label: 'Physician' },
    client: { cls: 'badge-success', label: 'Client' },
    individual: { cls: 'badge-neutral', label: 'Individual' },
}

export default function UserManagement() {
    const { t } = useTranslation()
    const [users, setUsers] = useState(demoUsers)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editUser, setEditUser] = useState<DemoUser | null>(null)

    const filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

    const toggleActive = (id: string) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u))
    }

    return (
        <div className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>{t('admin.users.title')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{filtered.length} users</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setEditUser(null); setShowModal(true) }}>
                    <Plus style={{ width: 18, height: 18 }} /> {t('admin.users.add')}
                </button>
            </div>

            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Search style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                    <input className="input-field" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
                        style={{ border: 'none', boxShadow: 'none', padding: '4px 0' }} />
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{t('admin.users.name')}</th>
                            <th>{t('admin.users.email')}</th>
                            <th>{t('admin.users.role')}</th>
                            <th>{t('admin.users.admin_level')}</th>
                            <th>{t('admin.users.status')}</th>
                            <th>{t('admin.users.last_login')}</th>
                            <th>{t('table.action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(u => {
                            const rb = roleBadge[u.role] || { cls: 'badge-neutral', label: u.role }
                            return (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div className="avatar" style={{
                                                width: 28, height: 28, borderRadius: '50%',
                                                background: 'var(--primary)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                                            }}>
                                                {u.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                            </div>
                                            {u.fullName}
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                                    <td><span className={`badge ${rb.cls}`}>{rb.label}</span></td>
                                    <td>
                                        {u.adminLevel === 'super_admin' ? (
                                            <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <Shield style={{ width: 12, height: 12 }} /> {t('admin.users.super_admin')}
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{t('admin.users.standard')}</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => toggleActive(u.id)}
                                            style={{
                                                padding: '3px 10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                                fontSize: '0.75rem', fontWeight: 600,
                                                background: u.isActive ? 'var(--success-light)' : 'var(--danger-light)',
                                                color: u.isActive ? 'var(--success)' : 'var(--danger)',
                                            }}
                                        >
                                            {u.isActive ? t('admin.users.active') : t('admin.users.inactive')}
                                        </button>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.lastLogin}</td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }}
                                            onClick={() => { setEditUser(u); setShowModal(true) }}>
                                            {t('admin.users.edit')}
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: 20 }}>
                            <UserCog style={{ width: 20, height: 20, verticalAlign: 'middle', marginRight: 8 }} />
                            {editUser ? t('admin.users.edit') : t('admin.users.add')}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label className="label">{t('admin.users.name')}</label>
                                <input className="input-field" defaultValue={editUser?.fullName || ''} />
                            </div>
                            <div>
                                <label className="label">{t('admin.users.email')}</label>
                                <input className="input-field" type="email" defaultValue={editUser?.email || ''} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label className="label">{t('admin.users.role')}</label>
                                    <div className="select-wrapper">
                                        <select className="input-field" defaultValue={editUser?.role || 'operator'}>
                                            <option value="admin">Admin</option>
                                            <option value="operator">Operator</option>
                                            <option value="physician">Physician</option>
                                            <option value="client">Client</option>
                                            <option value="individual">Individual</option>
                                        </select>
                                        <ChevronDown className="select-icon" />
                                    </div>
                                </div>
                                <div>
                                    <label className="label">{t('admin.users.admin_level')}</label>
                                    <div className="select-wrapper">
                                        <select className="input-field" defaultValue={editUser?.adminLevel || 'standard'}>
                                            <option value="standard">{t('admin.users.standard')}</option>
                                            <option value="super_admin">{t('admin.users.super_admin')}</option>
                                        </select>
                                        <ChevronDown className="select-icon" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>{t('admin.users.cancel')}</button>
                            <button className="btn btn-primary" onClick={() => { setShowModal(false); alert('Saved!') }}>{t('admin.users.save')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
