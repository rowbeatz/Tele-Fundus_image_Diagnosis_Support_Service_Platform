import { useState } from 'react'
import {
    User, Heart, Pill, Eye, Activity, FileText,
    ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react'

interface ClinicalData {
    patient: {
        patientId: string; name: string; age: number; sex: string;
        dob: string; ethnicity: string; bloodType: string;
    }
    chiefComplaint: string
    symptoms: string[]
    medicalHistory: { condition: string; since: string; status: string }[]
    ocularHistory: { condition: string; since: string; eye: string }[]
    medications: { name: string; dosage: string; frequency: string }[]
    allergies: string[]
    ophthalmicExam: {
        vaRight: string; vaLeft: string;
        iopRight: number; iopLeft: number;
        anteriorFindings: string;
    }
    systemic: {
        bpSystolic: number; bpDiastolic: number;
        hba1c: number; smokingStatus: string;
        hasDiabetes: boolean; hasHypertension: boolean;
    }
}

// Mock data for demo
const mockClinical: ClinicalData = {
    patient: { patientId: 'PT-20260001', name: '田中 太郎', age: 68, sex: 'M', dob: '1958-03-15', ethnicity: '日本人', bloodType: 'A+' },
    chiefComplaint: '右眼の視力低下が1週間前から徐々に進行している。飛蚊症の自覚もあり。',
    symptoms: ['視力低下', '飛蚊症'],
    medicalHistory: [
        { condition: '2型糖尿病', since: '2010', status: 'active' },
        { condition: '高血圧', since: '2015', status: 'active' },
        { condition: '脂質異常症', since: '2018', status: 'active' },
    ],
    ocularHistory: [
        { condition: '糖尿病網膜症（単純型）', since: '2020', eye: '両眼' },
        { condition: '白内障（初期）', since: '2023', eye: '両眼' },
    ],
    medications: [
        { name: 'メトホルミン', dosage: '500mg', frequency: '1日2回' },
        { name: 'アムロジピン', dosage: '5mg', frequency: '1日1回' },
        { name: 'ラタノプロスト点眼', dosage: '0.005%', frequency: '就寝前1回' },
    ],
    allergies: ['ペニシリン系抗菌薬'],
    ophthalmicExam: { vaRight: '0.7 (1.0×)', vaLeft: '1.0 (1.2×)', iopRight: 14, iopLeft: 16, anteriorFindings: '両眼 水晶体軽度混濁' },
    systemic: { bpSystolic: 142, bpDiastolic: 88, hba1c: 7.2, smokingStatus: '禁煙済', hasDiabetes: true, hasHypertension: true },
}

function Accordion({ title, icon, children, defaultOpen = false, alert: isAlert }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; alert?: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={() => setOpen(!open)} style={{
                width: '100%', padding: '8px 10px', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontSize: '0.78rem', fontWeight: 600,
            }}>
                {icon}
                <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
                {isAlert && <AlertTriangle style={{ width: 12, height: 12, color: '#f59e0b' }} />}
                {open ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
            </button>
            {open && <div style={{ padding: '4px 10px 10px', fontSize: '0.78rem' }}>{children}</div>}
        </div>
    )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>{label}</span>
            <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? '#ef4444' : 'var(--text)' }}>{value}</span>
        </div>
    )
}

