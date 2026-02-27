import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { ArrowLeft, Upload, Check, Eye, Activity, FileText } from 'lucide-react'

export default function ScreeningRegister() {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const { lang } = useTranslation()

    // Chief complaint & symptoms
    const [chiefComplaint, setChiefComplaint] = useState('')
    const [symptoms, setSymptoms] = useState<Record<string, boolean>>({
        blurring: false, floaters: false, diplopia: false, pain: false,
        redness: false, discharge: false, photophobia: false, halos: false,
    })

    // Ophthalmic exam
    const [vaRight, setVaRight] = useState('')
    const [vaLeft, setVaLeft] = useState('')
    const [iopRight, setIopRight] = useState('')
    const [iopLeft, setIopLeft] = useState('')
    const [anteriorFindings, setAnteriorFindings] = useState('')

    // Systemic
    const [bpSystolic, setBpSystolic] = useState('')
    const [bpDiastolic, setBpDiastolic] = useState('')
    const [hba1c, setHba1c] = useState('')
    const [smokingStatus, setSmokingStatus] = useState('non_smoker')

    // Images
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string, eye: string }[]>([])

    // Notes
    const [referringPhysician, setReferringPhysician] = useState('')
    const [specialNotes, setSpecialNotes] = useState('')
    const [isUrgent, setIsUrgent] = useState(false)

    const symptomLabels: Record<string, string> = lang === 'ja'
        ? { blurring: '視力低下', floaters: '飛蚊症', diplopia: '複視', pain: '眼痛', redness: '充血', discharge: '眼脂', photophobia: '羞明', halos: 'ハロー' }
        : { blurring: 'Blurred Vision', floaters: 'Floaters', diplopia: 'Diplopia', pain: 'Eye Pain', redness: 'Redness', discharge: 'Discharge', photophobia: 'Photophobia', halos: 'Halos' }

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, eye: 'right' }))])
    }

    const handleSubmit = () => {
        alert(lang === 'ja' ? 'スクリーニングを登録しました！（デモ）' : 'Screening submitted! (demo)')
        navigate(`/patients/${patientId}`)
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ padding: '6px 10px', minHeight: 32 }}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.3rem' }}>{lang === 'ja' ? '新規検査登録' : 'New Screening'}</h1>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>{lang === 'ja' ? '患者' : 'Patient'}: {patientId}</p>
                </div>
            </div>

            {/* Chief Complaint & Symptoms */}
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                    {lang === 'ja' ? '主訴・症状' : 'Chief Complaint & Symptoms'}
                </h3>
                <div>
                    <label className="form-label">{lang === 'ja' ? '主訴' : 'Chief Complaint'}</label>
                    <textarea className="form-input" rows={2} value={chiefComplaint} onChange={e => setChiefComplaint(e.target.value)} placeholder={lang === 'ja' ? '例: 右眼の視力低下が3日前から…' : 'e.g. Decreased vision in right eye for 3 days…'} />
                </div>
                <div style={{ marginTop: 12 }}>
                    <label className="form-label">{lang === 'ja' ? '症状チェック' : 'Symptoms'}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {Object.entries(symptomLabels).map(([key, label]) => (
                            <label key={key} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius)',
                                border: `1px solid ${symptoms[key] ? 'var(--primary)' : 'var(--border)'}`,
                                background: symptoms[key] ? 'rgba(13,148,136,0.1)' : 'var(--bg-card)',
                                cursor: 'pointer', fontSize: '0.8rem', fontWeight: symptoms[key] ? 600 : 400, transition: 'all 0.15s',
                            }}>
                                <input type="checkbox" checked={symptoms[key]} onChange={e => setSymptoms({ ...symptoms, [key]: e.target.checked })} style={{ display: 'none' }} />
                                {symptoms[key] && <Check style={{ width: 12, height: 12, color: 'var(--primary)' }} />}
                                {label}
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Ophthalmic Exam */}
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Eye style={{ width: 18, height: 18, color: '#3b82f6' }} />
                    {lang === 'ja' ? '眼科検査結果' : 'Ophthalmic Exam Results'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '視力（右眼）' : 'Visual Acuity (R)'}</label>
                        <input className="form-input" value={vaRight} onChange={e => setVaRight(e.target.value)} placeholder="e.g. 0.7 (1.0×)" />
                    </div>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '視力（左眼）' : 'Visual Acuity (L)'}</label>
                        <input className="form-input" value={vaLeft} onChange={e => setVaLeft(e.target.value)} placeholder="e.g. 1.0 (1.2×)" />
                    </div>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '眼圧（右眼）mmHg' : 'IOP (R) mmHg'}</label>
                        <input className="form-input" type="number" value={iopRight} onChange={e => setIopRight(e.target.value)} placeholder="e.g. 14" />
                    </div>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '眼圧（左眼）mmHg' : 'IOP (L) mmHg'}</label>
                        <input className="form-input" type="number" value={iopLeft} onChange={e => setIopLeft(e.target.value)} placeholder="e.g. 16" />
                    </div>
                </div>
                <div style={{ marginTop: 12 }}>
                    <label className="form-label">{lang === 'ja' ? '前眼部所見' : 'Anterior Segment Findings'}</label>
                    <textarea className="form-input" rows={2} value={anteriorFindings} onChange={e => setAnteriorFindings(e.target.value)} placeholder={lang === 'ja' ? '例: 両眼 水晶体軽度混濁' : 'e.g. Mild lens opacity OU'} />
                </div>
            </div>

            {/* Systemic Status */}
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Activity style={{ width: 18, height: 18, color: '#ef4444' }} />
                    {lang === 'ja' ? '全身状態' : 'Systemic Status'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '収縮期血圧' : 'BP Systolic'}</label>
                        <input className="form-input" type="number" value={bpSystolic} onChange={e => setBpSystolic(e.target.value)} placeholder="mmHg" />
                    </div>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '拡張期血圧' : 'BP Diastolic'}</label>
                        <input className="form-input" type="number" value={bpDiastolic} onChange={e => setBpDiastolic(e.target.value)} placeholder="mmHg" />
                    </div>
                    <div>
                        <label className="form-label">HbA1c (%)</label>
                        <input className="form-input" type="number" step="0.1" value={hba1c} onChange={e => setHba1c(e.target.value)} placeholder="e.g. 7.2" />
                    </div>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '喫煙' : 'Smoking'}</label>
                        <select className="form-input" value={smokingStatus} onChange={e => setSmokingStatus(e.target.value)}>
                            <option value="non_smoker">{lang === 'ja' ? '非喫煙' : 'Non-smoker'}</option>
                            <option value="current">{lang === 'ja' ? '喫煙中' : 'Current'}</option>
                            <option value="former">{lang === 'ja' ? '禁煙済' : 'Former'}</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Image Upload */}
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Upload style={{ width: 18, height: 18, color: '#10b981' }} />
                    {lang === 'ja' ? '画像アップロード' : 'Image Upload'}
                </h3>
                <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleFileDrop}
                    style={{
                        border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: 40,
                        textAlign: 'center', color: 'var(--text-muted)', cursor: 'pointer',
                        background: 'var(--bg-card)', transition: 'border-color 0.2s',
                    }}
                    onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.accept = 'image/*'
                        input.onchange = (e) => {
                            const files = Array.from((e.target as HTMLInputElement).files || [])
                            setUploadedFiles(prev => [...prev, ...files.map(f => ({ name: f.name, eye: 'right' }))])
                        }
                        input.click()
                    }}
                >
                    <Upload style={{ width: 32, height: 32, margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>{lang === 'ja' ? 'ここにファイルをドロップ、またはクリックして選択' : 'Drop files here or click to browse'}</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>{lang === 'ja' ? 'JPEG, PNG, DICOM対応' : 'Supports JPEG, PNG, DICOM'}</p>
                </div>
                {uploadedFiles.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                        {uploadedFiles.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                                <span style={{ flex: 1, fontSize: '0.8rem' }}>{f.name}</span>
                                <select className="form-input" style={{ padding: '4px 8px', minWidth: 100 }} value={f.eye} onChange={e => { const n = [...uploadedFiles]; n[i].eye = e.target.value; setUploadedFiles(n) }}>
                                    <option value="right">{lang === 'ja' ? '右眼' : 'Right'}</option>
                                    <option value="left">{lang === 'ja' ? '左眼' : 'Left'}</option>
                                </select>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="panel" style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '紹介元医師' : 'Referring Physician'}</label>
                        <input className="form-input" value={referringPhysician} onChange={e => setReferringPhysician(e.target.value)} />
                    </div>
                    <div>
                        <label className="form-label">{lang === 'ja' ? '緊急フラグ' : 'Urgency'}</label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, cursor: 'pointer' }}>
                            <input type="checkbox" checked={isUrgent} onChange={e => setIsUrgent(e.target.checked)} />
                            <span style={{ fontWeight: isUrgent ? 700 : 400, color: isUrgent ? '#ef4444' : 'var(--text)' }}>{lang === 'ja' ? '緊急読影が必要' : 'Urgent reading required'}</span>
                        </label>
                    </div>
                </div>
                <div style={{ marginTop: 12 }}>
                    <label className="form-label">{lang === 'ja' ? '特記事項' : 'Special Notes'}</label>
                    <textarea className="form-input" rows={3} value={specialNotes} onChange={e => setSpecialNotes(e.target.value)} />
                </div>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>{lang === 'ja' ? 'キャンセル' : 'Cancel'}</button>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check style={{ width: 16, height: 16 }} />
                    {lang === 'ja' ? '検査を登録' : 'Submit Screening'}
                </button>
            </div>
        </div>
    )
}
