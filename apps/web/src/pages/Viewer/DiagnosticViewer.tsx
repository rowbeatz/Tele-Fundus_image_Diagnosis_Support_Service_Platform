import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { FundusCanvas } from '../../components/canvas/FundusCanvas'
import { OCTViewer } from '../../components/canvas/OCTViewer'
import { MeasureTool } from '../../components/canvas/MeasureTool'
import { ThicknessMap } from '../../components/canvas/ThicknessMap'
import { ScanLineOverlay } from '../../components/canvas/ScanLineOverlay'
import { Button } from '../../components/ui/Button'
import {
    ArrowLeft, Sun, Contrast, RotateCcw, Save, Settings2,
    MessageCircle, Grid2x2, Columns2, Square, Eye, Ruler,
    Send, Video, Monitor, Mic, MicOff, Camera, CameraOff,
    PhoneOff, AlertTriangle, ChevronDown, ChevronUp, Link2,
    Scan, Layers, Map
} from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────
interface ViewerImage {
    id: string
    url: string
    eyeSide: 'left' | 'right'
    capturedAt: string
    modality: 'fundus' | 'oct'
    annotationsJson: any
}

interface PatientInfo {
    patientId: string
    name: string
    nameKana: string
    age: number
    dob: string
    sex: 'M' | 'F'
}

type LayoutMode = '1x1' | '1x2' | '2x2' | 'fundus+oct'
type ActiveTool = 'pan' | 'measure'

// ─── Mock Data ──────────────────────────────────────────────────
const mockPatient: PatientInfo = {
    patientId: 'PT-20260001',
    name: '田中 太郎',
    nameKana: 'タナカ タロウ',
    age: 68,
    dob: '1958-03-15',
    sex: 'M',
}

const mockImages: ViewerImage[] = [
    { id: 'demo-1', url: '/demo/fundus_right_01.png', eyeSide: 'right', capturedAt: '2026-02-26 10:32', modality: 'fundus', annotationsJson: null },
    { id: 'demo-2', url: '/demo/fundus_left_01.png', eyeSide: 'left', capturedAt: '2026-02-26 10:33', modality: 'fundus', annotationsJson: null },
    { id: 'demo-3', url: '/demo/fundus_right_02.png', eyeSide: 'right', capturedAt: '2026-02-26 10:34', modality: 'fundus', annotationsJson: null },
    { id: 'demo-4', url: '/demo/fundus_left_02.png', eyeSide: 'left', capturedAt: '2026-02-26 10:35', modality: 'fundus', annotationsJson: null },
]

// ─── Inline Chat Mock Data (unified with global chat style) ─────
interface CaseMessage {
    id: number
    from: string
    text: string
    time: string
    isOwn: boolean
}

