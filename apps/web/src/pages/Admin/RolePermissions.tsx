import { useState } from 'react'
import { useTranslation } from '../../lib/i18n'
import { Lock, Check, X, Save } from 'lucide-react'

type PermDef = { key: string; name: string }
type Category = { id: string; labelKey: string; perms: PermDef[] }

const categories: Category[] = [
    {
        id: 'dashboard', labelKey: 'perm.cat.dashboard', perms: [
            { key: 'dashboard.view', name: 'View Dashboard' },
        ]
    },
    {
        id: 'screening', labelKey: 'perm.cat.screening', perms: [
            { key: 'screening.create', name: 'Create Screening' },
            { key: 'screening.view_all', name: 'View All' },
            { key: 'screening.view_own', name: 'View Own' },
            { key: 'screening.edit', name: 'Edit' },
            { key: 'screening.delete', name: 'Delete' },
        ]
    },
    {
        id: 'reading', labelKey: 'perm.cat.reading', perms: [
            { key: 'reading.create', name: 'Create Reading' },
            { key: 'reading.submit', name: 'Submit' },
            { key: 'reading.qc', name: 'QC Review' },
            { key: 'reading.reassign', name: 'Reassign' },
        ]
    },
    {
        id: 'image', labelKey: 'perm.cat.image', perms: [
            { key: 'image.upload', name: 'Upload' },
            { key: 'image.view', name: 'View' },
            { key: 'image.delete', name: 'Delete' },
            { key: 'image.annotate', name: 'Annotate' },
            { key: 'image.secondary_use', name: 'Secondary Use' },
            { key: 'image.export', name: 'Export' },
        ]
    },
    {
        id: 'user', labelKey: 'perm.cat.user', perms: [
            { key: 'user.view', name: 'View Users' },
            { key: 'user.create', name: 'Create' },
            { key: 'user.edit', name: 'Edit' },
            { key: 'user.deactivate', name: 'Deactivate' },
            { key: 'user.manage_admins', name: 'Manage Admins' },
        ]
    },
    {
        id: 'role', labelKey: 'perm.cat.role', perms: [
            { key: 'role.view', name: 'View Roles' },
            { key: 'role.manage', name: 'Manage Roles' },
            { key: 'permission.manage', name: 'Manage Permissions' },
        ]
    },
    {
        id: 'organization', labelKey: 'perm.cat.organization', perms: [
            { key: 'organization.view', name: 'View' },
            { key: 'organization.manage', name: 'Manage' },
        ]
    },
    {
        id: 'billing', labelKey: 'perm.cat.billing', perms: [
            { key: 'billing.view', name: 'View Billing' },
            { key: 'billing.manage', name: 'Manage' },
        ]
    },
    {
        id: 'settings', labelKey: 'perm.cat.settings', perms: [
            { key: 'settings.view', name: 'View Settings' },
            { key: 'settings.manage', name: 'Manage' },
            { key: 'brand.manage', name: 'Brand' },
        ]
    },
    {
        id: 'data', labelKey: 'perm.cat.data', perms: [
            { key: 'data.mask', name: 'Data Masking' },
            { key: 'data.export', name: 'Export' },
            { key: 'consent.view', name: 'View Consent' },
            { key: 'consent.manage', name: 'Manage Consent' },
            { key: 'image_policy.view', name: 'View Policies' },
            { key: 'image_policy.manage', name: 'Manage Policies' },
        ]
    },
]

const roles = ['super_admin', 'admin', 'operator', 'physician', 'client', 'individual'] as const