export function ClinicalInfoPanel({ lang }: { lang: string }) {
    const d = mockClinical

    return (
        <div className="clinical-info-panel" style={{
            height: '100%', overflow: 'auto', background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)',
        }}>
            {/* Patient Header */}
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'rgba(13,148,136,0.05)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.patient.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                    {d.patient.patientId} · {d.patient.age}{lang === 'ja' ? '歳' : 'y'} · {d.patient.sex === 'M' ? (lang === 'ja' ? '男性' : 'M') : (lang === 'ja' ? '女性' : 'F')}
                </div>
            </div>

            {/* Chief Complaint */}
            <Accordion title={lang === 'ja' ? '主訴・症状' : 'Chief Complaint'} icon={<FileText style={{ width: 14, height: 14, color: '#ef4444' }} />} defaultOpen={true} alert={true}>
                <div style={{ background: 'rgba(239,68,68,0.06)', padding: '6px 8px', borderRadius: 4, marginBottom: 6, lineHeight: 1.5 }}>
                    {d.chiefComplaint}
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {d.symptoms.map((s, i) => (
                        <span key={i} className="badge badge-warning" style={{ fontSize: '0.65rem' }}>{s}</span>
                    ))}
                </div>
            </Accordion>

            {/* Basic Info */}
            <Accordion title={lang === 'ja' ? '基本情報' : 'Demographics'} icon={<User style={{ width: 14, height: 14, color: 'var(--primary)' }} />}>
                <InfoRow label={lang === 'ja' ? '生年月日' : 'DOB'} value={d.patient.dob} />
                <InfoRow label={lang === 'ja' ? '民族' : 'Ethnicity'} value={d.patient.ethnicity} />
                <InfoRow label={lang === 'ja' ? '血液型' : 'Blood Type'} value={d.patient.bloodType} />
            </Accordion>

            {/* Ophthalmic Exam */}
            <Accordion title={lang === 'ja' ? '眼科検査' : 'Ophthalmic Exam'} icon={<Eye style={{ width: 14, height: 14, color: '#3b82f6' }} />} defaultOpen={true}>
                <InfoRow label={lang === 'ja' ? '視力 R' : 'VA R'} value={d.ophthalmicExam.vaRight} />
                <InfoRow label={lang === 'ja' ? '視力 L' : 'VA L'} value={d.ophthalmicExam.vaLeft} />
                <InfoRow label={lang === 'ja' ? '眼圧 R' : 'IOP R'} value={`${d.ophthalmicExam.iopRight} mmHg`} />
                <InfoRow label={lang === 'ja' ? '眼圧 L' : 'IOP L'} value={`${d.ophthalmicExam.iopLeft} mmHg`} />
                <div style={{ marginTop: 4 }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? '前眼部' : 'Anterior'}: </span>
                    <span>{d.ophthalmicExam.anteriorFindings}</span>
                </div>
            </Accordion>

            {/* Systemic */}
            <Accordion title={lang === 'ja' ? '全身状態' : 'Systemic'} icon={<Activity style={{ width: 14, height: 14, color: '#ef4444' }} />} defaultOpen={true} alert={d.systemic.hasDiabetes}>
                <InfoRow label={lang === 'ja' ? '血圧' : 'BP'} value={`${d.systemic.bpSystolic}/${d.systemic.bpDiastolic}`} highlight={d.systemic.bpSystolic > 140} />
                <InfoRow label="HbA1c" value={`${d.systemic.hba1c}%`} highlight={d.systemic.hba1c > 7.0} />
                <InfoRow label={lang === 'ja' ? '糖尿病' : 'DM'} value={d.systemic.hasDiabetes ? '✓' : '—'} highlight={d.systemic.hasDiabetes} />
                <InfoRow label={lang === 'ja' ? '高血圧' : 'HTN'} value={d.systemic.hasHypertension ? '✓' : '—'} highlight={d.systemic.hasHypertension} />
                <InfoRow label={lang === 'ja' ? '喫煙' : 'Smoking'} value={d.systemic.smokingStatus} />
            </Accordion>

            {/* Medical History */}
            <Accordion title={lang === 'ja' ? '既往歴' : 'Medical History'} icon={<Heart style={{ width: 14, height: 14, color: '#ef4444' }} />}>
                {d.medicalHistory.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>{h.condition}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{h.since}〜</span>
                    </div>
                ))}
            </Accordion>

            {/* Ocular History */}
            <Accordion title={lang === 'ja' ? '眼科既往歴' : 'Ocular History'} icon={<Eye style={{ width: 14, height: 14, color: '#3b82f6' }} />}>
                {d.ocularHistory.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                        <span>{h.condition}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{h.eye}</span>
                    </div>
                ))}
            </Accordion>

            {/* Medications */}
            <Accordion title={lang === 'ja' ? `服薬 (${d.medications.length})` : `Medications (${d.medications.length})`} icon={<Pill style={{ width: 14, height: 14, color: '#10b981' }} />}>
                {d.medications.map((m, i) => (
                    <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontWeight: 500 }}>{m.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{m.dosage} · {m.frequency}</div>
                    </div>
                ))}
            </Accordion>

            {/* Allergies */}
            <Accordion title={lang === 'ja' ? 'アレルギー' : 'Allergies'} icon={<AlertTriangle style={{ width: 14, height: 14, color: '#f59e0b' }} />} alert={d.allergies.length > 0}>
                {d.allergies.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? 'なし' : 'None'}</span>
                ) : (
                    d.allergies.map((a, i) => (
                        <span key={i} className="badge badge-warning" style={{ fontSize: '0.65rem', marginRight: 4 }}>{a}</span>
                    ))
                )}
            </Accordion>
        </div>
    )
}
