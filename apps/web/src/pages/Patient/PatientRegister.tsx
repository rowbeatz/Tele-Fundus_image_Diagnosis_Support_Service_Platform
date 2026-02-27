import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { ArrowLeft, Check, ChevronRight, Plus, Trash2 } from 'lucide-react'

const STEPS = ['basic', 'history', 'medications', 'confirm'] as const
type Step = typeof STEPS[number]

interface MedRow { name: string; dosage: string; frequency: string; since: string }
interface HistoryRow { condition: string; since: string; status: string; note: string }

export default function PatientRegister() {
    const navigate = useNavigate()
    const { lang } = useTranslation()
    const [step, setStep] = useState<Step>('basic')

    // Basic
    const [name, setName] = useState('')
    const [nameKana, setNameKana] = useState('')
    const [dob, setDob] = useState('')
    const [sex, setSex] = useState('M')
    const [ethnicity, setEthnicity] = useState('')
    const [bloodType, setBloodType] = useState('')
    const [insuranceId, setInsuranceId] = useState('')

    // History
    const [medHistory, setMedHistory] = useState<HistoryRow[]>([])
    const [ocularHistory, setOcularHistory] = useState<HistoryRow[]>([])
    const [hasDiabetes, setHasDiabetes] = useState(false)
    const [hasHypertension, setHasHypertension] = useState(false)
    const [hasGlaucoma, setHasGlaucoma] = useState(false)
    const [hasCataract, setHasCataract] = useState(false)
    const [hasDyslipidemia, setHasDyslipidemia] = useState(false)
    const [allergies, setAllergies] = useState('')
    const [familyHist, setFamilyHist] = useState('')

    // Medications
    const [meds, setMeds] = useState<MedRow[]>([])

    const stepIdx = STEPS.indexOf(step)
    const isLast = stepIdx === STEPS.length - 1

    const stepLabels: Record<Step, string> = {
        basic: lang === 'ja' ? '基本情報' : 'Basic Info',
        history: lang === 'ja' ? '既往歴' : 'Medical History',
        medications: lang === 'ja' ? '服薬歴' : 'Medications',
        confirm: lang === 'ja' ? '確認' : 'Confirm',
    }

    const addHistoryRow = (target: 'med' | 'ocular') => {
        const row: HistoryRow = { condition: '', since: '', status: 'active', note: '' }
        if (target === 'med') setMedHistory([...medHistory, row])
        else setOcularHistory([...ocularHistory, row])
    }

    const addMedRow = () => setMeds([...meds, { name: '', dosage: '', frequency: '', since: '' }])

    const handleSubmit = () => {
        alert(lang === 'ja' ? '患者を登録しました！（デモ）' : 'Patient registered! (demo)')
        navigate('/patients')
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button className="btn btn-secondary" onClick={() => navigate('/patients')} style={{ padding: '6px 10px', minHeight: 32 }}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>
                <h1 style={{ fontSize: '1.3rem' }}>{lang === 'ja' ? '新規患者登録' : 'New Patient Registration'}</h1>
            </div>

            {/* Step Indicator */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{
                        flex: 1, padding: '10px 12px', borderRadius: 'var(--radius)',
                        background: i <= stepIdx ? 'var(--primary)' : 'var(--bg-card)',
                        color: i <= stepIdx ? '#fff' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 600,
                        border: `1px solid ${i <= stepIdx ? 'var(--primary)' : 'var(--border)'}`,
                        cursor: i < stepIdx ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                    }} onClick={() => i < stepIdx && setStep(STEPS[i])}>
                        <span style={{
                            width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: i < stepIdx ? 'rgba(255,255,255,0.3)' : 'transparent',
                            border: i <= stepIdx ? '1.5px solid rgba(255,255,255,0.5)' : '1.5px solid var(--border)',
                            fontSize: '0.7rem',
                        }}>
                            {i < stepIdx ? <Check style={{ width: 12, height: 12 }} /> : i + 1}
                        </span>
                        {stepLabels[s]}
                    </div>
                ))}
            </div>

            {/* Form */}
            <div className="panel" style={{ padding: 24 }}>
                {step === 'basic' && (
                    <div className="space-y-4">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '氏名 *' : 'Full Name *'}</label>
                                <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder={lang === 'ja' ? '例: 田中 太郎' : 'e.g. Taro Tanaka'} />
                            </div>
                            <div>
                                <label className="form-label">{lang === 'ja' ? 'フリガナ' : 'Kana Reading'}</label>
                                <input className="form-input" value={nameKana} onChange={e => setNameKana(e.target.value)} placeholder={lang === 'ja' ? '例: タナカ タロウ' : 'e.g. Tanaka Tarou'} />
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '生年月日 *' : 'Date of Birth *'}</label>
                                <input className="form-input" type="date" value={dob} onChange={e => setDob(e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '性別 *' : 'Sex *'}</label>
                                <select className="form-input" value={sex} onChange={e => setSex(e.target.value)}>
                                    <option value="M">{lang === 'ja' ? '男性' : 'Male'}</option>
                                    <option value="F">{lang === 'ja' ? '女性' : 'Female'}</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '血液型' : 'Blood Type'}</label>
                                <select className="form-input" value={bloodType} onChange={e => setBloodType(e.target.value)}>
                                    <option value="">—</option>
                                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bt => <option key={bt} value={bt}>{bt}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '民族' : 'Ethnicity'}</label>
                                <input className="form-input" value={ethnicity} onChange={e => setEthnicity(e.target.value)} placeholder={lang === 'ja' ? '例: 日本人' : 'e.g. Japanese'} />
                            </div>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '保険証番号' : 'Insurance ID'}</label>
                                <input className="form-input" value={insuranceId} onChange={e => setInsuranceId(e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {step === 'history' && (
                    <div className="space-y-4">
                        <h3 style={{ fontSize: '0.95rem', marginBottom: 8 }}>{lang === 'ja' ? '全身既往歴' : 'Systemic History'}</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            {[
                                [hasDiabetes, setHasDiabetes, lang === 'ja' ? '糖尿病' : 'Diabetes'] as const,
                                [hasHypertension, setHasHypertension, lang === 'ja' ? '高血圧' : 'Hypertension'] as const,
                                [hasDyslipidemia, setHasDyslipidemia, lang === 'ja' ? '脂質異常症' : 'Dyslipidemia'] as const,
                                [hasGlaucoma, setHasGlaucoma, lang === 'ja' ? '緑内障' : 'Glaucoma'] as const,
                                [hasCataract, setHasCataract, lang === 'ja' ? '白内障' : 'Cataract'] as const,
                            ].map(([checked, setter, label], i) => (
                                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: checked ? 'rgba(13,148,136,0.1)' : 'var(--bg-card)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: checked ? 600 : 400 }}>
                                    <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} />
                                    {label}
                                </label>
                            ))}
                        </div>

                        <div style={{ marginTop: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <h4 style={{ fontSize: '0.85rem', margin: 0 }}>{lang === 'ja' ? 'その他の既往歴' : 'Other History'}</h4>
                                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }} onClick={() => addHistoryRow('med')}>
                                    <Plus style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '追加' : 'Add'}
                                </button>
                            </div>
                            {medHistory.map((row, i) => (
                                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                                    <input className="form-input" placeholder={lang === 'ja' ? '疾患名' : 'Condition'} value={row.condition} onChange={e => { const n = [...medHistory]; n[i].condition = e.target.value; setMedHistory(n) }} />
                                    <input className="form-input" placeholder={lang === 'ja' ? '発症年' : 'Since'} value={row.since} onChange={e => { const n = [...medHistory]; n[i].since = e.target.value; setMedHistory(n) }} />
                                    <input className="form-input" placeholder={lang === 'ja' ? '備考' : 'Note'} value={row.note} onChange={e => { const n = [...medHistory]; n[i].note = e.target.value; setMedHistory(n) }} />
                                    <button className="btn btn-secondary" style={{ padding: '4px 8px', minHeight: 32 }} onClick={() => setMedHistory(medHistory.filter((_, j) => j !== i))}>
                                        <Trash2 style={{ width: 14, height: 14, color: '#ef4444' }} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                            <div>
                                <label className="form-label">{lang === 'ja' ? 'アレルギー' : 'Allergies'}</label>
                                <textarea className="form-input" rows={2} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder={lang === 'ja' ? '例: ペニシリン系' : 'e.g. Penicillin'} />
                            </div>
                            <div>
                                <label className="form-label">{lang === 'ja' ? '家族歴' : 'Family History'}</label>
                                <textarea className="form-input" rows={2} value={familyHist} onChange={e => setFamilyHist(e.target.value)} placeholder={lang === 'ja' ? '例: 父 — 糖尿病' : 'e.g. Father — Diabetes'} />
                            </div>
                        </div>
                    </div>
                )}

                {step === 'medications' && (
                    <div className="space-y-4">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.95rem', margin: 0 }}>{lang === 'ja' ? '現在の服薬' : 'Current Medications'}</h3>
                            <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px', minHeight: 28 }} onClick={addMedRow}>
                                <Plus style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '追加' : 'Add'}
                            </button>
                        </div>
                        {meds.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{lang === 'ja' ? '服薬情報がありません。下のボタンから追加してください。' : 'No medications. Click Add to include one.'}</p>}
                        {meds.map((m, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr 1fr auto', gap: 8, marginBottom: 6 }}>
                                <input className="form-input" placeholder={lang === 'ja' ? '薬剤名' : 'Drug Name'} value={m.name} onChange={e => { const n = [...meds]; n[i].name = e.target.value; setMeds(n) }} />
                                <input className="form-input" placeholder={lang === 'ja' ? '用量' : 'Dose'} value={m.dosage} onChange={e => { const n = [...meds]; n[i].dosage = e.target.value; setMeds(n) }} />
                                <input className="form-input" placeholder={lang === 'ja' ? '頻度' : 'Frequency'} value={m.frequency} onChange={e => { const n = [...meds]; n[i].frequency = e.target.value; setMeds(n) }} />
                                <input className="form-input" type="month" value={m.since} onChange={e => { const n = [...meds]; n[i].since = e.target.value; setMeds(n) }} />
                                <button className="btn btn-secondary" style={{ padding: '4px 8px', minHeight: 32 }} onClick={() => setMeds(meds.filter((_, j) => j !== i))}>
                                    <Trash2 style={{ width: 14, height: 14, color: '#ef4444' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {step === 'confirm' && (
                    <div className="space-y-4">
                        <h3 style={{ fontSize: '0.95rem' }}>{lang === 'ja' ? '登録内容の確認' : 'Confirm Registration'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            {[
                                [lang === 'ja' ? '氏名' : 'Name', name || '—'],
                                [lang === 'ja' ? 'フリガナ' : 'Kana', nameKana || '—'],
                                [lang === 'ja' ? '生年月日' : 'DOB', dob || '—'],
                                [lang === 'ja' ? '性別' : 'Sex', sex === 'M' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')],
                                [lang === 'ja' ? '血液型' : 'Blood Type', bloodType || '—'],
                                [lang === 'ja' ? '民族' : 'Ethnicity', ethnicity || '—'],
                                [lang === 'ja' ? '糖尿病' : 'Diabetes', hasDiabetes ? '✓' : '—'],
                                [lang === 'ja' ? '高血圧' : 'Hypertension', hasHypertension ? '✓' : '—'],
                                [lang === 'ja' ? '服薬数' : 'Medications', String(meds.length)],
                            ].map(([label, val], i) => (
                                <div key={i}>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                                    <div style={{ fontWeight: 500 }}>{val}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button className="btn btn-secondary" disabled={stepIdx === 0} onClick={() => setStep(STEPS[stepIdx - 1])} style={{ opacity: stepIdx === 0 ? 0.4 : 1 }}>
                    {lang === 'ja' ? '← 戻る' : '← Back'}
                </button>
                {isLast ? (
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        <Check style={{ width: 16, height: 16 }} /> {lang === 'ja' ? '登録する' : 'Register Patient'}
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={() => setStep(STEPS[stepIdx + 1])}>
                        {lang === 'ja' ? '次へ' : 'Next'} <ChevronRight style={{ width: 16, height: 16 }} />
                    </button>
                )}
            </div>
        </div>
    )
}
