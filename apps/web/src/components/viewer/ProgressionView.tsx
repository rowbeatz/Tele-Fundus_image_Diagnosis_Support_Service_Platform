import { useState } from 'react'
import { Calendar, TrendingUp, AlertTriangle } from 'lucide-react'

interface ProgressionEntry {
    screeningId: string
    date: string
    vaRight: string
    vaLeft: string
    iopRight: number
    iopLeft: number
    hba1c: number
    finding: string
    judgment: string
    imageUrl: string
}

const mockProgression: ProgressionEntry[] = [
    { screeningId: 'SCR-005', date: '2024-02-01', vaRight: '1.0 (1.2×)', vaLeft: '1.2 (1.2×)', iopRight: 13, iopLeft: 14, hba1c: 6.8, finding: '異常所見なし', judgment: 'A', imageUrl: '/demo/fundus_right_01.png' },
    { screeningId: 'SCR-004', date: '2024-08-05', vaRight: '0.9 (1.0×)', vaLeft: '1.0 (1.2×)', iopRight: 14, iopLeft: 15, hba1c: 7.0, finding: 'わずかな毛細血管瘤', judgment: 'B', imageUrl: '/demo/fundus_right_02.png' },
    { screeningId: 'SCR-003', date: '2025-02-10', vaRight: '0.8 (1.0×)', vaLeft: '1.0 (1.2×)', iopRight: 14, iopLeft: 15, hba1c: 7.1, finding: '毛細血管瘤 + 軽度出血', judgment: 'B', imageUrl: '/demo/fundus_left_01.png' },
    { screeningId: 'SCR-002', date: '2025-08-15', vaRight: '0.8 (1.0×)', vaLeft: '1.0 (1.2×)', iopRight: 15, iopLeft: 16, hba1c: 7.2, finding: '点状出血増加、硬性白斑出現', judgment: 'C1', imageUrl: '/demo/fundus_left_02.png' },
    { screeningId: 'SCR-001', date: '2026-02-26', vaRight: '0.7 (1.0×)', vaLeft: '1.0 (1.2×)', iopRight: 14, iopLeft: 16, hba1c: 7.2, finding: '点状出血残存、黄斑部ドルーゼン', judgment: 'C1', imageUrl: '/demo/fundus_right_01.png' },
]

const judgmentColor: Record<string, string> = { A: '#10b981', B: '#f59e0b', C1: '#f97316', C2: '#ef4444', D: '#dc2626' }

