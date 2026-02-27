import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import {
    ArrowLeft, User, Heart, Pill, Eye, Activity, Clock,
    Plus, FileText, ChevronDown, ChevronUp
} from 'lucide-react'

// ─── Mock Patient Detail ────────────────────────────────────
const mockDetail = {
    id: 'PT-20260001',
    name: '田中 太郎',
    nameKana: 'タナカ タロウ',
    sex: 'M',
    dob: '1958-03-15',
    age: 68,
    bloodType: 'A+',
    ethnicity: '日本人',
    insuranceId: '1234-5678-9012',
    org: 'さくら眼科クリニック',
    medicalHistory: [
        { condition: '2型糖尿病', since: '2010', status: 'active', note: 'HbA1c 7.2%' },
        { condition: '高血圧', since: '2015', status: 'active', note: 'アムロジピン 5mg' },
        { condition: '脂質異常症', since: '2018', status: 'active', note: '' },
    ],
    ocularHistory: [
        { condition: '糖尿病網膜症（単純型）', since: '2020', eye: 'both', status: 'monitoring' },
        { condition: '白内障（初期）', since: '2023', eye: 'both', status: 'monitoring' },
    ],
    medications: [
        { name: 'メトホルミン', dosage: '500mg', frequency: '1日2回', since: '2010-04' },
        { name: 'アムロジピン', dosage: '5mg', frequency: '1日1回', since: '2015-08' },
        { name: 'アトルバスタチン', dosage: '10mg', frequency: '1日1回', since: '2018-03' },
        { name: 'ラタノプロスト点眼液', dosage: '0.005%', frequency: '就寝前1回', since: '2022-11' },
    ],
    allergies: ['ペニシリン系抗菌薬'],
    familyHistory: [
        { relation: '父', condition: '2型糖尿病' },
        { relation: '母', condition: '緑内障' },
    ],
    screenings: [
        { id: 'SCR-001', date: '2026-02-26', status: 'in_reading', physician: 'Dr. 田中', images: 4 },
        { id: 'SCR-002', date: '2025-08-15', status: 'completed', physician: 'Dr. 佐藤', images: 2 },
        { id: 'SCR-003', date: '2025-02-10', status: 'completed', physician: 'Dr. 田中', images: 2 },
        { id: 'SCR-004', date: '2024-08-05', status: 'completed', physician: 'Dr. 佐藤', images: 4 },
        { id: 'SCR-005', date: '2024-02-01', status: 'completed', physician: 'Dr. 田中', images: 2 },
    ],
}

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
    const map: Record<string, string> = { active: 'badge-success', monitoring: 'badge-warning', resolved: 'badge-neutral', completed: 'badge-success', in_reading: 'badge-warning', submitted: 'badge-info' }
    return map[s] || 'badge-neutral'
}

