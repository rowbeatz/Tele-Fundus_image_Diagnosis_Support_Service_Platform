import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, CheckCircle2, XCircle, Clock, Eye, Search, Filter } from 'lucide-react'
import { api } from '../../lib/api'

interface QCItem {
    id: string
    readingId: string
    screeningId: string
    patientName: string
    physicianName: string
    organizationName: string
    submittedAt: string
    status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
    judgmentCode?: string
    findingText?: string
    reviewComment?: string
}

const statusConfig: Record<string, { color: string; bg: string; labelJa: string; labelEn: string }> = {
    pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', labelJa: 'レビュー待ち', labelEn: 'Pending Review' },
    approved: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', labelJa: '承認済', labelEn: 'Approved' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', labelJa: '差戻し', labelEn: 'Rejected' },
    revision_requested: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', labelJa: '修正依頼', labelEn: 'Revision Requested' },
}

const mockQCItems: QCItem[] = [
    { id: 'qc1', readingId: 'rd1', screeningId: 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '田中 太郎', physicianName: 'Dr. 田中 康夫', organizationName: 'さくら眼科クリニック', submittedAt: '2026-02-26 14:30', status: 'pending', judgmentCode: 'A1', findingText: '両眼とも網膜に異常所見なし。視神経乳頭・黄斑部正常。' },
    { id: 'qc2', readingId: 'rd2', screeningId: 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '佐藤 健一', physicianName: 'Dr. 佐藤 恵理子', organizationName: '東京中央病院', submittedAt: '2026-02-25 16:45', status: 'approved', judgmentCode: 'B2', findingText: '右眼に初期糖尿病網膜症（単純型）の所見あり。点状出血・硬性白斑を認める。', reviewComment: '所見・判定コード適切。' },
    { id: 'qc3', readingId: 'rd3', screeningId: 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '鈴木 花子', physicianName: 'Dr. 田中 康夫', organizationName: 'さくら眼科クリニック', submittedAt: '2026-02-26 10:15', status: 'pending', judgmentCode: 'A2', findingText: '両眼ドルーゼン散見。AMD初期の疑い。経過観察推奨。' },
    { id: 'qc4', readingId: 'rd4', screeningId: 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '山田 美咲', physicianName: 'Dr. 山本 隆志', organizationName: '東京中央病院', submittedAt: '2026-02-24 11:00', status: 'revision_requested', judgmentCode: 'C1', findingText: '左眼に緑内障性変化の疑い。', reviewComment: '視神経乳頭のC/D比の記載が必要です。画像左眼を再確認ください。' },
    { id: 'qc5', readingId: 'rd5', screeningId: 'eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '高橋 翔太', physicianName: 'Dr. 渡辺 香織', organizationName: '大阪総合医療センター', submittedAt: '2026-02-26 09:00', status: 'pending', judgmentCode: 'A1', findingText: '異常所見なし。' },
]

export default function QualityControl() {
    const lang = (localStorage.getItem('lang') || 'ja')
    const navigate = useNavigate()
    const [items, setItems] = useState<QCItem[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
    const [search, setSearch] = useState('')
    const [selectedItem, setSelectedItem] = useState<QCItem | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get('/ops-readings/qc')
                setItems(res.data)
            } catch {
                setItems(mockQCItems)
            }
        }
        load()
    }, [])

    const filtered = items.filter(item => {
        if (filter === 'pending' && item.status !== 'pending') return false
        if (filter === 'approved' && item.status !== 'approved') return false
        if (filter === 'rejected' && item.status !== 'rejected' && item.status !== 'revision_requested') return false
        if (search) {
            const q = search.toLowerCase()
            return item.patientName.toLowerCase().includes(q) || item.physicianName.toLowerCase().includes(q)
        }
        return true
    })

    const pendingCount = items.filter(i => i.status === 'pending').length
    const approvedCount = items.filter(i => i.status === 'approved').length
    const rejectedCount = items.filter(i => i.status === 'rejected' || i.status === 'revision_requested').length

    return (
        <div className="space-y-6">
            <div>
                <h1>{lang === 'ja' ? '品質管理 (QC)' : 'Quality Control'}</h1>
                <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                    {lang === 'ja' ? '提出された読影レポートの品質チェックを行います' : 'Review submitted reading reports for quality assurance'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-4">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Clock style={{ width: 24, height: 24, color: '#f59e0b' }} />
                    </div>
                    <div>
                        <div className="stat-value">{pendingCount}</div>
                        <div className="stat-label">{lang === 'ja' ? 'レビュー待ち' : 'Pending'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <CheckCircle2 style={{ width: 24, height: 24, color: '#10b981' }} />
                    </div>
                    <div>
                        <div className="stat-value">{approvedCount}</div>
                        <div className="stat-label">{lang === 'ja' ? '承認済' : 'Approved'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <XCircle style={{ width: 24, height: 24, color: '#ef4444' }} />
                    </div>
                    <div>
                        <div className="stat-value">{rejectedCount}</div>
                        <div className="stat-label">{lang === 'ja' ? '差戻し/修正' : 'Rejected'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                        <ShieldCheck style={{ width: 24, height: 24, color: '#3b82f6' }} />
                    </div>
                    <div>
                        <div className="stat-value">{items.length}</div>
                        <div className="stat-label">{lang === 'ja' ? '合計' : 'Total'}</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Filter style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '4px 12px', minHeight: 30 }}
                        onClick={() => setFilter(f)}>
                        {f === 'all' ? (lang === 'ja' ? 'すべて' : 'All') :
                            f === 'pending' ? (lang === 'ja' ? 'レビュー待ち' : 'Pending') :
                                f === 'approved' ? (lang === 'ja' ? '承認済' : 'Approved') :
                                    (lang === 'ja' ? '差戻し' : 'Rejected')}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ position: 'relative' }}>
                    <Search style={{ width: 14, height: 14, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder={lang === 'ja' ? '検索...' : 'Search...'}
                        style={{ padding: '6px 12px 6px 30px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'var(--bg-main)', color: 'var(--text-primary)', fontSize: '0.85rem', width: 200 }} />
                </div>
            </div>

            {/* QC Table */}
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>{lang === 'ja' ? '患者名' : 'Patient'}</th>
                            <th>{lang === 'ja' ? '読影医' : 'Physician'}</th>
                            <th>{lang === 'ja' ? '所見' : 'Finding'}</th>
                            <th>{lang === 'ja' ? '判定' : 'Judgment'}</th>
                            <th>{lang === 'ja' ? '提出日' : 'Submitted'}</th>
                            <th>{lang === 'ja' ? 'ステータス' : 'Status'}</th>
                            <th>{lang === 'ja' ? '操作' : 'Action'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => {
                            const sc = statusConfig[item.status]
                            return (
                                <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}>
                                    <td style={{ fontWeight: 600 }}>{item.patientName}</td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{item.physicianName}</td>
                                    <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                                        {item.findingText}
                                    </td>
                                    <td>
                                        <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)' }}>{item.judgmentCode}</span>
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{item.submittedAt}</td>
                                    <td>
                                        <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600, color: sc.color, background: sc.bg }}>
                                            {lang === 'ja' ? sc.labelJa : sc.labelEn}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 4 }}>
                                            <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '3px 8px', minHeight: 26 }}
                                                onClick={e => { e.stopPropagation(); navigate(`/viewer/${item.screeningId}`) }}>
                                                <Eye style={{ width: 12, height: 12, marginRight: 3 }} />
                                                {lang === 'ja' ? '確認' : 'View'}
                                            </button>
                                            {item.status === 'pending' && (
                                                <>
                                                    <button className="btn btn-primary" style={{ fontSize: '0.72rem', padding: '3px 8px', minHeight: 26 }}
                                                        onClick={e => { e.stopPropagation() }}>
                                                        <CheckCircle2 style={{ width: 12, height: 12, marginRight: 3 }} />
                                                        {lang === 'ja' ? '承認' : 'Approve'}
                                                    </button>
                                                    <button className="btn btn-secondary" style={{ fontSize: '0.72rem', padding: '3px 8px', minHeight: 26, color: '#ef4444' }}
                                                        onClick={e => { e.stopPropagation() }}>
                                                        <XCircle style={{ width: 12, height: 12, marginRight: 3 }} />
                                                        {lang === 'ja' ? '差戻し' : 'Reject'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Detail Panel */}
            {selectedItem && (
                <div className="panel" style={{ padding: 20 }}>
                    <h3 style={{ margin: '0 0 12px 0' }}>{lang === 'ja' ? 'レビュー詳細' : 'Review Detail'}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{lang === 'ja' ? '所見' : 'Finding'}</div>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5, padding: 12, background: 'var(--bg-main)', borderRadius: 'var(--radius)' }}>
                                {selectedItem.findingText}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{lang === 'ja' ? 'レビューコメント' : 'Review Comment'}</div>
                            <div style={{ fontSize: '0.9rem', lineHeight: 1.5, padding: 12, background: 'var(--bg-main)', borderRadius: 'var(--radius)', minHeight: 60 }}>
                                {selectedItem.reviewComment || (lang === 'ja' ? 'コメントなし' : 'No comment')}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
