import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { Stethoscope, Clock, AlertTriangle, CheckCircle2, Eye, Filter, Search, ChevronRight, User, Building2, CalendarDays } from 'lucide-react'
import { api } from '../../lib/api'

interface ReadingItem {
    id: string
    screeningId: string
    patientName: string
    patientAge: number
    patientSex: string
    organizationName: string
    screeningDate: string
    urgencyFlag: boolean
    imageCount: number
    status: string
    assignedAt: string
    dueAt?: string
}

const statusConfig: Record<string, { color: string; bg: string; labelJa: string; labelEn: string }> = {
    assigned: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', labelJa: '未読影', labelEn: 'Pending' },
    in_progress: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', labelJa: '読影中', labelEn: 'In Progress' },
    draft: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', labelJa: '下書き', labelEn: 'Draft' },
    submitted: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', labelJa: '提出済', labelEn: 'Submitted' },
    completed: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', labelJa: '完了', labelEn: 'Completed' },
}

// Mock data matching seed database
const mockReadingQueue: ReadingItem[] = [
    { id: 'r1', screeningId: 'eeee2222-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '鈴木 花子', patientAge: 53, patientSex: 'F', organizationName: 'さくら眼科クリニック', screeningDate: '2026-02-20', urgencyFlag: false, imageCount: 2, status: 'assigned', assignedAt: '2026-02-21 09:00' },
    { id: 'r2', screeningId: 'eeee3333-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '伊藤 美穂', patientAge: 70, patientSex: 'F', organizationName: 'さくら眼科クリニック', screeningDate: '2026-02-21', urgencyFlag: true, imageCount: 2, status: 'assigned', assignedAt: '2026-02-21 15:00', dueAt: '2026-02-22 09:00' },
    { id: 'r3', screeningId: 'eeee5555-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '山田 美咲', patientAge: 46, patientSex: 'F', organizationName: '東京中央病院', screeningDate: '2026-02-23', urgencyFlag: false, imageCount: 2, status: 'in_progress', assignedAt: '2026-02-23 14:00' },
    { id: 'r4', screeningId: 'eeee6666-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '渡辺 大輔', patientAge: 77, patientSex: 'M', organizationName: '東京中央病院', screeningDate: '2026-02-24', urgencyFlag: true, imageCount: 2, status: 'assigned', assignedAt: '2026-02-24 10:30', dueAt: '2026-02-25 09:00' },
    { id: 'r5', screeningId: 'eeee7777-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '高橋 翔太', patientAge: 35, patientSex: 'M', organizationName: '大阪総合医療センター', screeningDate: '2026-02-25', urgencyFlag: false, imageCount: 2, status: 'draft', assignedAt: '2026-02-25 11:00' },
    { id: 'r6', screeningId: 'eeee9999-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '小林 誠', patientAge: 50, patientSex: 'M', organizationName: '大阪総合医療センター', screeningDate: '2026-02-26', urgencyFlag: true, imageCount: 2, status: 'assigned', assignedAt: '2026-02-26 09:00', dueAt: '2026-02-26 17:00' },
    { id: 'r7', screeningId: 'eeee1111-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '田中 太郎', patientAge: 60, patientSex: 'M', organizationName: 'さくら眼科クリニック', screeningDate: '2026-02-20', urgencyFlag: false, imageCount: 2, status: 'completed', assignedAt: '2026-02-20 10:00' },
    { id: 'r8', screeningId: 'eeee4444-eeee-eeee-eeee-eeeeeeeeeeee', patientName: '佐藤 健一', patientAge: 67, patientSex: 'M', organizationName: '東京中央病院', screeningDate: '2026-02-22', urgencyFlag: false, imageCount: 2, status: 'completed', assignedAt: '2026-02-22 09:00' },
]

export default function ReadingQueue() {
    useTranslation()
    const navigate = useNavigate()
    const lang = (localStorage.getItem('lang') || 'ja')
    const [readings, setReadings] = useState<ReadingItem[]>([])
    const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all')
    const [search, setSearch] = useState('')

    useEffect(() => {
        // Try API first, fallback to mock
        const load = async () => {
            try {
                const res = await api.get('/ops-readings')
                setReadings(res.data)
            } catch {
                setReadings(mockReadingQueue)
            }
        }
        load()
    }, [])

    const filtered = readings.filter(r => {
        if (filter === 'pending' && r.status !== 'assigned') return false
        if (filter === 'in_progress' && r.status !== 'in_progress' && r.status !== 'draft') return false
        if (filter === 'completed' && r.status !== 'completed' && r.status !== 'submitted') return false
        if (search) {
            const q = search.toLowerCase()
            return r.patientName.toLowerCase().includes(q) || r.organizationName.toLowerCase().includes(q)
        }
        return true
    })

    const pendingCount = readings.filter(r => r.status === 'assigned').length
    const urgentCount = readings.filter(r => r.urgencyFlag && r.status !== 'completed').length
    const completedToday = readings.filter(r => r.status === 'completed').length

    return (
        <div className="space-y-6">
            <div>
                <h1>{lang === 'ja' ? '読影キュー' : 'Reading Queue'}</h1>
                <p style={{ marginTop: 4, color: 'var(--text-muted)' }}>
                    {lang === 'ja' ? '割り当てられた症例を読影します' : 'Review assigned screening cases'}
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
                        <div className="stat-label">{lang === 'ja' ? '未読影' : 'Pending'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <AlertTriangle style={{ width: 24, height: 24, color: '#ef4444' }} />
                    </div>
                    <div>
                        <div className="stat-value">{urgentCount}</div>
                        <div className="stat-label">{lang === 'ja' ? '緊急' : 'Urgent'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <CheckCircle2 style={{ width: 24, height: 24, color: '#10b981' }} />
                    </div>
                    <div>
                        <div className="stat-value">{completedToday}</div>
                        <div className="stat-label">{lang === 'ja' ? '完了済' : 'Completed'}</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                        <Stethoscope style={{ width: 24, height: 24, color: '#3b82f6' }} />
                    </div>
                    <div>
                        <div className="stat-value">{readings.length}</div>
                        <div className="stat-label">{lang === 'ja' ? '合計' : 'Total'}</div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <Filter style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                {(['all', 'pending', 'in_progress', 'completed'] as const).map(f => (
                    <button
                        key={f}
                        className={`btn ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.8rem', padding: '4px 12px', minHeight: 30 }}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? (lang === 'ja' ? 'すべて' : 'All') :
                            f === 'pending' ? (lang === 'ja' ? '未読影' : 'Pending') :
                                f === 'in_progress' ? (lang === 'ja' ? '進行中' : 'In Progress') :
                                    (lang === 'ja' ? '完了' : 'Completed')}
                    </button>
                ))}
                <div style={{ flex: 1 }} />
                <div style={{ position: 'relative' }}>
                    <Search style={{ width: 14, height: 14, position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={lang === 'ja' ? '患者名で検索...' : 'Search patient...'}
                        style={{
                            padding: '6px 12px 6px 30px', border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)', background: 'var(--bg-main)',
                            color: 'var(--text-primary)', fontSize: '0.85rem', width: 200,
                        }}
                    />
                </div>
            </div>

            {/* Reading Queue List */}
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}></th>
                            <th>{lang === 'ja' ? '患者名' : 'Patient'}</th>
                            <th>{lang === 'ja' ? '医療機関' : 'Organization'}</th>
                            <th>{lang === 'ja' ? '検査日' : 'Screening Date'}</th>
                            <th>{lang === 'ja' ? '画像数' : 'Images'}</th>
                            <th>{lang === 'ja' ? 'ステータス' : 'Status'}</th>
                            <th>{lang === 'ja' ? '操作' : 'Action'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(r => {
                            const sc = statusConfig[r.status] || statusConfig.assigned
                            return (
                                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/viewer/${r.screeningId}`)}>
                                    <td>
                                        {r.urgencyFlag && (
                                            <AlertTriangle style={{ width: 16, height: 16, color: '#ef4444' }} />
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <User style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{r.patientName}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {r.patientAge}{lang === 'ja' ? '歳' : 'y'} / {r.patientSex === 'M' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Building2 style={{ width: 12, height: 12, color: 'var(--text-muted)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.85rem' }}>{r.organizationName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <CalendarDays style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                                            <span style={{ fontSize: '0.85rem' }}>{r.screeningDate}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Eye style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                                            <span>{r.imageCount}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 600,
                                            color: sc.color, background: sc.bg,
                                        }}>
                                            {lang === 'ja' ? sc.labelJa : sc.labelEn}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-primary"
                                            style={{ fontSize: '0.75rem', padding: '4px 12px', minHeight: 28 }}
                                            onClick={e => { e.stopPropagation(); navigate(`/viewer/${r.screeningId}`) }}
                                        >
                                            {r.status === 'completed'
                                                ? (lang === 'ja' ? '確認' : 'Review')
                                                : (lang === 'ja' ? '読影開始' : 'Start Reading')
                                            }
                                            <ChevronRight style={{ width: 14, height: 14, marginLeft: 2 }} />
                                        </button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                        {lang === 'ja' ? '該当する症例がありません' : 'No matching cases found'}
                    </div>
                )}
            </div>
        </div>
    )
}
