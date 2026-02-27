import { useState } from 'react'
import { FileText, Check, Send, ChevronDown } from 'lucide-react'

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

export function ReportPanel({ lang, onSubmit }: { lang: string; onSubmit?: () => void }) {
    const [activeEye, setActiveEye] = useState<'right' | 'left'>('right')
    const [findings, setFindings] = useState<Record<string, Record<string, boolean>>>({ right: {}, left: {} })
    const [severity, setSeverity] = useState<Record<string, string>>({ right: 'none', left: 'none' })
    const [judgmentCode, setJudgmentCode] = useState('')
    const [referralRequired, setReferralRequired] = useState(false)
    const [reportText, setReportText] = useState('')
    const [showTemplates, setShowTemplates] = useState(false)

    const toggleFinding = (key: string) => {
        setFindings(prev => ({
            ...prev,
            [activeEye]: { ...prev[activeEye], [key]: !prev[activeEye][key] }
        }))
    }

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        setReportText(lang === 'ja' ? t.text.ja : t.text.en)
        setShowTemplates(false)
    }

    const rightCount = Object.values(findings.right).filter(Boolean).length
    const leftCount = Object.values(findings.left).filter(Boolean).length

    return (
        <div className="report-panel" style={{
            height: '100%', overflow: 'auto', background: 'var(--bg-card)',
            borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', background: 'rgba(59,130,246,0.05)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                    {lang === 'ja' ? '読影レポート' : 'Reading Report'}
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }}>
                {/* Eye Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                    {(['right', 'left'] as const).map(eye => (
                        <button key={eye} onClick={() => setActiveEye(eye)} style={{
                            flex: 1, padding: '8px', background: activeEye === eye ? 'var(--bg-main)' : 'transparent',
                            border: 'none', borderBottom: activeEye === eye ? '2px solid var(--primary)' : '2px solid transparent',
                            color: activeEye === eye ? 'var(--text)' : 'var(--text-muted)',
                            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
                        }}>
                            {eye === 'right' ? (lang === 'ja' ? '右眼 OD' : 'Right OD') : (lang === 'ja' ? '左眼 OS' : 'Left OS')}
                            {(eye === 'right' ? rightCount : leftCount) > 0 && (
                                <span className="badge badge-warning" style={{ marginLeft: 6, fontSize: '0.6rem' }}>
                                    {eye === 'right' ? rightCount : leftCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Findings Checklist */}
                <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                        {lang === 'ja' ? '所見チェックリスト' : 'Finding Checklist'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                        {FINDING_ITEMS.map(item => {
                            const checked = findings[activeEye][item.key]
                            return (
                                <label key={item.key} style={{
                                    display: 'flex', alignItems: 'center', gap: 4, padding: '4px 6px',
                                    borderRadius: 4, fontSize: '0.72rem', cursor: 'pointer',
                                    background: checked ? 'rgba(239,68,68,0.1)' : 'transparent',
                                    border: `1px solid ${checked ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                                    fontWeight: checked ? 600 : 400, transition: 'all 0.15s',
                                }}>
                                    <input type="checkbox" checked={checked || false} onChange={() => toggleFinding(item.key)} style={{ width: 12, height: 12 }} />
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
                                <button key={s.value} onClick={() => setSeverity({ ...severity, [activeEye]: s.value })} style={{
                                    flex: 1, padding: '4px 6px', fontSize: '0.7rem', fontWeight: severity[activeEye] === s.value ? 700 : 400,
                                    border: `1px solid ${severity[activeEye] === s.value ? s.color : 'var(--border)'}`,
                                    background: severity[activeEye] === s.value ? `${s.color}20` : 'var(--bg-card)',
                                    color: severity[activeEye] === s.value ? s.color : 'var(--text-muted)',
                                    borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
                                }}>
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Judgment */}
                <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase' }}>
                        {lang === 'ja' ? '判定' : 'Judgment'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {JUDGMENT_CODES.map(j => (
                            <button key={j.code} onClick={() => setJudgmentCode(j.code)} style={{
                                padding: '5px 8px', fontSize: '0.75rem', textAlign: 'left',
                                border: `1px solid ${judgmentCode === j.code ? j.color : 'var(--border)'}`,
                                background: judgmentCode === j.code ? `${j.color}15` : 'transparent',
                                color: judgmentCode === j.code ? j.color : 'var(--text)',
                                fontWeight: judgmentCode === j.code ? 700 : 400,
                                borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
                            }}>
                                {lang === 'ja' ? j.ja : j.en}
                            </button>
                        ))}
                    </div>

                    {/* Referral */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={referralRequired} onChange={e => setReferralRequired(e.target.checked)} />
                        <span style={{ fontWeight: referralRequired ? 600 : 400, color: referralRequired ? '#ef4444' : 'var(--text)' }}>
                            {lang === 'ja' ? '紹介状が必要' : 'Referral Required'}
                        </span>
                    </label>
                </div>

                {/* Report Text */}
                <div style={{ padding: '8px 10px', borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {lang === 'ja' ? 'コメント' : 'Comments'}
                        </div>
                        <div style={{ position: 'relative' }}>
                            <button onClick={() => setShowTemplates(!showTemplates)} style={{
                                padding: '3px 8px', fontSize: '0.68rem', border: '1px solid var(--border)',
                                background: 'var(--bg-card)', borderRadius: 4, cursor: 'pointer',
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
                        value={reportText}
                        onChange={e => setReportText(e.target.value)}
                        placeholder={lang === 'ja' ? '所見・コメントを記入…' : 'Enter findings and comments…'}
                        style={{ fontSize: '0.88rem', resize: 'vertical', width: '100%', boxSizing: 'border-box', minHeight: 140, lineHeight: 1.6 }}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1, fontSize: '0.78rem', padding: '8px', minHeight: 'unset' }}>
                    <Check style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '保存' : 'Save'}
                </button>
                <button className="btn btn-primary" style={{ flex: 1, fontSize: '0.78rem', padding: '8px', minHeight: 'unset' }} onClick={onSubmit}>
                    <Send style={{ width: 14, height: 14 }} /> {lang === 'ja' ? '送信' : 'Submit'}
                </button>
            </div>
        </div>
    )
}
