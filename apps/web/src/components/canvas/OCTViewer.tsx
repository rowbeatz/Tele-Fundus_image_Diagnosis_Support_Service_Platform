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

    // Segmentation state: Y positions (0-1 relative to image height) at 5 fixed X points
    const [ilmPoints, setIlmPoints] = useState([0.25, 0.28, 0.30, 0.27, 0.24])
    const [rpePoints, setRpePoints] = useState([0.65, 0.68, 0.70, 0.66, 0.63])

    // Dragging state
    const [dragging, setDragging] = useState<{ layer: 'ilm' | 'rpe', index: number } | null>(null)
    const [imageRenderInfo, setImageRenderInfo] = useState<{ x: number, y: number, w: number, h: number } | null>(null)

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

        // Filter and fit image
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`
        const ratio = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight)
        const w = img.naturalWidth * ratio
        const h = img.naturalHeight * ratio
        const x = (canvas.width - w) / 2
        const y = (canvas.height - h) / 2

        ctx.drawImage(img, x, y, w, h)
        ctx.filter = 'none'

        // Save layout info for interactivity
        setImageRenderInfo({ x, y, w, h })

        // Draw scan position indicator (green dashed line)
        const lineY = y + (scanPosition / 100) * h
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.3)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.moveTo(x, lineY)
        ctx.lineTo(x + w, lineY)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw Segmentation Lines
        const drawLayer = (points: number[], color: string, label: string) => {
            ctx.strokeStyle = color
            ctx.lineWidth = 2
            ctx.beginPath()
            points.forEach((py, i) => {
                const px = x + (i / (points.length - 1)) * w
                const actualY = y + py * h
                if (i === 0) ctx.moveTo(px, actualY)
                else ctx.lineTo(px, actualY)

                // Draw draggable control points
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(px, actualY, 4, 0, Math.PI * 2)
                ctx.fill()
            })
            ctx.stroke()

            // Label
            ctx.fillStyle = color
            ctx.font = '10px var(--font-sans)'
            ctx.fillText(label, x + w + 8, y + points[points.length - 1] * h + 4)
        }

        drawLayer(ilmPoints, '#ef4444', 'ILM') // Red ILM
        drawLayer(rpePoints, '#eab308', 'RPE') // Yellow RPE

    }, [brightness, contrast, invert, scanPosition, loaded, ilmPoints, rpePoints])

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

    // Interactivity: Drag to correct segmentations
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!imageRenderInfo) return
        const rect = e.currentTarget.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const { x, y, w, h } = imageRenderInfo

        const findTarget = (points: number[], layerName: 'ilm' | 'rpe') => {
            for (let i = 0; i < points.length; i++) {
                const px = x + (i / (points.length - 1)) * w
                const py = y + points[i] * h
                // Hitbox radius 10px
                if (Math.hypot(px - mx, py - my) < 10) {
                    return { layer: layerName, index: i }
                }
            }
            return null
        }

        const target = findTarget(ilmPoints, 'ilm') || findTarget(rpePoints, 'rpe')
        if (target) {
            setDragging(target)
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (canvas) {
            const rect = canvas.getBoundingClientRect()
            const mx = e.clientX - rect.left
            const my = e.clientY - rect.top
            let isHovering = false

            if (imageRenderInfo) {
                const { x, y, w, h } = imageRenderInfo
                const check = (points: number[]) => points.some((p, i) => Math.hypot((x + (i / (points.length - 1)) * w) - mx, (y + p * h) - my) < 10)
                isHovering = check(ilmPoints) || check(rpePoints)
            }
            canvas.style.cursor = dragging ? 'grabbing' : (isHovering ? 'grab' : 'default')
        }

        if (!dragging || !imageRenderInfo) return
        const rect = e.currentTarget.getBoundingClientRect()
        const my = e.clientY - rect.top
        const { y, h } = imageRenderInfo

        let newRelY = (my - y) / h
        newRelY = Math.max(0, Math.min(1, newRelY)) // clamp to image

        if (dragging.layer === 'ilm') {
            const newPoints = [...ilmPoints]
            newPoints[dragging.index] = newRelY
            setIlmPoints(newPoints)
        } else {
            const newPoints = [...rpePoints]
            newPoints[dragging.index] = newRelY
            setRpePoints(newPoints)
        }
    }

    const handleMouseUp = () => setDragging(null)

    return (
        <div className="oct-viewer">
            <div className="oct-canvas-wrapper" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                <canvas
                    ref={canvasRef}
                    className="oct-canvas"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                />
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
