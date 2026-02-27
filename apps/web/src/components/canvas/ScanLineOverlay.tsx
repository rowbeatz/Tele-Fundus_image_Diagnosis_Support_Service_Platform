/**
 * ScanLineOverlay — Shows a draggable green line on the fundus image
 * indicating which OCT B-scan slice is currently being viewed.
 * Bidirectional: dragging on fundus updates OCT, and vice versa.
 */

import { useRef } from 'react'

interface ScanLineOverlayProps {
    position: number  // 0-100 (top to bottom)
    onPositionChange: (pos: number) => void
    visible: boolean
}

export function ScanLineOverlay({ position, onPositionChange, visible }: ScanLineOverlayProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)

    const updatePosition = (clientY: number) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const relativeY = clientY - rect.top
        const pct = Math.max(0, Math.min(100, (relativeY / rect.height) * 100))
        onPositionChange(Math.round(pct))
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault()
        isDragging.current = true
        updatePosition(e.clientY)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return
        updatePosition(e.clientY)
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    if (!visible) return null

    return (
        <div
            ref={containerRef}
            className="scan-line-overlay"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            {/* Horizontal scan line */}
            <div
                className="scan-line"
                style={{ top: `${position}%` }}
            >
                <div className="scan-line-handle left" />
                <div className="scan-line-handle right" />
            </div>
        </div>
    )
}