export default function PatientDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { lang } = useTranslation()
    const p = mockDetail

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
                        <span className={`badge ${p.sex === 'M' ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                            {p.sex === 'M' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')}
                        </span>
                    </h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {p.id} · {p.nameKana} · {p.age}{lang === 'ja' ? '歳' : 'y'} · DOB: {p.dob}
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate(`/screenings/new/${p.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus style={{ width: 16, height: 16 }} />
                    {lang === 'ja' ? '新規検査' : 'New Screening'}
                </button>
            </div>

            {/* Basic Info */}
            <Section title={lang === 'ja' ? '基本情報' : 'Basic Information'} icon={<User style={{ width: 18, height: 18, color: 'var(--primary)' }} />}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {[
                        [lang === 'ja' ? '患者ID' : 'Patient ID', p.id],
                        [lang === 'ja' ? '氏名' : 'Name', p.name],
                        [lang === 'ja' ? 'フリガナ' : 'Kana', p.nameKana],
                        [lang === 'ja' ? '生年月日' : 'DOB', p.dob],
                        [lang === 'ja' ? '年齢' : 'Age', `${p.age}${lang === 'ja' ? '歳' : 'y'}`],
                        [lang === 'ja' ? '性別' : 'Sex', p.sex === 'M' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')],
                        [lang === 'ja' ? '血液型' : 'Blood Type', p.bloodType],
                        [lang === 'ja' ? '民族' : 'Ethnicity', p.ethnicity],
                        [lang === 'ja' ? '保険証番号' : 'Insurance ID', p.insuranceId],
                        [lang === 'ja' ? '所属機関' : 'Organization', p.org],
                    ].map(([label, val], i) => (
                        <div key={i}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                            <div style={{ fontWeight: 500 }}>{val}</div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Medical History */}
            <Section title={lang === 'ja' ? '既往歴' : 'Medical History'} icon={<Heart style={{ width: 18, height: 18, color: '#ef4444' }} />}>
                {p.medicalHistory.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? '既往歴なし' : 'No medical history'}</p>
                ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead><tr><th>{lang === 'ja' ? '疾患名' : 'Condition'}</th><th>{lang === 'ja' ? '発症年' : 'Since'}</th><th>{lang === 'ja' ? '状態' : 'Status'}</th><th>{lang === 'ja' ? '備考' : 'Note'}</th></tr></thead>
                        <tbody>
                            {p.medicalHistory.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{h.condition}</td>
                                    <td>{h.since}</td>
                                    <td><span className={`badge ${statusBadge(h.status)}`}>{h.status}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{h.note || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {/* Ocular History */}
            <Section title={lang === 'ja' ? '眼科既往歴' : 'Ocular History'} icon={<Eye style={{ width: 18, height: 18, color: '#3b82f6' }} />}>
                {p.ocularHistory.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? '眼科既往歴なし' : 'No ocular history'}</p>
                ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead><tr><th>{lang === 'ja' ? '疾患名' : 'Condition'}</th><th>{lang === 'ja' ? '発症年' : 'Since'}</th><th>{lang === 'ja' ? '対象眼' : 'Eye'}</th><th>{lang === 'ja' ? '状態' : 'Status'}</th></tr></thead>
                        <tbody>
                            {p.ocularHistory.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{h.condition}</td>
                                    <td>{h.since}</td>
                                    <td>{h.eye === 'both' ? (lang === 'ja' ? '両眼' : 'Both') : h.eye === 'right' ? (lang === 'ja' ? '右' : 'R') : (lang === 'ja' ? '左' : 'L')}</td>
                                    <td><span className={`badge ${statusBadge(h.status)}`}>{h.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {/* Medications */}
            <Section title={lang === 'ja' ? '服薬歴' : 'Medications'} icon={<Pill style={{ width: 18, height: 18, color: '#10b981' }} />}>
                {p.medications.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? '服薬なし' : 'No medications'}</p>
                ) : (
                    <table className="data-table" style={{ fontSize: '0.85rem' }}>
                        <thead><tr><th>{lang === 'ja' ? '薬剤名' : 'Medication'}</th><th>{lang === 'ja' ? '用量' : 'Dosage'}</th><th>{lang === 'ja' ? '頻度' : 'Frequency'}</th><th>{lang === 'ja' ? '開始' : 'Since'}</th></tr></thead>
                        <tbody>
                            {p.medications.map((m, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                                    <td>{m.dosage}</td>
                                    <td>{m.frequency}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{m.since}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Section>

            {/* Allergies & Family History */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Section title={lang === 'ja' ? 'アレルギー' : 'Allergies'} icon={<Activity style={{ width: 18, height: 18, color: '#f59e0b' }} />}>
                    {p.allergies.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? 'アレルギーなし' : 'No known allergies'}</p>
                    ) : (
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {p.allergies.map((a, i) => <li key={i} style={{ padding: '2px 0' }}>{a}</li>)}
                        </ul>
                    )}
                </Section>
                <Section title={lang === 'ja' ? '家族歴' : 'Family History'} icon={<User style={{ width: 18, height: 18, color: '#8b5cf6' }} />}>
                    {p.familyHistory.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? '家族歴なし' : 'No family history'}</p>
                    ) : (
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                            {p.familyHistory.map((f, i) => <li key={i} style={{ padding: '2px 0' }}>{f.relation}: {f.condition}</li>)}
                        </ul>
                    )}
                </Section>
            </div>

            {/* Screening History */}
            <Section title={lang === 'ja' ? '検査履歴' : 'Screening History'} icon={<Clock style={{ width: 18, height: 18, color: '#0d9488' }} />}>
                <table className="data-table" style={{ fontSize: '0.85rem' }}>
                    <thead><tr>
                        <th>{lang === 'ja' ? '検査ID' : 'Screening ID'}</th>
                        <th>{lang === 'ja' ? '実施日' : 'Date'}</th>
                        <th>{lang === 'ja' ? '状態' : 'Status'}</th>
                        <th>{lang === 'ja' ? '担当医' : 'Physician'}</th>
                        <th>{lang === 'ja' ? '画像数' : 'Images'}</th>
                        <th></th>
                    </tr></thead>
                    <tbody>
                        {p.screenings.map(s => (
                            <tr key={s.id}>
                                <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{s.id}</span></td>
                                <td>{s.date}</td>
                                <td><span className={`badge ${statusBadge(s.status)}`}>{s.status}</span></td>
                                <td>{s.physician}</td>
                                <td style={{ textAlign: 'center' }}>{s.images}</td>
                                <td>
                                    <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }} onClick={() => navigate(`/viewer/${s.id}`)}>
                                        <FileText style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '表示' : 'View'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>
        </div>
    )
}
