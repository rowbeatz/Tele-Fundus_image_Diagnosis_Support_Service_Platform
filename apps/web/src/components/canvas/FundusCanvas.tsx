import React, { useRef, useEffect, useState, useCallback } from 'react'

interface FundusCanvasProps {
    imageUrl: string
    brightness: number
    contrast: number
    invert: boolean
    onAnnotationsChange?: (annotations: any) => void
    // Sync support
    externalPan?: { x: number; y: number }
    externalScale?: number
    onTransformChange?: (x: number, y: number, scale: number) => void
}

export function FundusCanvas({ imageUrl, brightness, contrast, invert, externalPan, externalScale, onTransformChange }: FundusCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)

    // Transform states
    const [scale, setScale] = useState(1)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Apply external sync
    useEffect(() => {
        if (externalPan) setPan(externalPan)
    }, [externalPan?.x, externalPan?.y])

    useEffect(() => {
        if (externalScale !== undefined) setScale(externalScale)
    }, [externalScale])

    // Draw loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext('2d')
        const img = imageRef.current

        if (!canvas || !ctx || !img) return

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Apply transformations
        ctx.save()
        ctx.translate(canvas.width / 2 + pan.x, canvas.height / 2 + pan.y)
        ctx.scale(scale, scale)

        // Center the image based on its natural dimensions
        const imgWidth = img.naturalWidth
        const imgHeight = img.naturalHeight
        const ratio = Math.min(canvas.width / imgWidth, canvas.height / imgHeight)

        const drawWidth = imgWidth * ratio
        const drawHeight = imgHeight * ratio

        // Apply CSS filters for performance (Hardware accelerated usually)
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) ${invert ? 'invert(100%)' : ''}`

        ctx.drawImage(
            img,
            -drawWidth / 2,
            -drawHeight / 2,
            drawWidth,
            drawHeight
        )

        ctx.restore()
    }, [pan, scale, brightness, contrast, invert])

    // Initialize and load image
    useEffect(() => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = imageUrl
        img.onload = () => {
            imageRef.current = img
            // Reset transform on new image
            setScale(1)
            setPan({ x: 0, y: 0 })
            draw()
        }
    }, [imageUrl, draw])

    // Trigger draw on transform/filter changes
    useEffect(() => {
        draw()
    }, [draw])

    // Handle Resize
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
        handleResize() // init
        return () => window.removeEventListener('resize', handleResize)
    }, [draw])

    // Interactions
    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault()
        const zoomSensitivity = 0.001
        const delta = -e.deltaY * zoomSensitivity
        const newScale = Math.min(Math.max(0.1, scale + delta), 10)
        setScale(newScale)
        if (onTransformChange) onTransformChange(pan.x, pan.y, newScale)
    }

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX, y: e.clientY })
        if (canvasRef.current) {
            canvasRef.current.setPointerCapture(e.pointerId)
        }
    }

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y
        const newPan = { x: pan.x + dx, y: pan.y + dy }
        setPan(newPan)
        setDragStart({ x: e.clientX, y: e.clientY })
        if (onTransformChange) onTransformChange(newPan.x, newPan.y, scale)
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false)
        if (canvasRef.current) {
            canvasRef.current.releasePointerCapture(e.pointerId)
        }
    }

    return (
        <div className="w-full h-full bg-black overflow-hidden relative cursor-grab active:cursor-grabbing">
            <canvas
                ref={canvasRef}
                className="block touch-none"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            />
        </div>
    )
}