const initialCaseMessages: CaseMessage[] = [
    { id: 1, from: 'Dr. 田中 康夫', text: 'スクリーニング結果を確認しました。左眼にドルーゼンの所見です。', time: '14:23', isOwn: false },
    { id: 2, from: 'Dr. 佐藤 惠理子', text: '右眼も確認お願いします。黄斑部に小さな出血が見えます。', time: '14:28', isOwn: false },
]

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function DiagnosticViewer() {
    const { screeningId } = useParams()
    const navigate = useNavigate()
    const { t, lang } = useTranslation()

    // ─── State ─────────────────────────────────────
    const [images, setImages] = useState<ViewerImage[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [secondIndex, setSecondIndex] = useState(1)
    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [invert, setInvert] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [layout, setLayout] = useState<LayoutMode>('1x1')
    const [syncPan, setSyncPan] = useState(true)
    const [activeTool, setActiveTool] = useState<ActiveTool>('pan')
    const [showChat, setShowChat] = useState(false)
    const [showVideo, setShowVideo] = useState(false)
    const [findings, setFindings] = useState('')
    const [expandAdjust, setExpandAdjust] = useState(true)
    const [showOCT, setShowOCT] = useState(false)
    const [showThicknessMap, setShowThicknessMap] = useState(false)
    const [scanPosition, setScanPosition] = useState(50)

    // Sync transform state (lifted from FundusCanvas)
    const [syncTransform, setSyncTransform] = useState({ x: 0, y: 0, scale: 1 })

    // ─── Load images ─────────────────────────────────
    useEffect(() => {
        setImages(mockImages)
    }, [screeningId])

    // ─── Keyboard shortcuts ─────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') { navigate(-1); return }
            if (e.key === 'ArrowRight') setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))
            else if (e.key === 'ArrowLeft') setCurrentIndex(prev => Math.max(0, prev - 1))
            else if (e.code === 'Space') { e.preventDefault(); setInvert(prev => !prev) }
            else if (e.key === 'm' || e.key === 'M') setActiveTool(prev => prev === 'measure' ? 'pan' : 'measure')
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [images.length, navigate])

    const handleReset = () => { setBrightness(100); setContrast(100); setInvert(false) }

    const handleCompleteQC = async () => {
        setIsSaving(true)
        try {
            await new Promise(r => setTimeout(r, 800))
            alert(lang === 'ja' ? '読影結果を送信しました。' : 'Diagnostic reading submitted successfully!')
            navigate('/dashboard')
        } catch (e) { console.error(e) }
        finally { setIsSaving(false) }
    }

    const handleTransformChange = useCallback((x: number, y: number, scale: number) => {
        if (syncPan) setSyncTransform({ x, y, scale })
    }, [syncPan])

    // ─── Render ─────────────────────────────────────
    if (images.length === 0) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
        </div>
    )

    const currentImage = images[currentIndex]
    const secondImage = images[secondIndex] || images[1]

    return (
        <div className="viewer-root">
            {/* ═══ Patient Info Bar ═══ */}
            <div className="viewer-patient-bar">
                <button className="viewer-back-btn" onClick={() => navigate(-1)} title={lang === 'ja' ? '戻る' : 'Back'}>
                    <ArrowLeft style={{ width: 20, height: 20 }} />
                </button>

                <div className="patient-info-group">
                    <span className="patient-id">{mockPatient.patientId}</span>
                    <span className="patient-name">{mockPatient.name}</span>
                    <span className="patient-detail">{mockPatient.age}{lang === 'ja' ? '歳' : 'y'} / {mockPatient.sex === 'M' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')}</span>
                    <span className="patient-detail">DOB: {mockPatient.dob}</span>
                </div>

                <div className="patient-info-group" style={{ marginLeft: 'auto' }}>
                    <span className="patient-detail">Screening: {screeningId?.slice(0, 8)}</span>
                    <span className="patient-detail">{currentImage.capturedAt}</span>
                </div>

                {/* Layout Toggle */}
                <div className="viewer-layout-toggle">
                    <button className={`layout-btn ${layout === '1x1' ? 'active' : ''}`} onClick={() => { setLayout('1x1'); setShowOCT(false) }} title="Single View">
                        <Square style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === '1x2' ? 'active' : ''}`} onClick={() => { setLayout('1x2'); setShowOCT(false) }} title="Side by Side">
                        <Columns2 style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === '2x2' ? 'active' : ''}`} onClick={() => { setLayout('2x2'); setShowOCT(false) }} title="Quad View">
                        <Grid2x2 style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === 'fundus+oct' ? 'active' : ''}`} onClick={() => { setLayout('fundus+oct'); setShowOCT(true) }} title={lang === 'ja' ? '眼底 + OCT' : 'Fundus + OCT'}>
                        <Scan style={{ width: 16, height: 16 }} />
                    </button>
                    {(layout === '1x2' || layout === '2x2') && (
                        <button className={`layout-btn ${syncPan ? 'active' : ''}`} onClick={() => setSyncPan(!syncPan)} title="Sync Zoom/Pan">
                            <Link2 style={{ width: 16, height: 16 }} />
                        </button>
                    )}
                </div>
            </div>

            {/* ═══ Main Content ═══ */}
            <div className="viewer-body">
                {/* Viewer Panes */}
                <div className={`viewer-panes layout-${layout === 'fundus+oct' ? '1x2' : layout}`}>
                    {/* Primary Pane */}
                    <ViewerPane
                        image={currentImage}
                        images={images}
                        selectedIndex={currentIndex}
                        onSelectImage={setCurrentIndex}
                        brightness={brightness}
                        contrast={contrast}
                        invert={invert}
                        activeTool={activeTool}
                        syncTransform={layout !== '1x1' && layout !== 'fundus+oct' ? syncTransform : undefined}
                        onTransformChange={handleTransformChange}
                        lang={lang}
                        t={t}
                        showScanLine={showOCT}
                        scanPosition={scanPosition}
                        onScanPositionChange={setScanPosition}
                        showThicknessMap={showThicknessMap}
                    />

                    {/* OCT Viewer Pane (fundus+oct layout) */}
                    {layout === 'fundus+oct' && (
                        <div className="viewer-pane oct-pane">
                            <OCTViewer
                                scanPosition={scanPosition}
                                onScanPositionChange={setScanPosition}
                                brightness={brightness}
                                contrast={contrast}
                                invert={invert}
                                lang={lang}
                            />
                        </div>
                    )}

                    {/* Secondary Pane (1x2 or 2x2) */}
                    {(layout === '1x2' || layout === '2x2') && (
                        <ViewerPane
                            image={secondImage}
                            images={images}
                            selectedIndex={secondIndex}
                            onSelectImage={setSecondIndex}
                            brightness={brightness}
                            contrast={contrast}
                            invert={invert}
                            activeTool={activeTool}
                            syncTransform={syncPan ? syncTransform : undefined}
                            onTransformChange={handleTransformChange}
                            lang={lang}
                            t={t}
                        />
                    )}

                    {/* 2x2 extra panes */}
                    {layout === '2x2' && (
                        <>
                            <ViewerPane
                                image={images[2] || images[0]}
                                images={images}
                                selectedIndex={2}
                                onSelectImage={setCurrentIndex}
                                brightness={brightness}
                                contrast={contrast}
                                invert={invert}
                                activeTool={activeTool}
                                lang={lang}
                                t={t}
                            />
                            <ViewerPane
                                image={images[3] || images[1]}
                                images={images}
                                selectedIndex={3}
                                onSelectImage={setCurrentIndex}
                                brightness={brightness}
                                contrast={contrast}
                                invert={invert}
                                activeTool={activeTool}
                                lang={lang}
                                t={t}
                            />
                        </>
                    )}
                </div>

                {/* ═══ Tools Panel ═══ */}
                <div className="viewer-tools-panel">
                    {/* Tool Buttons */}
                    <div className="viewer-tool-buttons">
                        <button className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`} onClick={() => setActiveTool('pan')} title="Pan / Zoom">
                            <Eye style={{ width: 16, height: 16 }} />
                        </button>
                        <button className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`} onClick={() => setActiveTool('measure')} title={lang === 'ja' ? '計測 (M)' : 'Measure (M)'}>
                            <Ruler style={{ width: 16, height: 16 }} />
                        </button>
                        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 2px' }} />
                        <button className={`tool-btn ${showThicknessMap ? 'active' : ''}`} onClick={() => setShowThicknessMap(!showThicknessMap)} title={lang === 'ja' ? '厚みマップ' : 'Thickness Map'}>
                            <Map style={{ width: 16, height: 16 }} />
                        </button>
                        <button className={`tool-btn ${showOCT ? 'active' : ''}`} onClick={() => { setShowOCT(!showOCT); if (!showOCT) setLayout('fundus+oct'); else setLayout('1x1') }} title="OCT">
                            <Layers style={{ width: 16, height: 16 }} />
                        </button>
                    </div>

                    {/* Adjustments Section (Collapsible) */}
                    <div className="viewer-section">
                        <button className="viewer-section-header" onClick={() => setExpandAdjust(!expandAdjust)}>
                            <Settings2 style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                            <span>{t('viewer.adjustments')}</span>
                            {expandAdjust ? <ChevronUp style={{ width: 14, height: 14, marginLeft: 'auto' }} /> : <ChevronDown style={{ width: 14, height: 14, marginLeft: 'auto' }} />}
                        </button>
                        {expandAdjust && (
                            <div className="viewer-section-body">
                                <SliderControl icon={<Sun style={{ width: 14, height: 14 }} />} label={t('viewer.brightness')} value={brightness} onChange={setBrightness} />
                                <SliderControl icon={<Contrast style={{ width: 14, height: 14 }} />} label={t('viewer.contrast')} value={contrast} onChange={setContrast} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{t('viewer.invert')}</span>
                                    <ToggleSwitch checked={invert} onChange={setInvert} />
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={handleReset} style={{ width: '100%' }}>
                                    <RotateCcw style={{ width: 14, height: 14 }} /> {t('viewer.reset')}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Findings */}
                    <div className="viewer-section">
                        <div className="viewer-section-header" style={{ cursor: 'default' }}>
                            <span style={{ fontWeight: 600 }}>{t('viewer.findings')}</span>
                        </div>
                        <div className="viewer-section-body">
                            <textarea
                                className="input-field"
                                style={{ minHeight: 100, resize: 'vertical', fontSize: '0.82rem' }}
                                placeholder={t('viewer.findings_placeholder')}
                                value={findings}
                                onChange={e => setFindings(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Case Discussion (Inline, Unified) */}
                    <div className="viewer-section">
                        <button className="viewer-section-header" onClick={() => setShowChat(!showChat)}>
                            <MessageCircle style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                            <span style={{ color: 'var(--primary)' }}>{lang === 'ja' ? 'ケースディスカッション' : 'Case Discussion'}</span>
                            {showChat ? <ChevronUp style={{ width: 14, height: 14, marginLeft: 'auto' }} /> : <ChevronDown style={{ width: 14, height: 14, marginLeft: 'auto' }} />}
                        </button>
                        {showChat && (
                            <InlineCaseChat
                                showVideo={showVideo}
                                onToggleVideo={() => setShowVideo(!showVideo)}
                                lang={lang}
                            />
                        )}
                    </div>

                    {/* Bottom Actions */}
                    <div className="viewer-bottom-actions">
                        <div style={{ display: 'flex', gap: 6 }}>
                            <Button variant="outline" style={{ flex: 1 }} disabled={currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)}>
                                {t('viewer.prev')}
                            </Button>
                            <Button variant="outline" style={{ flex: 1 }} disabled={currentIndex === images.length - 1} onClick={() => setCurrentIndex(p => p + 1)}>
                                {t('viewer.next')}
                            </Button>
                        </div>
                        <Button className="w-full justify-center" disabled={isSaving} onClick={handleCompleteQC}>
                            {isSaving ? t('viewer.submitting') : <><Save style={{ width: 16, height: 16 }} /> {t('viewer.submit')}</>}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// VIEWER PANE — individual image viewing pane
// ═══════════════════════════════════════════════════════════════
function ViewerPane({ image, images, selectedIndex, onSelectImage, brightness, contrast, invert, activeTool, syncTransform, onTransformChange, lang, showScanLine, scanPosition, onScanPositionChange, showThicknessMap }: {
    image: ViewerImage
    images: ViewerImage[]
    selectedIndex: number
    onSelectImage: (i: number) => void
    brightness: number
    contrast: number
    invert: boolean
    activeTool: ActiveTool
    syncTransform?: { x: number; y: number; scale: number }
    onTransformChange?: (x: number, y: number, scale: number) => void
    lang: string
    t?: any
    showScanLine?: boolean
    scanPosition?: number
    onScanPositionChange?: (pos: number) => void
    showThicknessMap?: boolean
}) {
    return (
        <div className="viewer-pane">
            <FundusCanvas
                imageUrl={image.url}
                brightness={brightness}
                contrast={contrast}
                invert={invert}
                externalPan={syncTransform ? { x: syncTransform.x, y: syncTransform.y } : undefined}
                externalScale={syncTransform?.scale}
                onTransformChange={onTransformChange}
            />
            {/* Measurement Overlay */}
            <MeasureTool
                active={activeTool === 'measure'}
                canvasWidth={800}
                canvasHeight={600}
                lang={lang}
            />
            {/* Scan Line Overlay (fundus → OCT sync) */}
            {showScanLine && scanPosition !== undefined && onScanPositionChange && (
                <ScanLineOverlay
                    position={scanPosition}
                    onPositionChange={onScanPositionChange}
                    visible={true}
                />
            )}
            {/* Thickness Map (ETDRS grid) */}
            <ThicknessMap visible={showThicknessMap || false} lang={lang} />
            {/* Eye badge */}
            <div className="viewer-eye-badge" style={{ background: image.eyeSide === 'right' ? 'rgba(59,130,246,0.8)' : 'rgba(239,68,68,0.8)' }}>
                {image.eyeSide === 'right' ? (lang === 'ja' ? '右眼 OD' : 'RIGHT OD') : (lang === 'ja' ? '左眼 OS' : 'LEFT OS')}
            </div>
            {/* Modality label */}
            <div className="viewer-modality-badge">
                {image.modality.toUpperCase()}
            </div>
            {/* Capture time */}
            <div className="viewer-capture-time">{image.capturedAt}</div>
            {/* Thumbnails */}
            <div className="viewer-thumbnails">
                {images.map((img, i) => (
                    <button key={img.id} onClick={() => onSelectImage(i)} className={`viewer-thumb ${i === selectedIndex ? 'active' : ''}`}>
                        <img src={img.url} alt={img.eyeSide} />
                        <span className="thumb-label">{img.eyeSide === 'right' ? 'R' : 'L'}</span>
                    </button>
                ))}
            </div>
            {/* Tool hint */}
            <div className="viewer-hint">
                {activeTool === 'measure'
                    ? (lang === 'ja' ? 'クリックして計測（2点）' : 'Click to measure (2 points)')
                    : (lang === 'ja' ? 'ドラッグで移動・ホイールでズーム' : 'Drag to pan, scroll to zoom')}
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// INLINE CASE CHAT — unified with global chat tone
// ═══════════════════════════════════════════════════════════════
function InlineCaseChat({ showVideo, onToggleVideo, lang }: { showVideo: boolean; onToggleVideo: () => void; lang: string }) {
    const [messages, setMessages] = useState<CaseMessage[]>(initialCaseMessages)
    const [input, setInput] = useState('')
    const [micOn, setMicOn] = useState(true)
    const [camOn, setCamOn] = useState(true)

    const sendMessage = () => {
        if (!input.trim()) return
        setMessages(prev => [...prev, {
            id: Date.now(), from: 'You', text: input.trim(),
            time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
        }])
        setInput('')
    }

    return (
        <div className="case-chat-body">
            {/* Inline Video */}
            {showVideo && (
                <div className="video-inline">
                    <div className="video-inline-body">
                        <div className="video-remote">
                            <div className="video-placeholder"><Camera style={{ width: 24, height: 24, opacity: 0.3 }} /><span>Remote</span></div>
                        </div>
                        <div className="video-local">
                            <div className="video-placeholder small"><span>You</span></div>
                        </div>
                    </div>
                    <div className="video-controls">
                        <button className={`video-control-btn ${!micOn ? 'off' : ''}`} onClick={() => setMicOn(!micOn)}>
                            {micOn ? <Mic style={{ width: 14, height: 14 }} /> : <MicOff style={{ width: 14, height: 14 }} />}
                        </button>
                        <button className={`video-control-btn ${!camOn ? 'off' : ''}`} onClick={() => setCamOn(!camOn)}>
                            {camOn ? <Camera style={{ width: 14, height: 14 }} /> : <CameraOff style={{ width: 14, height: 14 }} />}
                        </button>
                        <button className="video-control-btn" title="Screen Share"><Monitor style={{ width: 14, height: 14 }} /></button>
                        <button className="video-control-btn hangup" onClick={onToggleVideo}><PhoneOff style={{ width: 14, height: 14 }} /></button>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div className="case-chat-messages">
                {messages.map(m => (
                    <div key={m.id} className={`chat-bubble ${m.isOwn ? 'own' : ''}`}>
                        {!m.isOwn && <div className="chat-bubble-name">{m.from}</div>}
                        <div className="chat-bubble-text">{m.text}</div>
                        <div className="chat-bubble-time">{m.time}</div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="case-chat-toolbar">
                <button className={`chat-action-btn ${showVideo ? 'active-video' : ''}`} onClick={onToggleVideo} title={lang === 'ja' ? 'ビデオ通話' : 'Video Call'}>
                    <Video style={{ width: 14, height: 14 }} />
                </button>
                <button className="chat-action-btn" title={lang === 'ja' ? '画面共有' : 'Screen Share'}>
                    <Monitor style={{ width: 14, height: 14 }} />
                </button>
                <button className="question-btn" title={lang === 'ja' ? '疑義照会' : 'Query Case'}>
                    <AlertTriangle style={{ width: 12, height: 12 }} />
                    {lang === 'ja' ? '疑義' : 'Query'}
                </button>
            </div>

            {/* Input */}
            <div className="case-chat-input">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={lang === 'ja' ? 'メッセージを入力...' : 'Type a message...'}
                />
                <button className="chat-send-btn" onClick={sendMessage}>
                    <Send style={{ width: 14, height: 14 }} />
                </button>
            </div>
        </div>
    )
}

// ═══════════════════════════════════════════════════════════════
// UTILITY COMPONENTS
// ═══════════════════════════════════════════════════════════════
function SliderControl({ icon, label, value, onChange }: { icon: React.ReactNode; label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>{icon} {label}</label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{value}%</span>
            </div>
            <input type="range" min="0" max="200" value={value} onChange={e => onChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }} />
        </div>
    )
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)} style={{
            width: 40, height: 22, borderRadius: 11,
            background: checked ? 'var(--primary)' : 'var(--border)',
            border: 'none', cursor: 'pointer', position: 'relative',
            transition: 'background 0.2s ease',
        }}>
            <div style={{
                position: 'absolute', top: 2,
                left: checked ? 20 : 2,
                width: 18, height: 18, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }} />
        </button>
    )
}
