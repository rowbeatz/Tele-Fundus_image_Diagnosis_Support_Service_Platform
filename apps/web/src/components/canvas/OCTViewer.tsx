import { useRef, useEffect, useState, useCallback } from 'react'

interface OCTViewerProps {
    scanPosition: number          // 0–100, which B-scan slice to show
    onScanPositionChange: (pos: number) => void
    brightness: number
    contrast: number
    invert: boolean
    lang: string
}

/**
 * OCT B-Scan Viewer — renders a single OCT cross-section image
 * with a slider to scroll through scan positions.
 * Currently uses a single demo image; in production, different
 * positions would load different slices from a volume dataset.
 */
export function OCTViewer({ scanPosition, onScanPositionChange, brightness, contrast, invert, lang }: OCTViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)
    const [loaded, setLoaded] = useState(false)

    // Load the demo OCT image
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = '/demo/oct_bscan_right_01.png'
        img.onload = () => {
            imageRef.current = img
            setLoaded(true)
        }
    }, [])

    // Draw the OCT image
    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const img = imageRef.current
        if (!canvas || !ctx || !img) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`

        // Fit image to canvas
        const ratio = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
        const w = img.naturalWidth * ratio
        const h = img.naturalHeight * ratio
        const x = (canvas.width - w) / 2
        const y = (canvas.height - h) / 2

        ctx.drawImage(img, x, y, w, h)
        ctx.filter = 'none'

        // Draw scan position indicator line (green horizontal line showing which slice)
        const lineY = y + (scanPosition / 100) * h
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(x, lineY)
        ctx.lineTo(x + w, lineY)
        ctx.stroke()
        ctx.setLineDash([])
    }, [brightness, contrast, invert, scanPosition, loaded])

    useEffect(() => { draw() }, [draw])

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current
            if (canvas && canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth
                canvas.height = canvas.parentElement.clientHeight
                draw()
            }
        }
        window.addEventListener('resize', handleResize)
        handleResize()
        return () => window.removeEventListener('resize', handleResize)
    }, [draw])

    return (
        <div className="oct-viewer">
            <div className="oct-canvas-wrapper">
                <canvas ref={canvasRef} className="oct-canvas" />
                <div className="oct-badge">OCT B-SCAN</div>
                <div className="oct-slice-info">
                    {lang === 'ja' ? `スキャン位置: ${scanPosition}%` : `Scan Position: ${scanPosition}%`}
                </div>
            </div>
            <div className="oct-slider-bar">
                <span className="oct-slider-label">{lang === 'ja' ? 'スキャン位置' : 'Scan'}</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={scanPosition}
                    onChange={e => onScanPositionChange(Number(e.target.value))}
                    className="oct-slider"
                />
            </div>
        </div>
    )
}