// Default permission set (mirrors seed data)
const defaultPerms: Record<string, Set<string>> = {
    super_admin: new Set(categories.flatMap(c => c.perms.map(p => p.key))),
    admin: new Set(categories.flatMap(c => c.perms.map(p => p.key)).filter(k => !['user.manage_admins', 'role.manage', 'permission.manage'].includes(k))),
    operator: new Set(['dashboard.view', 'screening.view_all', 'screening.edit', 'reading.qc', 'reading.reassign', 'image.view', 'image.annotate', 'user.view']),
    physician: new Set(['dashboard.view', 'screening.view_all', 'reading.create', 'reading.submit', 'image.view', 'image.annotate']),
    client: new Set(['dashboard.view', 'screening.create', 'screening.view_own', 'image.upload', 'image.view']),
    individual: new Set(['dashboard.view', 'screening.create', 'screening.view_own', 'image.upload', 'image.view', 'consent.view']),
}

export default function RolePermissions() {
    const { t } = useTranslation()
    const [matrix, setMatrix] = useState<Record<string, Set<string>>>(() => {
        const m: Record<string, Set<string>> = {}
        for (const r of roles) m[r] = new Set(defaultPerms[r])
        return m
    })
    const [saved, setSaved] = useState(false)

    const toggle = (role: string, permKey: string) => {
        if (role === 'super_admin') return // Super admin always has all
        setMatrix(prev => {
            const next = { ...prev, [role]: new Set(prev[role]) }
            if (next[role].has(permKey)) next[role].delete(permKey)
            else next[role].add(permKey)
            return next
        })
        setSaved(false)
    }

    const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

    const roleDisplayNames: Record<string, string> = {
        super_admin: 'Super Admin', admin: 'Admin', operator: 'Operator',
        physician: 'Physician', client: 'Client', individual: 'Individual',
    }

    return (
        <div className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>{t('admin.roles.title')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{t('admin.roles.matrix')}</p>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>
                    {saved ? <><Check style={{ width: 16, height: 16 }} /> {t('admin.roles.saved')}</> : <><Save style={{ width: 16, height: 16 }} /> {t('admin.roles.save')}</>}
                </button>
            </div>

            <div className="panel" style={{ padding: 0, overflow: 'auto' }}>
                <table className="data-table permission-matrix">
                    <thead>
                        <tr>
                            <th style={{ minWidth: 200, position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 2 }}>
                                <Lock style={{ width: 14, height: 14, verticalAlign: 'middle', marginRight: 4 }} />
                                {t('admin.roles.permission')}
                            </th>
                            {roles.map(r => (
                                <th key={r} style={{ textAlign: 'center', minWidth: 90 }}>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{roleDisplayNames[r]}</div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <>
                                <tr key={`cat-${cat.id}`} className="category-row">
                                    <td colSpan={roles.length + 1} style={{
                                        fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)',
                                        background: 'var(--teal-50)', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        padding: '8px 16px', position: 'sticky', left: 0,
                                    }}>
                                        {t(cat.labelKey as any)}
                                    </td>
                                </tr>
                                {cat.perms.map(perm => (
                                    <tr key={perm.key}>
                                        <td style={{ position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 1, fontSize: '0.85rem' }}>
                                            {perm.name}
                                        </td>
                                        {roles.map(r => {
                                            const has = matrix[r]?.has(perm.key)
                                            const isSuperAdmin = r === 'super_admin'
                                            return (
                                                <td key={r} style={{ textAlign: 'center' }}>
                                                    <button
                                                        onClick={() => toggle(r, perm.key)}
                                                        disabled={isSuperAdmin}
                                                        style={{
                                                            width: 28, height: 28, borderRadius: 6, border: 'none',
                                                            cursor: isSuperAdmin ? 'default' : 'pointer',
                                                            background: has ? 'var(--primary)' : 'var(--border-light)',
                                                            color: has ? 'white' : 'var(--text-muted)',
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            transition: 'all 0.15s ease',
                                                            opacity: isSuperAdmin ? 0.6 : 1,
                                                        }}
                                                    >
                                                        {has ? <Check style={{ width: 14, height: 14 }} /> : <X style={{ width: 14, height: 14 }} />}
                                                    </button>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                ))}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
