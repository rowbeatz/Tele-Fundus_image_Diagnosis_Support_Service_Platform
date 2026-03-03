import { useState, useEffect } from 'react'
import { FileText, ChevronDown, Eye, Lock, Save } from 'lucide-react'

const FINDING_ITEMS = [
    { key: 'drusen', ja: 'ドルーゼン', en: 'Drusen' },
    { key: 'hemorrhage', ja: '出血', en: 'Hemorrhage' },
    { key: 'hard_exudate', ja: '硬性白斑', en: 'Hard Exudates' },
    { key: 'soft_exudate', ja: '軟性白斑', en: 'Soft Exudates (CWS)' },
    { key: 'neovascularization', ja: '新生血管', en: 'Neovascularization' },
    { key: 'microaneurysm', ja: '毛細血管瘤', en: 'Microaneurysms' },
    { key: 'macular_edema', ja: '黄斑浮腫', en: 'Macular Edema' },
    { key: 'pigment_change', ja: '色素異常', en: 'Pigment Changes' },
    { key: 'optic_disc_abnormal', ja: '視神経乳頭異常', en: 'Optic Disc Abnormality' },
    { key: 'vessel_abnormal', ja: '血管異常', en: 'Vessel Abnormality' },
    { key: 'vitreous_opacity', ja: '硝子体混濁', en: 'Vitreous Opacity' },
    { key: 'retinal_detachment', ja: '網膜剥離', en: 'Retinal Detachment' },
]

const JUDGMENT_CODES = [
    { code: 'A', ja: 'A: 正常', en: 'A: Normal', color: '#10b981' },
    { code: 'B', ja: 'B: 要経過観察', en: 'B: Observation', color: '#f59e0b' },
    { code: 'C1', ja: 'C1: 要精密検査', en: 'C1: Detailed Exam', color: '#f97316' },
    { code: 'C2', ja: 'C2: 要治療', en: 'C2: Treatment Required', color: '#ef4444' },
    { code: 'D', ja: 'D: 緊急', en: 'D: Urgent', color: '#dc2626' },
]

const TEMPLATES = [
    { id: 'normal', ja: '正常所見テンプレート', en: 'Normal Finding Template', text: { ja: '両眼ともに眼底に異常所見は認められません。定期的な経過観察をお勧めします。', en: 'No abnormal findings in either eye fundus. Regular follow-up recommended.' } },
    { id: 'npdr_mild', ja: '軽度NPDR', en: 'Mild NPDR', text: { ja: '右眼に毛細血管瘤を数個認めます。糖尿病網膜症（単純型・軽度）に相当します。血糖コントロールの徹底と、6ヶ月後の再検査をお勧めします。', en: 'A few microaneurysms observed in the right eye. Consistent with mild nonproliferative diabetic retinopathy. Strict glycemic control and re-examination in 6 months recommended.' } },
    { id: 'glaucoma_suspect', ja: '緑内障疑い', en: 'Glaucoma Suspect', text: { ja: '視神経乳頭のC/D比が拡大傾向にあります（R: 0.7, L: 0.6）。視野検査および詳細な神経線維層解析を推奨します。', en: 'C/D ratio appears enlarged (R: 0.7, L: 0.6). Visual field testing and detailed RNFL analysis recommended.' } },
]

// Eye colors: Right (OD) = blue, Left (OS) = red/pink
const EYE_COLORS = {
    right: { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.4)', text: '#3b82f6', solid: '#3b82f6' },
    left: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', text: '#ef4444', solid: '#ef4444' },
}

interface ReportPanelProps {
    lang: string
    selectedEyeSide?: 'left' | 'right'
    onSubmit?: () => void
}

