import { useState, useEffect, useCallback, useMemo } from 'react'
import type { ViewerData } from '../../lib/viewer-api'
import {
    User, Heart, Pill, Eye, Activity, FileText,
    ChevronDown, ChevronUp, AlertTriangle, Building2, Save, Settings
} from 'lucide-react'

interface ClinicalData {
    patient: {
        patientId: string; name: string; age: number; sex: string;
        dob: string; ethnicity: string; bloodType: string;
    }
    referral: {
        facility: string; doctor: string; phone: string;
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
    referral: { facility: 'さくら眼科クリニック', doctor: '佐藤 一郎', phone: '03-1234-5678' },
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

// ─── Accordion section keys ─────────────────────────────────
type SectionKey = 'chief' | 'referral' | 'demographics' | 'ophthalmic' | 'systemic' | 'history' | 'ocularHistory' | 'medications' | 'allergies'

const STORAGE_KEY = 'viewer_accordion_defaults'

const FACTORY_DEFAULTS: Record<SectionKey, boolean> = {
    chief: true,
    referral: false,
    demographics: false,
    ophthalmic: true,
    systemic: true,
    history: false,
    ocularHistory: false,
    medications: false,
    allergies: false,
}

function loadDefaults(): Record<SectionKey, boolean> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) return { ...FACTORY_DEFAULTS, ...JSON.parse(raw) }
    } catch { /* ignore */ }
    return { ...FACTORY_DEFAULTS }
}

function saveDefaults(state: Record<SectionKey, boolean>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ─── Accordion ──────────────────────────────────────────────
function Accordion({ title, icon, children, open, onToggle, alert: isAlert }: {
    title: string; icon: React.ReactNode; children: React.ReactNode;
    open: boolean; onToggle: () => void; alert?: boolean
}) {
    return (
        <div style={{ borderBottom: '1px solid var(--border)' }}>
            <button onClick={onToggle} style={{
                width: '100%', padding: '7px 10px', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text)', fontSize: '0.76rem', fontWeight: 600,
            }}>
                {icon}
                <span style={{ flex: 1, textAlign: 'left' }}>{title}</span>
                {isAlert && <AlertTriangle style={{ width: 12, height: 12, color: '#f59e0b' }} />}
                {open ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
            </button>
            {open && <div style={{ padding: '2px 10px 8px', fontSize: '0.76rem' }}>{children}</div>}
        </div>
    )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{label}</span>
            <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? '#ef4444' : 'var(--text)', fontSize: '0.74rem' }}>{value}</span>
        </div>
    )
}

