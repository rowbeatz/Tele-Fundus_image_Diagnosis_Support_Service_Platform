import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { Search, Plus, ChevronRight, Users, Filter } from 'lucide-react'

// ─── Mock Patients ─────────────────────────────────────────────
const mockPatients = [
    { id: 'PT-20260001', name: '田中 太郎', nameKana: 'タナカ タロウ', sex: 'M', dob: '1958-03-15', age: 68, org: 'さくら眼科クリニック', lastVisit: '2026-02-26', screenings: 5, status: 'active' },
    { id: 'PT-20260002', name: '鈴木 花子', nameKana: 'スズキ ハナコ', sex: 'F', dob: '1972-07-22', age: 53, org: '東京中央病院', lastVisit: '2026-02-25', screenings: 3, status: 'active' },
    { id: 'PT-20260003', name: '佐藤 健一', nameKana: 'サトウ ケンイチ', sex: 'M', dob: '1945-11-03', age: 80, org: 'さくら眼科クリニック', lastVisit: '2026-02-24', screenings: 12, status: 'active' },
    { id: 'PT-20260004', name: '山田 美咲', nameKana: 'ヤマダ ミサキ', sex: 'F', dob: '1989-01-30', age: 37, org: '大阪総合医療センター', lastVisit: '2026-02-20', screenings: 1, status: 'active' },
    { id: 'PT-20260005', name: '高橋 翔太', nameKana: 'タカハシ ショウタ', sex: 'M', dob: '1965-09-12', age: 60, org: '東京中央病院', lastVisit: '2026-01-15', screenings: 8, status: 'active' },
    { id: 'PT-20260006', name: '伊藤 真理', nameKana: 'イトウ マリ', sex: 'F', dob: '1950-04-08', age: 75, org: 'さくら眼科クリニック', lastVisit: '2026-02-10', screenings: 6, status: 'active' },
    { id: 'PT-20260007', name: '渡辺 大輔', nameKana: 'ワタナベ ダイスケ', sex: 'M', dob: '1978-12-25', age: 47, org: '大阪総合医療センター', lastVisit: '2026-02-18', screenings: 2, status: 'active' },
]

export default function PatientList() {
    const navigate = useNavigate()
    const { t, lang } = useTranslation()
    const [search, setSearch] = useState('')
    const [sexFilter, setSexFilter] = useState<string>('all')

    const filtered = mockPatients.filter(p => {
        const q = search.toLowerCase()
        const matchSearch = !q || p.name.includes(search) || p.nameKana.includes(search) || p.id.toLowerCase().includes(q)
        const matchSex = sexFilter === 'all' || p.sex === sexFilter
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
                        {lang === 'ja' ? `${filtered.length} 名の患者が登録されています` : `${filtered.length} patients registered`}
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
                        placeholder={lang === 'ja' ? '氏名・ID・カナで検索…' : 'Search by name, ID, or kana…'}
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
                        {filtered.map(p => (
                            <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/patients/${p.id}`)}>
                                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)' }}>{p.id}</span></td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.nameKana}</div>
                                </td>
                                <td>
                                    <span className={`badge ${p.sex === 'M' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                                        {p.sex === 'M' ? (lang === 'ja' ? '男' : 'M') : (lang === 'ja' ? '女' : 'F')}
                                    </span>
                                </td>
                                <td>{p.age}{lang === 'ja' ? '歳' : 'y'}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{p.org}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.lastVisit}</td>
                                <td style={{ textAlign: 'center' }}><span className="badge badge-neutral">{p.screenings}</span></td>
                                <td>
                                    <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
