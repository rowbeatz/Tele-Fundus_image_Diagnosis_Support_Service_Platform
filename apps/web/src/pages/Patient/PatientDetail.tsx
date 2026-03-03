import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import {
    ArrowLeft, User, Heart, Eye, Clock,
    Plus, FileText, ChevronDown, ChevronUp, Loader2
} from 'lucide-react'
import { fetchScreenings, type ScreeningListItem } from '../../lib/screeningApi'

function Section({ title, icon, children, defaultOpen = true }: { title: string, icon: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className="panel" style={{ overflow: 'hidden' }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '14px 16px',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)',
                    fontWeight: 600, fontSize: '0.95rem', borderBottom: open ? '1px solid var(--border)' : 'none'
                }}
            >
                {icon}
                {title}
                <span style={{ marginLeft: 'auto' }}>
                    {open ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
                </span>
            </button>
            {open && <div style={{ padding: '16px' }}>{children}</div>}
        </div>
    )
}

const statusBadge = (s: string) => {
    const map: Record<string, string> = { active: 'badge-success', monitoring: 'badge-warning', resolved: 'badge-neutral', completed: 'badge-success', in_reading: 'badge-warning', submitted: 'badge-info', saved: 'badge-info', confirmed: 'badge-success' }
    return map[s] || 'badge-neutral'
}

export default function PatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { lang } = useTranslation()

    const [loading, setLoading] = useState(true)
    const [patient, setPatient] = useState<{
        id: string; patientId: string; name: string; sex: string; age: number; birthDate: string; org: string
    } | null>(null)
    const [patientScreenings, setPatientScreenings] = useState<ScreeningListItem[]>([])

    useEffect(() => {
        let cancelled = false
        const load = async () => {
            try {
                // Fetch all screenings and find ones for this patient
                const allScreenings = await fetchScreenings()
                if (cancelled) return

                // Find screenings for this patient by examineeId
                const myScreenings = allScreenings.filter(s => s.examineeId === id)
                if (myScreenings.length > 0) {
                    const first = myScreenings[0]
                    setPatient({
                        id: first.examineeId,
                        patientId: first.patientId,
                        name: first.patientName,
                        sex: first.sex,
                        age: first.age,
                        birthDate: first.birthDate,
                        org: first.organizationName,
                    })
                    setPatientScreenings(myScreenings)
                }
                setLoading(false)
            } catch (err) {
                console.error('Failed to load patient:', err)
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [id])

    if (loading) {
        return (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                <Loader2 style={{ width: 32, height: 32, animation: 'spin 1s linear infinite' }} />
                <p style={{ marginTop: 12 }}>データを読み込んでいます...</p>
            </div>
        )
    }

    if (!patient) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <p style={{ color: '#ef4444' }}>{lang === 'ja' ? '患者が見つかりませんでした' : 'Patient not found'}</p>
                <button className="btn btn-secondary" onClick={() => navigate('/patients')} style={{ marginTop: 16 }}>
                    {lang === 'ja' ? '一覧に戻る' : 'Back to List'}
                </button>
            </div>
        )
    }

    const p = patient
    const sexLabel = p.sex === 'male' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')
    const sexBadge = p.sex === 'male' ? 'badge-info' : 'badge-warning'
    const dobStr = p.birthDate ? new Date(p.birthDate).toLocaleDateString('ja-JP') : '—'

    return (
        <div className="space-y-5">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => navigate('/patients')} style={{ padding: '6px 10px', minHeight: 32 }}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>
                <div style={{ flex: 1 }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.4rem' }}>
                        {p.name}
                        <span className={`badge ${sexBadge}`} style={{ fontSize: '0.7rem' }}>
                            {sexLabel}
                        </span>
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {p.patientId} · {p.age}{lang === 'ja' ? '歳' : 'y'} · DOB: {dobStr}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate(`/uploads`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus style={{ width: 16, height: 16 }} />
                    {lang === 'ja' ? '新規検査' : 'New Screening'}
                </button>
            </div>

            {/* Basic Info */}
            <Section title={lang === 'ja' ? '基本情報' : 'Basic Information'} icon={<User style={{ width: 18, height: 18, color: 'var(--primary)' }} />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        [lang === 'ja' ? '患者ID' : 'Patient ID', p.patientId],
                        [lang === 'ja' ? '氏名' : 'Name', p.name],
                        [lang === 'ja' ? '生年月日' : 'DOB', dobStr],
                        [lang === 'ja' ? '年齢' : 'Age', `${p.age}${lang === 'ja' ? '歳' : 'y'}`],
                        [lang === 'ja' ? '性別' : 'Sex', sexLabel],
                        [lang === 'ja' ? '所属機関' : 'Organization', p.org],
                    ].map(([label, val], i) => (
                        <div key={i}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                            <div style={{ fontWeight: 500 }}>{val}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Medical & Ocular History (from DB if available) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Section title={lang === 'ja' ? '既往歴' : 'Medical History'} icon={<Heart style={{ width: 18, height: 18, color: '#ef4444' }} />}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {patientScreenings.some(s => s.hasDiabetes) && <span className="badge badge-warning" style={{ marginRight: 6 }}>{lang === 'ja' ? '糖尿病' : 'Diabetes'}</span>}
                        {patientScreenings.some(s => (s.bloodPressureSystolic || 0) >= 140) && <span className="badge badge-warning" style={{ marginRight: 6 }}>{lang === 'ja' ? '高血圧' : 'Hypertension'}</span>}
                        {!patientScreenings.some(s => s.hasDiabetes) && !patientScreenings.some(s => (s.bloodPressureSystolic || 0) >= 140) && (lang === 'ja' ? '特記すべき既往歴なし' : 'No notable medical history')}
                    </p>
                </Section>
                <Section title={lang === 'ja' ? '眼科既往歴' : 'Ocular History'} icon={<Eye style={{ width: 18, height: 18, color: '#3b82f6' }} />}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {lang === 'ja' ? 'データベースから取得中...' : 'Loading from database...'}
                    </p>
                </Section>
            </div>

            {/* Screening History */}
            <Section title={lang === 'ja' ? '検査履歴' : 'Screening History'} icon={<Clock style={{ width: 18, height: 18, color: '#0d9488' }} />}>
                {patientScreenings.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? '検査履歴なし' : 'No screening history'}</p>
                ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead><tr>
                            <th>{lang === 'ja' ? '検査ID' : 'Screening ID'}</th>
                            <th>{lang === 'ja' ? '実施日' : 'Date'}</th>
                            <th>{lang === 'ja' ? '状態' : 'Status'}</th>
                            <th>{lang === 'ja' ? '画像数' : 'Images'}</th>
                            <th>{lang === 'ja' ? '糖尿病' : 'DM'}</th>
                            <th>{lang === 'ja' ? '血圧' : 'BP'}</th>
                            <th></th>
                        </tr></thead>
                        <tbody>
                            {patientScreenings.map(s => (
                                <tr key={s.id}>
                                    <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{s.id.slice(0, 8)}</span></td>
                                    <td>{new Date(s.screeningDate).toLocaleDateString('ja-JP')}</td>
                                    <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                                    <td style={{ textAlign: 'center' }}>{s.imageCount}</td>
                                    <td>{s.hasDiabetes ? '✓' : '—'}</td>
                                    <td>{s.bloodPressureSystolic && s.bloodPressureDiastolic ? `${s.bloodPressureSystolic}/${s.bloodPressureDiastolic}` : '—'}</td>
                                    <td>
                                        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }} onClick={() => navigate(`/viewer/${s.id}`)}>
                                            <FileText style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '表示' : 'View'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>
        </div>
    )
}
