import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { Search, Plus, ChevronRight, Users, Filter, Loader2 } from 'lucide-react'
import { fetchScreenings, type ScreeningListItem } from '../../lib/screeningApi'

export default function PatientList() {
    const navigate = useNavigate()
    const { lang } = useTranslation()
    const [search, setSearch] = useState('')
    const [sexFilter, setSexFilter] = useState<string>('all')
    const [screenings, setScreenings] = useState<ScreeningListItem[]>([])
    const [loading, setLoading] = useState(true)

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
                console.error('Failed to fetch patients:', err)
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [])

    // Deduplicate by examineeId — group screenings per patient
    const patientMap = new Map<string, {
        id: string; patientId: string; name: string; sex: string;
        age: number; org: string; lastVisit: string; screeningCount: number; examineeId: string
    }>()
    for (const s of screenings) {
        const existing = patientMap.get(s.examineeId)
        if (!existing || new Date(s.screeningDate) > new Date(existing.lastVisit)) {
            patientMap.set(s.examineeId, {
                id: s.examineeId,
                patientId: s.patientId,
                name: s.patientName,
                sex: s.sex,
                age: s.age,
                org: s.organizationName,
                lastVisit: s.screeningDate,
                screeningCount: (existing?.screeningCount || 0) + (existing ? 0 : 1),
                examineeId: s.examineeId,
            })
        }
        if (existing) {
            existing.screeningCount += 1
        }
    }
    const patients = Array.from(patientMap.values())

    const filtered = patients.filter(p => {
        const q = search.toLowerCase()
        const matchSearch = !q || p.name.includes(search) || p.patientId.toLowerCase().includes(q)
        const sexVal = p.sex === 'male' ? 'M' : p.sex === 'female' ? 'F' : p.sex
        const matchSex = sexFilter === 'all' || sexVal === sexFilter
        return matchSearch && matchSex
    })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Users style={{ width: 28, height: 28, color: 'var(--primary)' }} />
                        {lang === 'ja' ? '患者一覧' : 'Patient List'}
                    </h1>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                        {loading ? '...' : (lang === 'ja' ? `${filtered.length} 名の患者が登録されています` : `${filtered.length} patients registered`)}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/patients/new')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus style={{ width: 18, height: 18 }} />
                    {lang === 'ja' ? '新規登録' : 'New Patient'}
                </button>
            </div>

            {/* Search & Filters */}
            <div className="panel" style={{ padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={lang === 'ja' ? '氏名・IDで検索…' : 'Search by name or ID…'}
                        className="form-input"
                        style={{ paddingLeft: 34, width: '100%' }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Filter style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                    <select value={sexFilter} onChange={e => setSexFilter(e.target.value)} className="form-input" style={{ padding: '6px 12px', minWidth: 100 }}>
                        <option value="all">{lang === 'ja' ? '全て' : 'All'}</option>
                        <option value="M">{lang === 'ja' ? '男性' : 'Male'}</option>
                        <option value="F">{lang === 'ja' ? '女性' : 'Female'}</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: 8, fontSize: '0.85rem' }}>データを読み込んでいます...</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>{lang === 'ja' ? '患者ID' : 'Patient ID'}</th>
                                <th>{lang === 'ja' ? '氏名' : 'Name'}</th>
                                <th>{lang === 'ja' ? '性別' : 'Sex'}</th>
                                <th>{lang === 'ja' ? '年齢' : 'Age'}</th>
                                <th>{lang === 'ja' ? '所属機関' : 'Organization'}</th>
                                <th>{lang === 'ja' ? '最終受診' : 'Last Visit'}</th>
                                <th>{lang === 'ja' ? '検査回数' : 'Screenings'}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => {
                                const sexDisplay = p.sex === 'male' ? 'M' : p.sex === 'female' ? 'F' : p.sex
                                const lastVisitDate = p.lastVisit ? new Date(p.lastVisit).toLocaleDateString('ja-JP') : '—'
                                return (
                                    <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.examineeId}`)}>
                                        <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>{p.patientId}</span></td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                                        </td>
                                        <td>
                                            <span className={`badge ${sexDisplay === 'M' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                                                {sexDisplay === 'M' ? (lang === 'ja' ? '男' : 'M') : (lang === 'ja' ? '女' : 'F')}
                                            </span>
                                        </td>
                                        <td>{p.age}{lang === 'ja' ? '歳' : 'y'}</td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.org}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{lastVisitDate}</td>
                                        <td style={{ textAlign: 'center' }}><span className="badge badge-neutral">{p.screeningCount}</span></td>
                                        <td>
                                            <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
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
