import { useState, useCallback } from 'react'

interface MeasurePoint {
    x: number
    y: number
}

interface Measurement {
    id: number
    start: MeasurePoint
    end: MeasurePoint
    distancePx: number
    distanceMm: string  // approximate
}

interface MeasureToolProps {
    active: boolean
    canvasWidth: number
    canvasHeight: number
    lang: string
    onMeasurementsChange?: (measurements: Measurement[]) => void
}

// Approximate conversion: assuming typical fundus image covers ~6mm diameter
const PX_TO_MM_RATIO = 6 / 500  // rough estimate for demo

/**
 * MeasureTool — SVG overlay for caliper (distance) measurements.
 * Click two points to draw a line with distance label.
 * Supports multiple measurements with a clear all button.
 */
export function MeasureTool({ active, lang, onMeasurementsChange }: MeasureToolProps) {
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [tempPoint, setTempPoint] = useState<MeasurePoint | null>(null)
    const [mousePos, setMousePos] = useState<MeasurePoint | null>(null)

    const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!active) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        if (!tempPoint) {
            setTempPoint({ x, y })
        } else {
            const dx = x - tempPoint.x
            const dy = y - tempPoint.y
            const distPx = Math.sqrt(dx * dx + dy * dy)
            const distMm = (distPx * PX_TO_MM_RATIO).toFixed(2)

            const newMeasurement: Measurement = {
                id: Date.now(),
                start: tempPoint,
                end: { x, y },
                distancePx: Math.round(distPx),
                distanceMm: distMm,
            }

            const updated = [...measurements, newMeasurement]
            setMeasurements(updated)
            setTempPoint(null)
            onMeasurementsChange?.(updated)
        }
    }, [active, tempPoint, measurements, onMeasurementsChange])

    const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        if (!active || !tempPoint) return
        const rect = e.currentTarget.getBoundingClientRect()
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }, [active, tempPoint])

    const clearAll = () => {
        setMeasurements([])
        setTempPoint(null)
        onMeasurementsChange?.([])
    }

    if (!active && measurements.length === 0) return null

    return (
        <>
            <svg
                className="measure-overlay"
                style={{
                    position: 'absolute', top: 0, left: 0,
                    width: '100%', height: '100%',
                    cursor: active ? 'crosshair' : 'default',
                    pointerEvents: active ? 'auto' : 'none',
                    zIndex: 10,
                }}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
            >
                {/* Completed measurements */}
                {measurements.map(m => {
                    const midX = (m.start.x + m.end.x) / 2
                    const midY = (m.start.y + m.end.y) / 2
                    return (
                        <g key={m.id}>
                            {/* Line */}
                            <line
                                x1={m.start.x} y1={m.start.y}
                                x2={m.end.x} y2={m.end.y}
                                stroke="#fbbf24" strokeWidth="2"
                                strokeDasharray="4,2"
                            />
                            {/* Endpoints */}
                            <circle cx={m.start.x} cy={m.start.y} r="4" fill="#fbbf24" stroke="black" strokeWidth="1" />
                            <circle cx={m.end.x} cy={m.end.y} r="4" fill="#fbbf24" stroke="black" strokeWidth="1" />
                            {/* Label background */}
                            <rect
                                x={midX - 32} y={midY - 22}
                                width="64" height="20" rx="4"
                                fill="rgba(0,0,0,0.7)"
                            />
                            {/* Label text */}
                            <text
                                x={midX} y={midY - 9}
                                fill="#fbbf24" fontSize="11" fontWeight="600"
                                textAnchor="middle"
                                fontFamily="var(--font-sans)"
                            >
                                {m.distanceMm}mm
                            </text>
                        </g>
                    )
                })}

                {/* Active measurement (first point clicked, drawing to cursor) */}
                {tempPoint && mousePos && (
                    <g>
                        <line
                            x1={tempPoint.x} y1={tempPoint.y}
                            x2={mousePos.x} y2={mousePos.y}
                            stroke="#fbbf24" strokeWidth="1.5"
                            strokeDasharray="6,3"
                            opacity="0.7"
                        />
                        <circle cx={tempPoint.x} cy={tempPoint.y} r="4" fill="#fbbf24" stroke="black" strokeWidth="1" />
                        <circle cx={mousePos.x} cy={mousePos.y} r="3" fill="#fbbf24" opacity="0.5" />
                    </g>
                )}
            </svg>

            {/* Clear button (visible when there are measurements) */}
            {measurements.length > 0 && (
                <button className="measure-clear-btn" onClick={clearAll}>
                    {lang === 'ja' ? '計測クリア' : 'Clear All'}
                    <span className="measure-count">{measurements.length}</span>
                </button>
            )}
        </>
    )
}