export function ClinicalInfoPanel({ lang, data }: { lang: string; data?: ViewerData | null }) {
    const d = useMemo(() => data ? mapViewerDataToClinical(data) : mockClinical, [data])
    const [sections, setSections] = useState<Record<SectionKey, boolean>>(loadDefaults)
    const [showSettings, setShowSettings] = useState(false)
    const [saved, setSaved] = useState(false)

    const toggle = useCallback((key: SectionKey) => {
        setSections(prev => ({ ...prev, [key]: !prev[key] }))
    }, [])

    const handleSaveDefaults = () => {
        saveDefaults(sections)
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
    }

    // Load defaults on mount
    useEffect(() => {
        setSections(loadDefaults())
    }, [])

    return (
        <div className="clinical-info-panel" style={{
            height: '100%', overflow: 'auto', background: 'var(--bg-card)',
            borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        }}>
            {/* Patient Header */}
            <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'rgba(13,148,136,0.05)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{d.patient.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                            {d.patient.patientId} · {d.patient.age}{lang === 'ja' ? '歳' : 'y'} · {d.patient.sex === 'M' ? (lang === 'ja' ? '男性' : 'M') : (lang === 'ja' ? '女性' : 'F')}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
                        title={lang === 'ja' ? 'パネル設定' : 'Panel Settings'}
                    >
                        <Settings style={{ width: 14, height: 14 }} />
                    </button>
                </div>
            </div>

            {/* Settings bar */}
            {showSettings && (
                <div style={{
                    padding: '6px 10px', borderBottom: '1px solid var(--border)',
                    background: 'rgba(59,130,246,0.05)', display: 'flex', alignItems: 'center', gap: 6,
                    flexShrink: 0,
                }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flex: 1 }}>
                        {lang === 'ja' ? '現在の開閉状態をデフォルトとして保存' : 'Save current layout as default'}
                    </span>
                    <button
                        onClick={handleSaveDefaults}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            padding: '3px 8px', borderRadius: 4, fontSize: '0.68rem', fontWeight: 600,
                            background: saved ? '#10b981' : 'var(--primary)', color: 'white',
                            border: 'none', cursor: 'pointer', transition: 'background 0.2s',
                        }}
                    >
                        <Save style={{ width: 11, height: 11 }} />
                        {saved ? (lang === 'ja' ? '保存済' : 'Saved!') : (lang === 'ja' ? 'デフォルト保存' : 'Save Default')}
                    </button>
                </div>
            )}

            {/* Scrollable sections */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Chief Complaint */}
                <Accordion title={lang === 'ja' ? '主訴・症状' : 'Chief Complaint'} icon={<FileText style={{ width: 13, height: 13, color: '#ef4444' }} />} open={sections.chief} onToggle={() => toggle('chief')} alert={true}>
                    <div style={{ background: 'rgba(239,68,68,0.06)', padding: '5px 8px', borderRadius: 4, marginBottom: 4, lineHeight: 1.4 }}>
                        {d.chiefComplaint}
                    </div>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        {d.symptoms.map((s, i) => (
                            <span key={i} className="badge badge-warning" style={{ fontSize: '0.63rem' }}>{s}</span>
                        ))}
                    </div>
                </Accordion>

                {/* Referral Info */}
                <Accordion title={lang === 'ja' ? '依頼元情報' : 'Referral'} icon={<Building2 style={{ width: 13, height: 13, color: '#8b5cf6' }} />} open={sections.referral} onToggle={() => toggle('referral')}>
                    <InfoRow label={lang === 'ja' ? '施設名' : 'Facility'} value={d.referral.facility} />
                    <InfoRow label={lang === 'ja' ? '依頼医' : 'Doctor'} value={d.referral.doctor} />
                    <InfoRow label={lang === 'ja' ? '連絡先' : 'Phone'} value={d.referral.phone} />
                </Accordion>

                {/* Demographics */}
                <Accordion title={lang === 'ja' ? '基本情報' : 'Demographics'} icon={<User style={{ width: 13, height: 13, color: 'var(--primary)' }} />} open={sections.demographics} onToggle={() => toggle('demographics')}>
                    <InfoRow label={lang === 'ja' ? '生年月日' : 'DOB'} value={d.patient.dob} />
                    <InfoRow label={lang === 'ja' ? '民族' : 'Ethnicity'} value={d.patient.ethnicity} />
                    <InfoRow label={lang === 'ja' ? '血液型' : 'Blood Type'} value={d.patient.bloodType} />
                </Accordion>

                {/* Ophthalmic Exam */}
                <Accordion title={lang === 'ja' ? '眼科検査' : 'Ophthalmic Exam'} icon={<Eye style={{ width: 13, height: 13, color: '#3b82f6' }} />} open={sections.ophthalmic} onToggle={() => toggle('ophthalmic')}>
                    <InfoRow label={lang === 'ja' ? '視力 R' : 'VA R'} value={d.ophthalmicExam.vaRight} />
                    <InfoRow label={lang === 'ja' ? '視力 L' : 'VA L'} value={d.ophthalmicExam.vaLeft} />
                    <InfoRow label={lang === 'ja' ? '眼圧 R' : 'IOP R'} value={`${d.ophthalmicExam.iopRight} mmHg`} />
                    <InfoRow label={lang === 'ja' ? '眼圧 L' : 'IOP L'} value={`${d.ophthalmicExam.iopLeft} mmHg`} />
                    <div style={{ marginTop: 3 }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{lang === 'ja' ? '前眼部' : 'Anterior'}: </span>
                        <span style={{ fontSize: '0.72rem' }}>{d.ophthalmicExam.anteriorFindings}</span>
                    </div>
                </Accordion>

                {/* Systemic */}
                <Accordion title={lang === 'ja' ? '全身状態' : 'Systemic'} icon={<Activity style={{ width: 13, height: 13, color: '#ef4444' }} />} open={sections.systemic} onToggle={() => toggle('systemic')} alert={d.systemic.hasDiabetes}>
                    <InfoRow label={lang === 'ja' ? '血圧' : 'BP'} value={`${d.systemic.bpSystolic}/${d.systemic.bpDiastolic}`} highlight={d.systemic.bpSystolic > 140} />
                    <InfoRow label="HbA1c" value={`${d.systemic.hba1c}%`} highlight={d.systemic.hba1c > 7.0} />
                    <InfoRow label={lang === 'ja' ? '糖尿病' : 'DM'} value={d.systemic.hasDiabetes ? '✓' : '—'} highlight={d.systemic.hasDiabetes} />
                    <InfoRow label={lang === 'ja' ? '高血圧' : 'HTN'} value={d.systemic.hasHypertension ? '✓' : '—'} highlight={d.systemic.hasHypertension} />
                    <InfoRow label={lang === 'ja' ? '喫煙' : 'Smoking'} value={d.systemic.smokingStatus} />
                </Accordion>

                {/* Medical History */}
                <Accordion title={lang === 'ja' ? '既往歴' : 'Medical History'} icon={<Heart style={{ width: 13, height: 13, color: '#ef4444' }} />} open={sections.history} onToggle={() => toggle('history')}>
                    {d.medicalHistory.map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                            <span style={{ fontSize: '0.72rem' }}>{h.condition}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{h.since}〜</span>
                        </div>
                    ))}
                </Accordion>

                {/* Ocular History */}
                <Accordion title={lang === 'ja' ? '眼科既往歴' : 'Ocular History'} icon={<Eye style={{ width: 13, height: 13, color: '#3b82f6' }} />} open={sections.ocularHistory} onToggle={() => toggle('ocularHistory')}>
                    {d.ocularHistory.map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1px 0' }}>
                            <span style={{ fontSize: '0.72rem' }}>{h.condition}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{h.eye}</span>
                        </div>
                    ))}
                </Accordion>

                {/* Medications */}
                <Accordion title={lang === 'ja' ? `服薬 (${d.medications.length})` : `Medications (${d.medications.length})`} icon={<Pill style={{ width: 13, height: 13, color: '#10b981' }} />} open={sections.medications} onToggle={() => toggle('medications')}>
                    {d.medications.map((m, i) => (
                        <div key={i} style={{ padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontWeight: 500, fontSize: '0.72rem' }}>{m.name}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{m.dosage} · {m.frequency}</div>
                        </div>
                    ))}
                </Accordion>

                {/* Allergies */}
                <Accordion title={lang === 'ja' ? 'アレルギー' : 'Allergies'} icon={<AlertTriangle style={{ width: 13, height: 13, color: '#f59e0b' }} />} open={sections.allergies} onToggle={() => toggle('allergies')} alert={d.allergies.length > 0}>
                    {d.allergies.length === 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'ja' ? 'なし' : 'None'}</span>
                    ) : (
                        d.allergies.map((a, i) => (
                            <span key={i} className="badge badge-warning" style={{ fontSize: '0.63rem', marginRight: 4 }}>{a}</span>
                        ))
                    )}
                </Accordion>
            </div>
        </div>
    )
}