export function ReportPanel({ lang, selectedEyeSide, onSubmit }: ReportPanelProps) {
    const [activeEye, setActiveEye] = useState<'right' | 'left'>(selectedEyeSide || 'right')
    const [findings, setFindings] = useState<Record<string, Record<string, boolean>>>({ right: {}, left: {} })
    const [severity, setSeverity] = useState<Record<string, string>>({ right: 'none', left: 'none' })
    const [judgmentCode, setJudgmentCode] = useState<Record<string, string>>({ right: '', left: '' })
    const [referralRequired, setReferralRequired] = useState(false)
    const [reportText, setReportText] = useState<Record<string, string>>({ right: '', left: '' })
    const [showTemplates, setShowTemplates] = useState(false)
    const [reportStatus, setReportStatus] = useState<'draft' | 'saved' | 'confirmed'>('draft')
    const [confirmedAt, setConfirmedAt] = useState<string | null>(null)

    // Sync activeEye when viewer image changes
    useEffect(() => {
        if (selectedEyeSide) {
            setActiveEye(selectedEyeSide)
        }
    }, [selectedEyeSide])

    const toggleFinding = (key: string) => {
        if (reportStatus === 'confirmed') return
        setFindings(prev => ({
            ...prev,
            [activeEye]: { ...prev[activeEye], [key]: !prev[activeEye][key] }
        }))
    }

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        if (reportStatus === 'confirmed') return
        setReportText(prev => ({ ...prev, [activeEye]: lang === 'ja' ? t.text.ja : t.text.en }))
        setShowTemplates(false)
    }

    const rightCount = Object.values(findings.right).filter(Boolean).length
    const leftCount = Object.values(findings.left).filter(Boolean).length
    const currentEyeColor = EYE_COLORS[activeEye]

    // Get judgment label for the tag
    const getJudgmentLabel = (eye: 'right' | 'left') => {
        const code = judgmentCode[eye]
        if (!code) return null
        return JUDGMENT_CODES.find(j => j.code === code)
    }

    const handleSave = () => {
        setReportStatus('saved')
        // In future: POST /api/readings/:id/save
    }

    const handleConfirm = () => {
        const now = new Date().toLocaleString('ja-JP')
        setReportStatus('confirmed')
        setConfirmedAt(now)
        onSubmit?.()
        // In future: POST /api/readings/:id/confirm
    }

    return (
        <div className="report-panel" style={{
            height: '100%', overflow: 'auto', background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        }}>
            {/* Header with eye indicator */}
            <div style={{
                padding: '10px',
                borderBottom: `2px solid ${currentEyeColor.solid}`,
                background: currentEyeColor.bg,
                transition: 'all 0.25s ease',
            }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText style={{ width: 16, height: 16, color: currentEyeColor.solid }} />
                    {lang === 'ja' ? '読影レポート' : 'Reading Report'}
                </div>
                {/* Active eye indicator tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                        background: currentEyeColor.solid, color: '#fff',
                    }}>
                        <Eye style={{ width: 12, height: 12 }} />
                        {activeEye === 'right' ? (lang === 'ja' ? '右眼 OD' : 'RIGHT OD') : (lang === 'ja' ? '左眼 OS' : 'LEFT OS')}
                    </span>
                    {/* Judgment grade tag */}
                    {getJudgmentLabel(activeEye) && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                            background: getJudgmentLabel(activeEye)!.color + '20',
                            color: getJudgmentLabel(activeEye)!.color,
                            border: `1px solid ${getJudgmentLabel(activeEye)!.color}40`,
                        }}>
                            {lang === 'ja' ? getJudgmentLabel(activeEye)!.ja : getJudgmentLabel(activeEye)!.en}
                        </span>
                    )}
                    {/* Status tag */}
                    {reportStatus !== 'draft' && (
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 3,
                            padding: '3px 8px', borderRadius: 20, fontSize: '0.65rem', fontWeight: 600,
                            background: reportStatus === 'confirmed' ? 'rgba(59,130,246,0.15)' : 'rgba(16,185,129,0.15)',
                            color: reportStatus === 'confirmed' ? '#3b82f6' : '#10b981',
                        }}>
                            {reportStatus === 'confirmed' ? (lang === 'ja' ? '確定済' : 'Confirmed') : (lang === 'ja' ? '保存済' : 'Saved')}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {/* Eye Tabs — color-coded */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    {(['right', 'left'] as const).map(eye => {
                        const eyeC = EYE_COLORS[eye]
                        const judgLabel = getJudgmentLabel(eye)
                        const findingsCount = eye === 'right' ? rightCount : leftCount
                        return (
                            <button key={eye} onClick={() => setActiveEye(eye)} style={{
                                flex: 1, padding: '8px 6px', background: activeEye === eye ? eyeC.bg : 'transparent',
                                border: 'none', borderBottom: activeEye === eye ? `3px solid ${eyeC.solid}` : '3px solid transparent',
                                color: activeEye === eye ? eyeC.text : 'var(--text-muted)',
                                fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                            }}>
                                <span style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: eyeC.solid, opacity: activeEye === eye ? 1 : 0.4,
                                }} />
                                {eye === 'right' ? (lang === 'ja' ? '右眼 OD' : 'Right OD') : (lang === 'ja' ? '左眼 OS' : 'Left OS')}
                                {findingsCount > 0 && (
                                    <span style={{
                                        background: eyeC.solid, color: '#fff',
                                        fontSize: '0.6rem', fontWeight: 700,
                                        padding: '1px 5px', borderRadius: 10,
                                    }}>
                                        {findingsCount}
                                    </span>
                                )}
                                {judgLabel && (
                                    <span style={{
                                        fontSize: '0.6rem', fontWeight: 700,
                                        color: judgLabel.color,
                                    }}>
                                        {judgLabel.code}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Findings Checklist */}
                <div style={{ padding: '8px 10px', opacity: reportStatus === 'confirmed' ? 0.6 : 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                        {lang === 'ja' ? '所見チェックリスト' : 'Finding Checklist'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {FINDING_ITEMS.map(item => {
                            const checked = findings[activeEye][item.key]
                            return (
                                <label key={item.key} style={{
                                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px',
                                    borderRadius: 4, fontSize: '0.72rem', cursor: reportStatus === 'confirmed' ? 'not-allowed' : 'pointer',
                                    background: checked ? 'rgba(239,68,68,0.1)' : 'transparent',
                                    border: `1px solid ${checked ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                                    fontWeight: checked ? 600 : 400, transition: 'all 0.15s',
                                }}>
                                    <input type="checkbox" checked={checked || false} onChange={() => toggleFinding(item.key)} disabled={reportStatus === 'confirmed'} style={{ width: 12, height: 12 }} />
                                    {lang === 'ja' ? item.ja : item.en}
                                </label>
                            )
                        })}
                    </div>

                    {/* Severity */}
                    <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
                            {lang === 'ja' ? '重症度' : 'Severity'}
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                            {[
                                { value: 'none', label: lang === 'ja' ? 'なし' : 'None', color: '#10b981' },
                                { value: 'mild', label: lang === 'ja' ? '軽度' : 'Mild', color: '#f59e0b' },
                                { value: 'moderate', label: lang === 'ja' ? '中等度' : 'Moderate', color: '#f97316' },
                                { value: 'severe', label: lang === 'ja' ? '重度' : 'Severe', color: '#ef4444' },
                            ].map(s => (
                                <button key={s.value} onClick={() => { if (reportStatus !== 'confirmed') setSeverity({ ...severity, [activeEye]: s.value }) }} disabled={reportStatus === 'confirmed'} style={{
                                    flex: 1, padding: '4px 6px', fontSize: '0.7rem', fontWeight: severity[activeEye] === s.value ? 700 : 400,
                                    border: `1px solid ${severity[activeEye] === s.value ? s.color : 'var(--border)'}`,
                                    background: severity[activeEye] === s.value ? `${s.color}20` : 'var(--bg-card)',
                                    color: severity[activeEye] === s.value ? s.color : 'var(--text-muted)',
                                    borderRadius: 4, cursor: reportStatus === 'confirmed' ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                                }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Judgment — per eye */}
                <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)', opacity: reportStatus === 'confirmed' ? 0.6 : 1 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                        {lang === 'ja' ? `判定（${activeEye === 'right' ? '右眼' : '左眼'}）` : `Judgment (${activeEye === 'right' ? 'Right' : 'Left'})`}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {JUDGMENT_CODES.map(j => (
                            <button key={j.code} onClick={() => { if (reportStatus !== 'confirmed') setJudgmentCode(prev => ({ ...prev, [activeEye]: j.code })) }} disabled={reportStatus === 'confirmed'} style={{
                                padding: '5px 8px', fontSize: '0.75rem', textAlign: 'left',
                                border: `1px solid ${judgmentCode[activeEye] === j.code ? j.color : 'var(--border)'}`,
                                background: judgmentCode[activeEye] === j.code ? `${j.color}15` : 'transparent',
                                color: judgmentCode[activeEye] === j.code ? j.color : 'var(--text)',
                                fontWeight: judgmentCode[activeEye] === j.code ? 700 : 400,
                                borderRadius: 4, cursor: reportStatus === 'confirmed' ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
                            }}>
                                {lang === 'ja' ? j.ja : j.en}
                            </button>
                        ))}
                    </div>

                    {/* Referral */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.8rem', cursor: reportStatus === 'confirmed' ? 'not-allowed' : 'pointer' }}>
                        <input type="checkbox" checked={referralRequired} onChange={e => { if (reportStatus !== 'confirmed') setReferralRequired(e.target.checked) }} disabled={reportStatus === 'confirmed'} />
                        <span style={{ fontWeight: referralRequired ? 600 : 400, color: referralRequired ? '#ef4444' : 'var(--text)' }}>
                            {lang === 'ja' ? '紹介状が必要' : 'Referral Required'}
                        </span>
                    </label>
                </div>

                {/* Report Text — per eye */}
                <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {lang === 'ja' ? `コメント（${activeEye === 'right' ? '右眼' : '左眼'}）` : `Comments (${activeEye === 'right' ? 'Right' : 'Left'})`}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowTemplates(!showTemplates)} disabled={reportStatus === 'confirmed'} style={{
                                padding: '3px 8px', fontSize: '0.68rem', border: '1px solid var(--border)',
                                background: 'var(--bg-card)', borderRadius: 4, cursor: reportStatus === 'confirmed' ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)',
                            }}>
                                {lang === 'ja' ? 'テンプレート' : 'Templates'} <ChevronDown style={{ width: 10, height: 10 }} />
                            </button>
                            {showTemplates && (
                                <div style={{
                                    position: 'absolute', right: 0, top: '100%', marginTop: 4, width: 220,
                                    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)', zIndex: 10,
                                }}>
                                    {TEMPLATES.map(t => (
                                        <button key={t.id} onClick={() => applyTemplate(t)} style={{
                                            display: 'block', width: '100%', padding: '8px 12px', border: 'none',
                                            background: 'transparent', textAlign: 'left', cursor: 'pointer',
                                            fontSize: '0.75rem', color: 'var(--text)',
                                            borderBottom: '1px solid var(--border)',
                                        }}>
                                            {lang === 'ja' ? t.ja : t.en}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <textarea
                        className="form-input"
                        rows={8}
                        value={reportText[activeEye] || ''}
                        onChange={e => { if (reportStatus !== 'confirmed') setReportText(prev => ({ ...prev, [activeEye]: e.target.value })) }}
                        disabled={reportStatus === 'confirmed'}
                        placeholder={lang === 'ja' ? '所見・コメントを記入…' : 'Enter findings and comments…'}
                        style={{ fontSize: '0.88rem', resize: 'vertical', width: '100%', boxSizing: 'border-box', minHeight: 140, lineHeight: 1.6 }}
                    />
                </div>

                {/* Confirmed Status Bar */}
                {reportStatus !== 'draft' && (
                    <div style={{
                        margin: '0 10px 8px', padding: '8px 12px', borderRadius: 6,
                        fontSize: '0.75rem', fontWeight: 500,
                        background: reportStatus === 'confirmed' ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)',
                        border: `1px solid ${reportStatus === 'confirmed' ? 'rgba(59,130,246,0.25)' : 'rgba(16,185,129,0.25)'}`,
                        color: reportStatus === 'confirmed' ? '#3b82f6' : '#10b981',
                    }}>
                        {reportStatus === 'confirmed'
                            ? `✓ ${lang === 'ja' ? `レポート確定済み（${confirmedAt}）` : `Report confirmed (${confirmedAt})`}`
                            : `✓ ${lang === 'ja' ? 'レポート一時保存済み' : 'Report draft saved'}`
                        }
                    </div>
                )}

                {/* Both-eye summary tags */}
                <div style={{ padding: '4px 10px 8px', display: 'flex', gap: 6 }}>
                    {(['right', 'left'] as const).map(eye => {
                        const eyeC = EYE_COLORS[eye]
                        const judgLabel = getJudgmentLabel(eye)
                        const fc = eye === 'right' ? rightCount : leftCount
                        return (
                            <div key={eye} style={{
                                flex: 1, padding: '6px 8px', borderRadius: 6,
                                background: eyeC.bg, border: `1px solid ${eyeC.border}`,
                                fontSize: '0.68rem', lineHeight: 1.4,
                            }}>
                                <div style={{ fontWeight: 700, color: eyeC.text, marginBottom: 2 }}>
                                    {eye === 'right' ? (lang === 'ja' ? '右眼 OD' : 'R OD') : (lang === 'ja' ? '左眼 OS' : 'L OS')}
                                </div>
                                <div style={{ color: 'var(--text-muted)' }}>
                                    {lang === 'ja' ? `所見: ${fc}件` : `Findings: ${fc}`}
                                    {judgLabel && <span style={{ marginLeft: 6, fontWeight: 700, color: judgLabel.color }}>{judgLabel.code}</span>}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Action Buttons: Save / Confirm */}
            <div style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <button
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '8px', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    onClick={handleSave}
                    disabled={reportStatus === 'confirmed'}
                >
                    <Save style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '一時保存' : 'Save Draft'}
                </button>
                <button
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.78rem', padding: '8px', minHeight: 'unset', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                    onClick={handleConfirm}
                    disabled={reportStatus === 'confirmed'}
                >
                    <Lock style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '確定' : 'Confirm'}
                </button>
            </div>
        </div>
    )
}
