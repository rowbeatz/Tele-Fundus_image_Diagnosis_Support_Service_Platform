import React, { useState, useRef } from 'react'
import { useTranslation } from '../../lib/i18n'
import { UploadCloud, FileImage, X, Plus, Trash2, Check, ArrowRight, Table, Download, Database, Webhook } from 'lucide-react'
import * as XLSX from 'xlsx'

// --- Types ---
interface MedRow { name: string; dosage: string; frequency: string; since: string }
interface HistoryRow { condition: string; since: string; status: string; note: string }
interface BatchRow { id: string; patientId: string; name: string; dob: string; sex: string; files: File[] }

interface BatchRow { id: string; patientId: string; name: string; dob: string; sex: string; clinicalData?: any; files: File[] }

// --- Helpers ---
const downloadSampleFile = (type: 'csv' | 'xlsx') => {
    // 1行目はサンプルデータ、2行目以降がユーザー入力用
    const headers = [
        '患者ID (必須)', '氏名 (必須)', '生年月日 (YYYY-MM-DD)', '性別 (M/F)',
        '糖尿病 (1=有/0=無)', '高血圧 (1/0)', '脂質異常症 (1/0)', '緑内障 (1/0)', '白内障 (1/0)',
        '収縮期血圧', '拡張期血圧', 'HbA1c', '喫煙歴 (non_smoker/current/former)',
        'アレルギー', '家族歴', 'その他の既往歴 (疾患名;発症年, ...)',
        '服薬歴 (薬剤名;用量;頻度, ...)',
        '主訴', '前眼部所見', '視力(右)', '視力(左)', '眼圧(右)', '眼圧(左)',
        '至急フラグ (1/0)', '備考（※1行目はサンプルのため無視されます）'
    ]

    // サンプルデータ行
    const sampleRow = [
        'PT-2026-001', '山田 太郎', '1950-01-01', 'M',
        '1', '0', '1', '0', '0',
        '130', '85', '7.2', 'former',
        '特になし', '父親が緑内障', '喘息;2010',
        'メトホルミン;500mg;1日2回, アムロジピン;5mg;1日1回',
        '最近右目が見えにくい', '異常なし', '0.8', '1.0', '14', '15',
        '0', '←この行を上書き、または下に追加して入力してください'
    ]

    const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow])

    // 列幅の調整
    ws['!cols'] = [
        { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
        { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
        { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 },
        { wch: 20 }, { wch: 20 }, { wch: 30 },
        { wch: 40 },
        { wch: 25 }, { wch: 25 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
        { wch: 10 }, { wch: 50 }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Batch_Import_Template')

    if (type === 'csv') {
        XLSX.writeFile(wb, 'Tele-Fundus_Comprehensive_Batch_Sample.csv', { bookType: 'csv' })
    } else {
        XLSX.writeFile(wb, 'Tele-Fundus_Comprehensive_Batch_Sample.xlsx', { bookType: 'xlsx' })
    }
}

const parseBatchFile = async (file: File): Promise<BatchRow[]> => {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const data = new Uint8Array(e.target?.result as ArrayBuffer)
            const workbook = XLSX.read(data, { type: 'array' })
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

            if (json.length < 2) {
                resolve([])
                return
            }

            // 1行目はサンプル行としてスキップするので slice(1)
            const rows = json.slice(1).filter(row => row.length > 0 && row[0]) // IDが空の行は無視

            const parsed = rows.map((cols, i) => {
                const safeStr = (val: any) => String(val || '').trim()
                const safeNum = (val: any) => safeStr(val)
                const safeBool = (val: any) => safeStr(val) === '1' || safeStr(val).toLowerCase() === 'true'

                return {
                    id: `row-${Date.now()}-${i}`,
                    patientId: safeStr(cols[0]),
                    name: safeStr(cols[1]),
                    dob: safeStr(cols[2]),
                    sex: safeStr(cols[3]).toUpperCase() === 'M' || safeStr(cols[3]).includes('男') ? 'M' : 'F',
                    clinicalData: {
                        diabetes: safeBool(cols[4]),
                        htn: safeBool(cols[5]),
                        dyslipidemia: safeBool(cols[6]),
                        glaucoma: safeBool(cols[7]),
                        cataract: safeBool(cols[8]),
                        systolic: safeNum(cols[9]),
                        diastolic: safeNum(cols[10]),
                        hba1c: safeNum(cols[11]),
                        smoking: safeStr(cols[12]),
                        allergies: safeStr(cols[13]),
                        familyHist: safeStr(cols[14]),
                        otherHistRaw: safeStr(cols[15]),
                        medsRaw: safeStr(cols[16]),
                        chiefComplaint: safeStr(cols[17]),
                        anterior: safeStr(cols[18]),
                        vaR: safeStr(cols[19]),
                        vaL: safeStr(cols[20]),
                        iopR: safeStr(cols[21]),
                        iopL: safeStr(cols[22]),
                        urgent: safeBool(cols[23])
                    },
                    files: []
                }
            })
            resolve(parsed)
        }
        reader.readAsArrayBuffer(file)
    })
}