function mapViewerDataToClinical(v: ViewerData): ClinicalData {
    return {
        patient: {
            patientId: v.patient.id || '',
            name: v.patient.name,
            age: v.patient.age || 0,
            sex: v.patient.sex === 'F' || v.patient.sex === 'female' ? 'F' : 'M',
            dob: v.patient.birthDate || '',
            ethnicity: v.patient.ethnicity || '',
            bloodType: v.patient.bloodType || '',
        },
        referral: {
            facility: v.referral.facility || '',
            doctor: v.referral.doctor || '',
            phone: v.referral.phone || '',
        },
        chiefComplaint: v.screening.chiefComplaint || '',
        symptoms: v.screening.symptoms || [],
        medicalHistory: v.patient.medicalHistory || [],
        ocularHistory: v.patient.ocularHistory || [],
        medications: v.screening.currentMedications || [],
        allergies: v.patient.allergies || [],
        ophthalmicExam: {
            vaRight: v.screening.ophthalmicExam?.vaRight || '-',
            vaLeft: v.screening.ophthalmicExam?.vaLeft || '-',
            iopRight: v.screening.ophthalmicExam?.iopRight || 0,
            iopLeft: v.screening.ophthalmicExam?.iopLeft || 0,
            anteriorFindings: v.screening.ophthalmicExam?.anteriorFindings || '-',
        },
        systemic: {
            bpSystolic: v.screening.bpSystolic || 0,
            bpDiastolic: v.screening.bpDiastolic || 0,
            hba1c: v.screening.hba1c || 0,
            smokingStatus: v.screening.smokingStatus || '',
            hasDiabetes: !!v.screening.hasDiabetes,
            hasHypertension: !!v.screening.hasHypertension,
        }
    }
}