export function ProgressionView({ lang, onClose }: { lang: string; onClose?: () => void }) {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
    const data = mockProgression
    const maxIop = Math.max(...data.map(d => Math.max(d.iopRight, d.iopLeft)))
    const chartH = 120

    return (
        <div style={{
            height: '100%', overflow: 'auto', background: 'var(--bg-card)',
            display: 'flex', flexDirection: 'column',
        }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <TrendingUp style={{ width: 18, height: 18, color: 'var(--primary)' }} />
                <h3 style={{ margin: 0, fontSize: '0.95rem' }}>
                    {lang === 'ja' ? '時系列比較・進行度分析' : 'Temporal Comparison & Progression'}
                </h3>
                {onClose && (
                    <button className="btn btn-secondary" style={{ marginLeft: 'auto', padding: '4px 10px', minHeight: 28, fontSize: '0.75rem' }} onClick={onClose}>
                        {lang === 'ja' ? '閉じる' : 'Close'}
                    </button>
                )}
            </div>

            {/* Timeline */}
            <div style={{ padding: '12px 16px', flex: 1, overflow: 'auto' }}>
                {/* Mini Trend Chart: IOP */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                        {lang === 'ja' ? '眼圧推移 (mmHg)' : 'IOP Trend (mmHg)'}
                    </div>
                    <div style={{ position: 'relative', height: chartH, borderBottom: '1px solid var(--border)', borderLeft: '1px solid var(--border)' }}>
                        {/* Y-axis labels */}
                        {[0, Math.round(maxIop / 2), maxIop].map((v, i) => (
                            <div key={i} style={{
                                position: 'absolute', left: -22, fontSize: '0.6rem', color: 'var(--text-muted)',
                                top: chartH - (v / maxIop * chartH) - 6,
                            }}>
                                {v}
                            </div>
                        ))}
                        {/* Data points */}
                        {data.map((d, i) => {
                            const x = (i / (data.length - 1)) * 90 + 5
                            const yR = chartH - (d.iopRight / maxIop * chartH * 0.9)
                            const yL = chartH - (d.iopLeft / maxIop * chartH * 0.9)
                            return (
                                <div key={i}>
                                    <div style={{ position: 'absolute', left: `${x}%`, top: yR, width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 2 }}
                                        title={`R: ${d.iopRight} (${d.date})`}
                                        onClick={() => setSelectedIdx(i)}
                                    />
                                    <div style={{ position: 'absolute', left: `${x}%`, top: yL, width: 8, height: 8, borderRadius: '50%', background: '#ef4444', transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 2 }}
                                        title={`L: ${d.iopLeft} (${d.date})`}
                                        onClick={() => setSelectedIdx(i)}
                                    />
                                    {/* X label */}
                                    <div style={{ position: 'absolute', left: `${x}%`, bottom: -18, transform: 'translateX(-50%)', fontSize: '0.58rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                        {d.date.slice(2, 7)}
                                    </div>
                                </div>
                            )
                        })}
                        {/* Legend */}
                        <div style={{ position: 'absolute', top: 2, right: 4, display: 'flex', gap: 8, fontSize: '0.6rem' }}>
                            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', marginRight: 3 }} />R</span>
                            <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ef4444', marginRight: 3 }} />L</span>
                        </div>
                    </div>
                </div>

                {/* HbA1c Trend */}
                <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                        {lang === 'ja' ? 'HbA1c 推移' : 'HbA1c Trend'}
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 50 }}>
                        {data.map((d, i) => {
                            const h = (d.hba1c / 10) * 50
                            const color = d.hba1c > 7.0 ? '#ef4444' : d.hba1c > 6.5 ? '#f59e0b' : '#10b981'
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                    <span style={{ fontSize: '0.6rem', color }}>{d.hba1c}%</span>
                                    <div style={{ width: '80%', height: h, background: color, borderRadius: '3px 3px 0 0', opacity: 0.8, cursor: 'pointer' }} onClick={() => setSelectedIdx(i)} />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Timeline List */}
                <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    {lang === 'ja' ? '検査履歴' : 'Screening History'}
                </div>
                {data.map((d, i) => (
                    <div
                        key={d.screeningId}
                        onClick={() => setSelectedIdx(selectedIdx === i ? null : i)}
                        style={{
                            padding: '10px 12px', marginBottom: 6, borderRadius: 'var(--radius)',
                            border: `1px solid ${selectedIdx === i ? 'var(--primary)' : 'var(--border)'}`,
                            background: selectedIdx === i ? 'rgba(13,148,136,0.08)' : 'var(--bg-main)',
                            cursor: 'pointer', transition: 'all 0.15s',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Calendar style={{ width: 12, height: 12, color: 'var(--text-muted)' }} />
                                <span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{d.date}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: judgmentColor[d.judgment], fontSize: '0.78rem' }}>
                                {d.judgment}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 4 }}>
                            {d.finding}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>VA R: {d.vaRight}</span>
                            <span>IOP R/L: {d.iopRight}/{d.iopLeft}</span>
                        </div>

                        {/* Expanded Detail */}
                        {selectedIdx === i && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <img src={d.imageUrl} alt="fundus" style={{ width: 80, height: 80, borderRadius: 6, objectFit: 'cover', border: '1px solid var(--border)' }} />
                                    <div style={{ flex: 1, fontSize: '0.75rem' }}>
                                        <div>VA: R {d.vaRight} / L {d.vaLeft}</div>
                                        <div>IOP: R {d.iopRight} / L {d.iopLeft} mmHg</div>
                                        <div>HbA1c: {d.hba1c}%</div>
                                        <br />
                                        <div style={{ color: judgmentColor[d.judgment], fontWeight: 600 }}>
                                            {lang === 'ja' ? '判定' : 'Judgment'}: {d.judgment}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Progression Summary */}
                <div style={{ marginTop: 16, padding: '10px 12px', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius)', background: 'rgba(239,68,68,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <AlertTriangle style={{ width: 14, height: 14, color: '#f59e0b' }} />
                        <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                            {lang === 'ja' ? '進行度サマリー' : 'Progression Summary'}
                        </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                        {lang === 'ja'
                            ? '過去2年間で判定がA→C1へ進行。視力は右眼1.0→0.7に低下。HbA1c は 6.8%→7.2% に上昇。糖尿病網膜症の進行が疑われます。'
                            : 'Judgment progressed from A to C1 over 2 years. VA declined from 1.0 to 0.7 in right eye. HbA1c rose from 6.8% to 7.2%. Diabetic retinopathy progression suspected.'}
                    </div>
                </div>
            </div>
        </div>
    )
}
