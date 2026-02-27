/**
 * ThicknessMap — ETDRS (Early Treatment Diabetic Retinopathy Study) grid overlay
 * Renders a color-coded retinal thickness map with 9 sectors.
 * Uses simulated normative data for demo purposes.
 */

interface ThicknessMapProps {
    visible: boolean
    lang: string
}

// ETDRS grid sectors with simulated thickness values (microns)
// Based on typical normal retinal thickness ranges
const etdrsData = {
    center: { value: 261, status: 'normal' as const },
    innerSuperior: { value: 324, status: 'normal' as const },
    innerNasal: { value: 330, status: 'normal' as const },
    innerInferior: { value: 319, status: 'normal' as const },
    innerTemporal: { value: 312, status: 'normal' as const },
    outerSuperior: { value: 286, status: 'normal' as const },
    outerNasal: { value: 305, status: 'borderline' as const },
    outerInferior: { value: 271, status: 'normal' as const },
    outerTemporal: { value: 268, status: 'normal' as const },
}

const statusColor = {
    normal: { bg: 'rgba(34, 197, 94, 0.35)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.5)' },
    borderline: { bg: 'rgba(250, 204, 21, 0.35)', text: '#facc15', border: 'rgba(250, 204, 21, 0.5)' },
    abnormal: { bg: 'rgba(239, 68, 68, 0.35)', text: '#f87171', border: 'rgba(239, 68, 68, 0.5)' },
}

export function ThicknessMap({ visible, lang }: ThicknessMapProps) {
    if (!visible) return null

    return (
        <div className="thickness-map-overlay">
            {/* ETDRS Grid Circles */}
            <svg className="etdrs-grid" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
                {/* Outer circle */}
                <circle cx="200" cy="200" r="180" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                {/* Inner circle */}
                <circle cx="200" cy="200" r="100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
                {/* Crosshairs */}
                <line x1="200" y1="20" x2="200" y2="380" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <line x1="20" y1="200" x2="380" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Center sector */}
                <circle cx="200" cy="200" r="30"
                    fill={statusColor[etdrsData.center.status].bg}
                    stroke={statusColor[etdrsData.center.status].border}
                    strokeWidth="1"
                />
                <text x="200" y="196" textAnchor="middle" fill={statusColor[etdrsData.center.status].text}
                    fontSize="14" fontWeight="700" fontFamily="var(--font-sans)">
                    {etdrsData.center.value}
                </text>
                <text x="200" y="210" textAnchor="middle" fill="rgba(255,255,255,0.4)"
                    fontSize="8" fontFamily="var(--font-sans)">
                    μm
                </text>

                {/* Inner sectors */}
                {[
                    { data: etdrsData.innerSuperior, x: 200, y: 128 },
                    { data: etdrsData.innerNasal, x: 272, y: 200 },
                    { data: etdrsData.innerInferior, x: 200, y: 272 },
                    { data: etdrsData.innerTemporal, x: 128, y: 200 },
                ].map((s, i) => (
                    <g key={`inner-${i}`}>
                        <text x={s.x} y={s.y - 2} textAnchor="middle"
                            fill={statusColor[s.data.status].text}
                            fontSize="13" fontWeight="600" fontFamily="var(--font-sans)">
                            {s.data.value}
                        </text>
                        <text x={s.x} y={s.y + 11} textAnchor="middle"
                            fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="var(--font-sans)">
                            μm
                        </text>
                    </g>
                ))}

                {/* Outer sectors */}
                {[
                    { data: etdrsData.outerSuperior, x: 200, y: 60 },
                    { data: etdrsData.outerNasal, x: 340, y: 200 },
                    { data: etdrsData.outerInferior, x: 200, y: 340 },
                    { data: etdrsData.outerTemporal, x: 60, y: 200 },
                ].map((s, i) => (
                    <g key={`outer-${i}`}>
                        <text x={s.x} y={s.y - 2} textAnchor="middle"
                            fill={statusColor[s.data.status].text}
                            fontSize="12" fontWeight="600" fontFamily="var(--font-sans)">
                            {s.data.value}
                        </text>
                        <text x={s.x} y={s.y + 11} textAnchor="middle"
                            fill="rgba(255,255,255,0.35)" fontSize="7" fontFamily="var(--font-sans)">
                            μm
                        </text>
                    </g>
                ))}
            </svg>

            {/* Legend */}
            <div className="thickness-legend">
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#4ade80' }} />
                    <span>{lang === 'ja' ? '正常' : 'Normal'}</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#facc15' }} />
                    <span>{lang === 'ja' ? '境界域' : 'Borderline'}</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ background: '#f87171' }} />
                    <span>{lang === 'ja' ? '異常' : 'Abnormal'}</span>
                </div>
            </div>
        </div>
    )
}