export default function Uploads() {
    const { t, lang } = useTranslation()
    const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'api'>('single')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitProgress, setSubmitProgress] = useState(0)

    // ==========================================
    // Single Registration Form Logic (Same as before)
    // ==========================================
    const [basic, setBasic] = useState({ id: '', name: '', kana: '', dob: '', sex: 'M', bloodType: '', ethnicity: '', insuranceId: '' })
    const [vitals, setVitals] = useState({ systolic: '', diastolic: '', hba1c: '', smoking: 'non_smoker' })
    const [sysHist, setSysHist] = useState({ diabetes: false, htn: false, dyslipidemia: false, glaucoma: false, cataract: false })
    const [allergies, setAllergies] = useState('')
    const [familyHist, setFamilyHist] = useState('')
    const [otherHist, setOtherHist] = useState<HistoryRow[]>([])
    const [meds, setMeds] = useState<MedRow[]>([])

    const [exam, setExam] = useState({ chiefComplaint: '', vaR: '', vaL: '', iopR: '', iopL: '', anterior: '', refDr: '', notes: '', urgent: false })
    const [singleFiles, setSingleFiles] = useState<{ file: File, eye: string }[]>([])
    const singleFileRef = useRef<HTMLInputElement>(null)

    const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const added = Array.from(e.target.files).map(f => ({ file: f, eye: f.name.toLowerCase().includes('left') ? 'left' : 'right' }))
            setSingleFiles(prev => [...prev, ...added])
        }
    }

    const removeSingleFile = (idx: number) => setSingleFiles(prev => prev.filter((_, i) => i !== idx))
    const addMedRow = () => setMeds([...meds, { name: '', dosage: '', frequency: '', since: '' }])
    const addHistRow = () => setOtherHist([...otherHist, { condition: '', since: '', status: 'active', note: '' }])

    const submitSingle = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!basic.id || !basic.name) { alert(lang === 'ja' ? 'IDと氏名は必須です。' : 'ID and Name are required.'); return }
        setIsSubmitting(true)
        setSubmitProgress(10)
        await new Promise(r => setTimeout(r, 1500))
        setSubmitProgress(100)
        alert(lang === 'ja' ? '登録を完了しました（デモ）' : 'Registration completed (demo)')
        setIsSubmitting(false)
        setSubmitProgress(0)
    }

    // ==========================================
    // Batch Registration Logic
    // ==========================================
    const [batchRows, setBatchRows] = useState<BatchRow[]>([])
    const batchCsvRef = useRef<HTMLInputElement>(null)
    const rowImageRef = useRef<HTMLInputElement>(null)
    const [activeRowId, setActiveRowId] = useState<string | null>(null)

    const handleBatchFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const parsed = await parseBatchFile(file)
            setBatchRows(parsed)
            if (parsed.length === 0) {
                alert(lang === 'ja' ? '有効なデータ行が見つかりませんでした。2行目以降にデータを入力してください。' : 'No valid data rows found. Please enter data from row 2 onwards.')
            }
        } catch (error) {
            alert(lang === 'ja' ? 'ファイルの読み込み時にエラーが発生しました。' : 'Error reading file.')
        }

        if (batchCsvRef.current) batchCsvRef.current.value = '' // reset
    }

    const handleRowImageClick = (rowId: string) => {
        setActiveRowId(rowId)
        rowImageRef.current?.click()
    }

    const handleRowImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !activeRowId) return
        const files = Array.from(e.target.files)
        setBatchRows(prev => prev.map(r => r.id === activeRowId ? { ...r, files: [...r.files, ...files] } : r))
        setActiveRowId(null)
    }

    const removeRowFile = (rowId: string, fileIdx: number) => {
        setBatchRows(prev => prev.map(r => r.id === rowId ? { ...r, files: r.files.filter((_, i) => i !== fileIdx) } : r))
    }

    const submitBatch = async () => {
        if (batchRows.length === 0) return
        setIsSubmitting(true)
        setSubmitProgress(10)
        await new Promise(r => setTimeout(r, 2000))
        setSubmitProgress(100)
        alert(lang === 'ja' ? `バッチ登録完了（${batchRows.length}件）` : `Batch registration completed (${batchRows.length} items)`)
        setIsSubmitting(false)
        setSubmitProgress(0)
        setBatchRows([])
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', paddingBottom: 60 }} className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{t('uploads.title')}</h1>
                {/* Unified Tab Navigation */}
                <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: 4, border: '1px solid var(--border)' }}>
                    <button className={`btn transition-colors ${activeTab === 'single' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-200'}`} style={{ border: 'none' }} onClick={() => setActiveTab('single')}>
                        {lang === 'ja' ? '個別登録' : 'Single Reg.'}
                    </button>
                    <button className={`btn transition-colors ${activeTab === 'batch' ? 'bg-blue-600 text-white shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-200'}`} style={{ border: 'none' }} onClick={() => setActiveTab('batch')}>
                        {lang === 'ja' ? 'ファイル一括 (CSV/Excel)' : 'Batch (CSV/Excel)'}
                    </button>
                    <button className={`btn transition-colors ${activeTab === 'api' ? 'bg-purple-600 text-white shadow-sm' : 'bg-transparent text-gray-400 hover:text-gray-200'}`} style={{ border: 'none' }} onClick={() => setActiveTab('api')}>
                        {lang === 'ja' ? 'API連携 (HL7 FHIR)' : 'API (HL7 FHIR)'}
                    </button>
                </div>
            </div>

            {/* TAB: SINGLE REGISTRATION */}
            {activeTab === 'single' && (
                <form onSubmit={submitSingle} className="space-y-6 animate-fade-in">
                    {/* ... (Single registration code exactly same as before) ... */}
                    <div className="panel p-5">
                        <h3 className="mb-4 text-emerald-500 font-bold border-b border-gray-800 pb-2">{lang === 'ja' ? '1. 基本情報' : '1. Basic Info'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div><label className="label">{t('uploads.id')} *</label><input className="input-field" value={basic.id} onChange={e => setBasic({ ...basic, id: e.target.value })} required placeholder="PT-001" /></div>
                            <div><label className="label">{t('uploads.name')} *</label><input className="input-field" value={basic.name} onChange={e => setBasic({ ...basic, name: e.target.value })} required placeholder={lang === 'ja' ? '田中 太郎' : 'Taro Tanaka'} /></div>
                            <div><label className="label">{lang === 'ja' ? '生年月日' : 'DOB'}</label><input type="date" className="input-field" value={basic.dob} onChange={e => setBasic({ ...basic, dob: e.target.value })} /></div>
                            <div><label className="label">{lang === 'ja' ? '性別' : 'Sex'}</label><select className="input-field" value={basic.sex} onChange={e => setBasic({ ...basic, sex: e.target.value })}><option value="M">{lang === 'ja' ? '男性' : 'Male'}</option><option value="F">{lang === 'ja' ? '女性' : 'Female'}</option></select></div>
                        </div>
                    </div>

                    <div className="panel p-5">
                        <h3 className="mb-4 text-emerald-500 font-bold border-b border-gray-800 pb-2">{lang === 'ja' ? '2. 既往歴・身体情報' : '2. Med History & Vitals'}</h3>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                            {[
                                { key: 'diabetes', label: lang === 'ja' ? '糖尿病' : 'Diabetes' },
                                { key: 'htn', label: lang === 'ja' ? '高血圧' : 'Hypertension' },
                                { key: 'dyslipidemia', label: lang === 'ja' ? '脂質異常症' : 'Dyslipidemia' },
                                { key: 'glaucoma', label: lang === 'ja' ? '緑内障' : 'Glaucoma' },
                                { key: 'cataract', label: lang === 'ja' ? '白内障' : 'Cataract' }
                            ].map(({ key, label }) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: sysHist[key as keyof typeof sysHist] ? 'rgba(16,185,129,0.15)' : 'var(--bg-card)', border: `1px solid ${sysHist[key as keyof typeof sysHist] ? '#10b981' : 'var(--border)'}`, borderRadius: 'var(--radius)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input type="checkbox" checked={Boolean(sysHist[key as keyof typeof sysHist])} onChange={e => setSysHist({ ...sysHist, [key]: e.target.checked })} style={{ width: 16, height: 16 }} />
                                    {label}
                                </label>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div><label className="label">{lang === 'ja' ? '収縮期血圧' : 'Systolic BP'}</label><input type="number" className="input-field" value={vitals.systolic} onChange={e => setVitals({ ...vitals, systolic: e.target.value })} placeholder="120" /></div>
                            <div><label className="label">{lang === 'ja' ? '拡張期血圧' : 'Diastolic BP'}</label><input type="number" className="input-field" value={vitals.diastolic} onChange={e => setVitals({ ...vitals, diastolic: e.target.value })} placeholder="80" /></div>
                            <div><label className="label">HbA1c</label><input type="number" step="0.1" className="input-field" value={vitals.hba1c} onChange={e => setVitals({ ...vitals, hba1c: e.target.value })} placeholder="7.0" /></div>
                            <div><label className="label">{lang === 'ja' ? '喫煙歴' : 'Smoking'}</label><select className="input-field" value={vitals.smoking} onChange={e => setVitals({ ...vitals, smoking: e.target.value })}><option value="non_smoker">Non-smoker</option><option value="current">Current</option><option value="former">Former</option></select></div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div><label className="label">{lang === 'ja' ? 'アレルギー' : 'Allergies'}</label><textarea className="input-field" value={allergies} onChange={e => setAllergies(e.target.value)} rows={2} /></div>
                            <div><label className="label">{lang === 'ja' ? '家族歴' : 'Family History'}</label><textarea className="input-field" value={familyHist} onChange={e => setFamilyHist(e.target.value)} rows={2} /></div>
                        </div>

                        {/* Additional History Rows */}
                        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="label" style={{ margin: 0 }}>{lang === 'ja' ? 'その他の既往歴' : 'Other Medical History'}</label>
                            <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', height: 28 }} onClick={addHistRow}>
                                <Plus size={14} /> {lang === 'ja' ? '追加' : 'Add'}
                            </button>
                        </div>
                        {otherHist.map((h, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input className="input-field" placeholder={lang === 'ja' ? '疾患名' : 'Condition'} value={h.condition} onChange={e => { const n = [...otherHist]; n[i].condition = e.target.value; setOtherHist(n) }} style={{ flex: 2 }} />
                                <input className="input-field" placeholder={lang === 'ja' ? '発症年' : 'Since'} value={h.since} onChange={e => { const n = [...otherHist]; n[i].since = e.target.value; setOtherHist(n) }} style={{ flex: 1 }} />
                                <button type="button" className="btn btn-secondary" onClick={() => setOtherHist(otherHist.filter((_, j) => j !== i))}><Trash2 size={16} color="#ef4444" /></button>
                            </div>
                        ))}
                    </div>

                    {/* Medications */}
                    <div className="panel p-5">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                            <h3 className="text-emerald-500 font-bold m-0">{lang === 'ja' ? '3. 服薬歴' : '3. Medications'}</h3>
                            <button type="button" className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem', height: 28 }} onClick={addMedRow}>
                                <Plus size={14} /> {lang === 'ja' ? '追加' : 'Add'}
                            </button>
                        </div>
                        {meds.length === 0 && <p className="text-sm text-gray-400">{lang === 'ja' ? '服薬情報なし' : 'No medications.'}</p>}
                        {meds.map((m, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input className="input-field" placeholder={lang === 'ja' ? '薬剤名' : 'Drug Name'} value={m.name} onChange={e => { const n = [...meds]; n[i].name = e.target.value; setMeds(n) }} style={{ flex: 2 }} />
                                <input className="input-field" placeholder={lang === 'ja' ? '用量' : 'Dosage'} value={m.dosage} onChange={e => { const n = [...meds]; n[i].dosage = e.target.value; setMeds(n) }} style={{ flex: 1 }} />
                                <input className="input-field" placeholder={lang === 'ja' ? '頻度' : 'Frequency'} value={m.frequency} onChange={e => { const n = [...meds]; n[i].frequency = e.target.value; setMeds(n) }} style={{ flex: 1 }} />
                                <button type="button" className="btn btn-secondary" onClick={() => setMeds(meds.filter((_, j) => j !== i))}><Trash2 size={16} color="#ef4444" /></button>
                            </div>
                        ))}
                    </div>

                    {/* Screening Details */}
                    <div className="panel p-5">
                        <h3 className="mb-4 text-emerald-500 font-bold border-b border-gray-800 pb-2">{lang === 'ja' ? '4. 今回のスクリーニング所見' : '4. Current Screening'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div><label className="label">{lang === 'ja' ? '主訴' : 'Chief Complaint'}</label><textarea className="input-field" value={exam.chiefComplaint} onChange={e => setExam({ ...exam, chiefComplaint: e.target.value })} rows={2} /></div>
                            <div><label className="label">{lang === 'ja' ? '前眼部所見' : 'Anterior Findings'}</label><textarea className="input-field" value={exam.anterior} onChange={e => setExam({ ...exam, anterior: e.target.value })} rows={2} /></div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 16 }}>
                            <div><label className="label">{lang === 'ja' ? '視力 (右)' : 'VA (R)'}</label><input className="input-field" value={exam.vaR} onChange={e => setExam({ ...exam, vaR: e.target.value })} /></div>
                            <div><label className="label">{lang === 'ja' ? '視力 (左)' : 'VA (L)'}</label><input className="input-field" value={exam.vaL} onChange={e => setExam({ ...exam, vaL: e.target.value })} /></div>
                            <div><label className="label">{lang === 'ja' ? '眼圧 (右)' : 'IOP (R)'}</label><input className="input-field" value={exam.iopR} onChange={e => setExam({ ...exam, iopR: e.target.value })} /></div>
                            <div><label className="label">{lang === 'ja' ? '眼圧 (左)' : 'IOP (L)'}</label><input className="input-field" value={exam.iopL} onChange={e => setExam({ ...exam, iopL: e.target.value })} /></div>
                        </div>
                    </div>

                    {/* Images & Submission */}
                    <div className="panel p-5">
                        <h3 className="mb-4 text-emerald-500 font-bold border-b border-gray-800 pb-2">{lang === 'ja' ? '5. 画像・提出' : '5. Images & Submission'}</h3>
                        <div
                            style={{ border: '2px dashed var(--border)', padding: '40px 20px', textAlign: 'center', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-card)', transition: 'all 0.2s' }}
                            onClick={() => singleFileRef.current?.click()}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => {
                                e.preventDefault();
                                if (e.dataTransfer.files) {
                                    const added = Array.from(e.dataTransfer.files).map(f => ({ file: f, eye: f.name.toLowerCase().includes('left') ? 'left' : 'right' }))
                                    setSingleFiles(prev => [...prev, ...added])
                                }
                            }}
                        >
                            <UploadCloud style={{ margin: '0 auto 12px', width: 40, height: 40, color: 'var(--primary)', opacity: 0.8 }} />
                            <p style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)' }}>{lang === 'ja' ? 'クリックまたはドラッグして画像を追加' : 'Click to add images'}</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 8 }}>{lang === 'ja' ? 'JPEG, PNG, DICOM等のあらゆる形式に対応' : 'Supports all formats (JPEG, PNG, DICOM etc)'}</p>
                            <input type="file" multiple ref={singleFileRef} style={{ display: 'none' }} onChange={handleSingleFileChange} accept="*/*" />
                        </div>

                        {singleFiles.length > 0 && (
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {singleFiles.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)' }}>
                                        <FileImage size={20} color="var(--primary)" />
                                        <span style={{ flex: 1, fontSize: '0.9rem' }}>{f.file.name}</span>
                                        <select className="input-field" style={{ width: 120, padding: '6px 10px' }} value={f.eye} onChange={e => { const n = [...singleFiles]; n[i].eye = e.target.value; setSingleFiles(n) }}>
                                            <option value="right">{lang === 'ja' ? '右眼' : 'Right'}</option>
                                            <option value="left">{lang === 'ja' ? '左眼' : 'Left'}</option>
                                        </select>
                                        <button type="button" onClick={() => removeSingleFile(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><X size={18} color="#ef4444" /></button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ marginTop: 32, display: 'flex', justifyItems: 'flex-end', gap: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginRight: 'auto' }}>
                                <input type="checkbox" checked={exam.urgent} onChange={e => setExam({ ...exam, urgent: e.target.checked })} style={{ width: 18, height: 18 }} />
                                <span style={{ color: exam.urgent ? '#ef4444' : 'var(--text)', fontWeight: exam.urgent ? 700 : 400 }}>{lang === 'ja' ? '緊急読影としてマーク' : 'Mark as Urgent'}</span>
                            </label>

                            <button type="submit" className="btn btn-primary bg-emerald-600 hover:bg-emerald-500" style={{ padding: '0 32px', height: 48, fontSize: '1.05rem', border: 'none' }} disabled={isSubmitting}>
                                {isSubmitting ? (lang === 'ja' ? '送信中...' : 'Submitting...') : (lang === 'ja' ? 'この内容でスクリーニングを提出' : 'Submit Screening')}
                            </button>
                        </div>
                        {isSubmitting && <div style={{ marginTop: 12, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', background: '#10b981', transition: 'all 0.3s', width: `${submitProgress}%` }} /></div>}
                    </div>
                </form>
            )}

            {/* TAB: BATCH REGISTRATION (Excel/CSV) */}
            {activeTab === 'batch' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="panel p-6">
                        <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-gray-700 rounded-lg bg-gray-900/50">
                            <UploadCloud className="mb-4 text-blue-500" size={56} />
                            <h3 className="text-xl font-bold mb-2">{lang === 'ja' ? 'ファイルから一括取り込み' : 'Batch Import from File'}</h3>
                            <p className="text-gray-400 mb-6">{lang === 'ja' ? 'CSV または Excel (.xlsx) ファイルに対応しています。' : 'Supports CSV and Excel (.xlsx) files.'}</p>

                            <div className="flex gap-4">
                                <button className="btn btn-primary bg-blue-600 hover:bg-blue-500 border-none px-6 py-3" onClick={() => batchCsvRef.current?.click()}>
                                    {lang === 'ja' ? 'ファイルを選択してアップロード' : 'Select File to Upload'}
                                </button>
                                <input type="file" ref={batchCsvRef} onChange={handleBatchFileUpload} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" style={{ display: 'none' }} />
                            </div>
                        </div>

                        {/* Sample Download Section */}
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <h4 className="font-bold flex items-center gap-2 mb-3">
                                <Download size={18} className="text-blue-400" />
                                {lang === 'ja' ? 'サンプルフォーマットのダウンロード' : 'Download Sample Format'}
                            </h4>
                            <p className="text-sm text-gray-400 mb-4 ml-6">
                                {lang === 'ja'
                                    ? '1行目はサンプルデータ、2行目以降に実際のデータを入力してアップロードしてください。（1行目はシステムで自動スキップされます）'
                                    : 'Row 1 requires sample data. Please enter actual data from Row 2 onwards. (Row 1 is automatically skipped by the system)'}
                            </p>
                            <div className="flex gap-3 ml-6">
                                <button className="btn btn-secondary text-sm flex items-center gap-2" onClick={() => downloadSampleFile('xlsx')}>
                                    <FileImage size={16} /> {lang === 'ja' ? 'Excelサンプル ダウンロード' : 'Download Excel Sample'}
                                </button>
                                <button className="btn btn-secondary text-sm flex items-center gap-2" onClick={() => downloadSampleFile('csv')}>
                                    <FileImage size={16} /> {lang === 'ja' ? 'CSVサンプル ダウンロード' : 'Download CSV Sample'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Preview Table for Batch */}
                    {batchRows.length > 0 && (
                        <div className="panel animate-fade-in-up">
                            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900">
                                <h3 className="font-bold flex items-center gap-2 m-0">
                                    <Table size={20} className="text-blue-400" />
                                    {lang === 'ja' ? `取り込みプレビュー (${batchRows.length}件)` : `Import Preview (${batchRows.length} rows)`}
                                </h3>
                                <button className="btn btn-primary bg-blue-600 border-none" onClick={submitBatch} disabled={isSubmitting} style={{ padding: '0 20px', height: 36 }}>
                                    {isSubmitting ? 'Submitting...' : (lang === 'ja' ? '全件を登録して送信' : 'Submit All')}
                                </button>
                            </div>

                            <table className="w-full text-left border-collapse text-sm">
                                <thead>
                                    <tr className="bg-gray-800 border-b-2 border-gray-700">
                                        <th className="p-3 font-semibold w-32">ID</th>
                                        <th className="p-3 font-semibold">{lang === 'ja' ? '氏名' : 'Name'}</th>
                                        <th className="p-3 font-semibold">{lang === 'ja' ? '生年月日' : 'DOB'}</th>
                                        <th className="p-3 font-semibold w-1/4">{lang === 'ja' ? '臨床情報(抽出)' : 'Clinical Info'}</th>
                                        <th className="p-3 font-semibold w-1/4">{lang === 'ja' ? '画像' : 'Images'}</th>
                                        <th className="p-3 font-semibold w-24">{lang === 'ja' ? 'アクション' : 'Action'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchRows.map(row => (
                                        <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="p-3 font-mono text-blue-400">{row.patientId}</td>
                                            <td className="p-3">{row.name}</td>
                                            <td className="p-3 text-gray-400">{row.dob}</td>
                                            <td className="p-3 text-gray-400 text-xs">
                                                {row.clinicalData && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {row.clinicalData.diabetes && <span className="bg-emerald-900 text-emerald-300 px-1 rounded">DM</span>}
                                                        {row.clinicalData.htn && <span className="bg-emerald-900 text-emerald-300 px-1 rounded">HTN</span>}
                                                        {row.clinicalData.chiefComplaint && <span className="bg-gray-700 px-1 rounded truncate max-w-[100px]" title={row.clinicalData.chiefComplaint}>CC:{row.clinicalData.chiefComplaint}</span>}
                                                        {row.clinicalData.urgent && <span className="bg-red-900 text-red-300 px-1 rounded">Urgent</span>}
                                                        {(!row.clinicalData.diabetes && !row.clinicalData.htn && !row.clinicalData.chiefComplaint && !row.clinicalData.urgent) && <span className="italic">Basic only</span>}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {row.files.length > 0 ? (
                                                    <div className="flex flex-col gap-1">
                                                        {row.files.map((f, i) => (
                                                            <div key={i} className="flex items-center gap-2 text-xs bg-gray-900 px-2 py-1.5 rounded border border-gray-700">
                                                                <FileImage size={12} className="text-blue-400 shrink-0" />
                                                                <span className="truncate flex-1 max-w-[150px]">{f.name}</span>
                                                                <button onClick={() => removeRowFile(row.id, i)} className="text-red-400 hover:text-red-300 ml-auto p-0.5"><X size={14} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <span className="text-gray-500 text-xs italic">{lang === 'ja' ? '未添付' : 'No images'}</span>}
                                            </td>
                                            <td className="p-3">
                                                <button className="btn btn-secondary text-xs h-8 px-3 flex items-center gap-1 bg-gray-800 hover:bg-gray-700 border-gray-600" onClick={() => handleRowImageClick(row.id)}>
                                                    <Plus size={14} /> {lang === 'ja' ? '画像添付' : 'Attach'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Hidden file input for row image attachment */}
                            <input type="file" multiple ref={rowImageRef} onChange={handleRowImageChange} accept="*/*" style={{ display: 'none' }} />
                        </div>
                    )}
                </div>
            )}

            {/* TAB: API INTEGRATION */}
            {activeTab === 'api' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="panel p-8">
                        <div className="flex items-start gap-6 border-b border-gray-800 pb-8 mb-8">
                            <div className="bg-purple-900/30 p-4 rounded-xl shrink-0">
                                <Database size={48} className="text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-purple-400 mb-2">{lang === 'ja' ? 'API連携 (HL7 FHIR)' : 'API Integration (HL7 FHIR)'}</h3>
                                <p className="text-gray-300 leading-relaxed max-w-2xl">
                                    {lang === 'ja'
                                        ? 'テレファンドゥス・プラットフォームは、標準規格である HL7 FHIR (Fast Healthcare Interoperability Resources) に準拠したWeb APIを提供しています。電子カルテ(EMR)システムや既存の院内ネットワークと直接連携することで、検査の自動登録・画像転送・読影レポートの返却をシームレスに行うことが可能です。'
                                        : 'The Tele-Fundus platform provides standardized Web APIs compliant with HL7 FHIR. Direct integration with your EMR system enables seamless automated screening registration, image transfer, and reading report retrieval.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Col: Setup Info */}
                            <div className="space-y-6">
                                <section>
                                    <h4 className="font-bold flex items-center gap-2 mb-3 text-gray-200">
                                        <Webhook size={18} className="text-purple-400" />
                                        {lang === 'ja' ? '連携トリガーの設定' : 'Integration Triggers'}
                                    </h4>
                                    <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
                                        <ul className="space-y-3 text-sm text-gray-300 list-disc ml-4 marker:text-purple-500">
                                            <li>
                                                <strong className="text-gray-200 block">{lang === 'ja' ? '新患登録 / 患者情報更新' : 'Patient Registration / Update'}</strong>
                                                FHIR <code className="text-purple-300 text-xs">Patient</code> リソースの作成・更新をトリガーに、プラットフォーム側に患者マスターを同期します。
                                            </li>
                                            <li>
                                                <strong className="text-gray-200 block">{lang === 'ja' ? '検査オーダー (画像転送)' : 'Exam Order (Image Transfer)'}</strong>
                                                FHIR <code className="text-purple-300 text-xs">DiagnosticReport</code> / <code className="text-purple-300 text-xs">Media</code> を用いて、撮影された眼底・OCT画像をメタデータと共に自動送信します。
                                            </li>
                                            <li>
                                                <strong className="text-gray-200 block">{lang === 'ja' ? '読影結果の受信Webhook' : 'Reading Result Webhook'}</strong>
                                                URLエンドポイントを登録すると、専門医から読影結果が返却された際にJSON形式のペイロードをPUSH通知します。
                                            </li>
                                        </ul>
                                    </div>
                                </section>

                                <button className="btn btn-primary bg-purple-600 hover:bg-purple-500 border-none w-full">
                                    {lang === 'ja' ? 'APIキーとWebhook設定を開く' : 'Open API Key & Webhook Settings'}
                                </button>
                            </div>

                            {/* Right Col: Code Example */}
                            <div>
                                <h4 className="font-bold flex items-center gap-2 mb-3 text-gray-200">
                                    {lang === 'ja' ? '連携サンプルコード (FHIR JSON)' : 'Example Snippet (FHIR JSON)'}
                                </h4>
                                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto border border-gray-800" style={{ whiteSpace: 'pre' }}>
                                    {`{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Patient",
        "id": "PT-2026-001",
        "name": [{"text": "山田 太郎"}],
        "gender": "male",
        "birthDate": "1950-01-01"
      },
      "request": { "method": "PUT", "url": "Patient/PT-2026-001" }
    },
    {
      "resource": {
        "resourceType": "Condition",
        "code": { "coding": [{ "system": "http://snomed.info/sct", "code": "73211009", "display": "Diabetes mellitus" }] },
        "subject": { "reference": "Patient/PT-2026-001" }
      },
      "request": { "method": "POST", "url": "Condition" }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "code": { "coding": [{ "system": "http://loinc.org", "code": "4548-4", "display": "HbA1c" }] },
        "valueQuantity": { "value": 7.2, "unit": "%" },
        "subject": { "reference": "Patient/PT-2026-001" }
      },
      "request": { "method": "POST", "url": "Observation" }
    },
    {
      "resource": {
        "resourceType": "DiagnosticReport",
        "status": "registered",
        "category": [{ "coding": [{ "system": "http://snomed.info/sct", "code": "416801004", "display": "Retinal photography" }] }],
        "subject": { "reference": "Patient/PT-2026-001" },
        "extension": [{ "url": "http://example.org/fhir/StructureDefinition/urgent-flag", "valueBoolean": false }],
        "presentedForm": [{
          "contentType": "image/jpeg",
          "url": "https://storage.local/img.jpg",
          "title": "Fundus Right Eye"
        }]
      },
      "request": { "method": "POST", "url": "DiagnosticReport" }
    }
  ]
}`}
                                </div>
                                <div className="flex gap-3 justify-end mt-4">
                                    <button className="text-purple-400 text-sm hover:underline">{lang === 'ja' ? 'APIドキュメントを見る' : 'View API Documentation'}</button>
                                    <button className="text-purple-400 text-sm hover:underline">{lang === 'ja' ? 'Swagger UIを開く' : 'Open Swagger UI'}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
