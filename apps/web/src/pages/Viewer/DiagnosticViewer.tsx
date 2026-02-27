import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { FundusCanvas } from '../../components/canvas/FundusCanvas'
import { OCTViewer } from '../../components/canvas/OCTViewer'
import { MeasureTool } from '../../components/canvas/MeasureTool'
import { ThicknessMap } from '../../components/canvas/ThicknessMap'
import { ScanLineOverlay } from '../../components/canvas/ScanLineOverlay'
import { EnFaceViewer, OCTAViewer } from '../../components/canvas/AdvancedViewers'
import { ClinicalInfoPanel } from '../../components/viewer/ClinicalInfoPanel'
import { ReportPanel } from '../../components/viewer/ReportPanel'
import { ProgressionView } from '../../components/viewer/ProgressionView'
import {
    ArrowLeft, Sun, Contrast, RotateCcw,
    Grid2x2, Columns2, Square, Eye, Ruler,
    Send, MessageCircle, X,
    Link2, ChevronRight, Building2, CheckCircle2,
    Scan, Layers, Map, Maximize, Cuboid,
    PanelLeftClose, PanelRightClose, TrendingUp
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
    referralFacility: string
    referralDoctor: string
    organization: string
}

interface ReadingCase {
    screeningId: string
    patientId: string
    patientName: string
    age: number
    sex: 'M' | 'F'
    referralFacility: string
    imageCount: number
    status: 'pending' | 'in-progress' | 'completed'
}

interface CaseMessage {
    id: number
    from: string
    text: string
    time: string
    isOwn: boolean
}

type LayoutMode = '1x1' | '1x2' | '2x2' | 'fundus+oct' | 'enface' | 'octa'
type ActiveTool = 'pan' | 'measure'

// ─── Mock Data ──────────────────────────────────────────────────
const mockPatient: PatientInfo = {
    patientId: 'PT-20260001',
    name: '田中 太郎',
    nameKana: 'タナカ タロウ',
    age: 68,
    dob: '1958-03-15',
    sex: 'M',
    referralFacility: 'さくら眼科クリニック',
    referralDoctor: '佐藤 一郎',
    organization: '東京中央病院',
}

const mockImages: ViewerImage[] = [
    { id: 'demo-1', url: '/demo/fundus_right_01.png', eyeSide: 'right', capturedAt: '2026-02-26 10:32', modality: 'fundus', annotationsJson: null },
    { id: 'demo-2', url: '/demo/fundus_left_01.png', eyeSide: 'left', capturedAt: '2026-02-26 10:33', modality: 'fundus', annotationsJson: null },
    { id: 'demo-3', url: '/demo/fundus_right_02.png', eyeSide: 'right', capturedAt: '2026-02-26 10:34', modality: 'fundus', annotationsJson: null },
    { id: 'demo-4', url: '/demo/fundus_left_02.png', eyeSide: 'left', capturedAt: '2026-02-26 10:35', modality: 'fundus', annotationsJson: null },
]

// ─── Reading Queue (mock: assigned cases for this reader) ───────
const mockReadingQueue: ReadingCase[] = [
    { screeningId: 'SCR-001', patientId: 'PT-20260001', patientName: '田中 太郎', age: 68, sex: 'M', referralFacility: 'さくら眼科クリニック', imageCount: 4, status: 'in-progress' },
    { screeningId: 'SCR-002', patientId: 'PT-20260002', patientName: '鈴木 花子', age: 53, sex: 'F', referralFacility: '東京中央病院', imageCount: 2, status: 'pending' },
    { screeningId: 'SCR-003', patientId: 'PT-20260003', patientName: '佐藤 健一', age: 80, sex: 'M', referralFacility: 'さくら眼科クリニック', imageCount: 6, status: 'pending' },
    { screeningId: 'SCR-004', patientId: 'PT-20260004', patientName: '山田 美咲', age: 37, sex: 'F', referralFacility: '大阪総合医療センター', imageCount: 2, status: 'pending' },
    { screeningId: 'SCR-005', patientId: 'PT-20260005', patientName: '高橋 翔太', age: 60, sex: 'M', referralFacility: '東京中央病院', imageCount: 4, status: 'completed' },
    { screeningId: 'SCR-006', patientId: 'PT-20260006', patientName: '伊藤 真理', age: 75, sex: 'F', referralFacility: 'さくら眼科クリニック', imageCount: 4, status: 'pending' },
    { screeningId: 'SCR-007', patientId: 'PT-20260007', patientName: '渡辺 大輔', age: 47, sex: 'M', referralFacility: '大阪総合医療センター', imageCount: 2, status: 'pending' },
]

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
    const [showOCT, setShowOCT] = useState(false)
    const [showThicknessMap, setShowThicknessMap] = useState(false)
    const [scanPosition, setScanPosition] = useState(50)
    const [showLeftPanel, setShowLeftPanel] = useState(true)
    const [showRightPanel, setShowRightPanel] = useState(true)
    const [showProgression, setShowProgression] = useState(false)
    const [showChatPopup, setShowChatPopup] = useState(false)
    const [chatMessages, setChatMessages] = useState<CaseMessage[]>(initialCaseMessages)
    const [chatInput, setChatInput] = useState('')

    // Reading queue
    const readingQueue = mockReadingQueue
    const currentQueueIndex = readingQueue.findIndex(c => c.screeningId === screeningId)
    const completedCount = readingQueue.filter(c => c.status === 'completed').length
    const totalCount = readingQueue.length

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

    const handleCompleteQC = async () => {
        setIsSaving(true)
        try {
            await new Promise(r => setTimeout(r, 800))
            // Navigate to next case or back to dashboard
            const nextCase = readingQueue.find((c, i) => i > currentQueueIndex && c.status === 'pending')
            if (nextCase) {
                navigate(`/viewer/${nextCase.screeningId}`)
            } else {
                alert(lang === 'ja' ? '全ての読影が完了しました。' : 'All readings completed!')
                navigate('/dashboard')
            }
        } catch (e) { console.error(e) }
        finally { setIsSaving(false) }
    }

    const handleNextCase = () => {
        const nextCase = readingQueue.find((c, i) => i > currentQueueIndex && c.status !== 'completed')
        if (nextCase) navigate(`/viewer/${nextCase.screeningId}`)
    }

    const sendChat = () => {
        if (!chatInput.trim()) return
        setChatMessages(prev => [...prev, {
            id: Date.now(), from: 'You', text: chatInput.trim(),
            time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
        }])
        setChatInput('')
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

    const hasNextCase = readingQueue.some((c, i) => i > currentQueueIndex && c.status !== 'completed')

    return (
        <div className="viewer-root">
            {/* ═══ Patient Info Bar ═══ */}
            <div className="viewer-patient-bar">
                <button className="viewer-back-btn" onClick={() => navigate(-1)} title={lang === 'ja' ? '戻る (Esc)' : 'Back (Esc)'}>
                    <ArrowLeft style={{ width: 18, height: 18 }} />
                </button>

                {/* Patient info */}
                <div className="patient-info-group">
                    <span className="patient-id">{mockPatient.patientId}</span>
                    <span className="patient-name">{mockPatient.name}</span>
                    <span className="patient-detail">{mockPatient.age}{lang === 'ja' ? '歳' : 'y'} / {mockPatient.sex === 'M' ? (lang === 'ja' ? '男性' : 'Male') : (lang === 'ja' ? '女性' : 'Female')}</span>
                </div>

                {/* Referral / Client Info */}
                <div className="patient-info-group" style={{ borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
                    <Building2 style={{ width: 14, height: 14, color: 'var(--text-muted)', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-primary)' }}>{mockPatient.referralFacility}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '依頼医' : 'Ref.'}: {mockPatient.referralDoctor}</span>
                    </div>
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Reading Progress Gauge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderRight: '1px solid var(--border)', paddingRight: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{lang === 'ja' ? '読影進捗' : 'Reading Progress'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>{currentQueueIndex >= 0 ? currentQueueIndex + 1 : '?'}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>/ {totalCount}</span>
                        </div>
                    </div>
                    {/* Mini progress bar */}
                    <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${((completedCount + 1) / totalCount) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                    <CheckCircle2 style={{ width: 14, height: 14, color: completedCount > 0 ? 'var(--primary)' : 'var(--text-muted)' }} />
                </div>

                {/* Panel Toggles */}
                <div className="viewer-layout-toggle">
                    <button className={`layout-btn ${showLeftPanel ? 'active' : ''}`} onClick={() => setShowLeftPanel(!showLeftPanel)} title={lang === 'ja' ? '臨床情報' : 'Clinical Info'}>
                        <PanelLeftClose style={{ width: 16, height: 16 }} />
                    </button>
                    <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

                    <button className={`layout-btn ${layout === '1x1' ? 'active' : ''}`} onClick={() => { setLayout('1x1'); setShowOCT(false) }} title="Single">
                        <Square style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === '1x2' ? 'active' : ''}`} onClick={() => { setLayout('1x2'); setShowOCT(false) }} title="1×2">
                        <Columns2 style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === '2x2' ? 'active' : ''}`} onClick={() => { setLayout('2x2'); setShowOCT(false) }} title="2×2">
                        <Grid2x2 style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === 'fundus+oct' ? 'active' : ''}`} onClick={() => { setLayout('fundus+oct'); setShowOCT(true) }} title="F+OCT">
                        <Scan style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === 'enface' ? 'active' : ''}`} onClick={() => { setLayout('enface'); setShowOCT(false) }} title="En-Face">
                        <Cuboid style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${layout === 'octa' ? 'active' : ''}`} onClick={() => { setLayout('octa'); setShowOCT(false) }} title="OCTA">
                        <Maximize style={{ width: 16, height: 16 }} />
                    </button>
                    {(layout === '1x2' || layout === '2x2' || layout === 'fundus+oct') && (
                        <button className={`layout-btn ${syncPan ? 'active' : ''}`} onClick={() => setSyncPan(!syncPan)} title="Sync">
                            <Link2 style={{ width: 16, height: 16 }} />
                        </button>
                    )}
                    <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                    <button className={`layout-btn ${showProgression ? 'active' : ''}`} onClick={() => setShowProgression(!showProgression)} title={lang === 'ja' ? '時系列' : 'Trend'}>
                        <TrendingUp style={{ width: 16, height: 16 }} />
                    </button>
                    <button className={`layout-btn ${showRightPanel ? 'active' : ''}`} onClick={() => setShowRightPanel(!showRightPanel)} title={lang === 'ja' ? 'レポート' : 'Report'}>
                        <PanelRightClose style={{ width: 16, height: 16 }} />
                    </button>
                </div>
            </div>

            {/* ═══ Main Content (3-Column) ═══ */}
            <div className="viewer-body" style={{ display: 'flex', overflow: 'hidden', flex: 1 }}>
                {/* LEFT: Clinical Info */}
                {showLeftPanel && (
                    <div style={{ width: 260, minWidth: 260, flexShrink: 0, overflow: 'hidden', transition: 'width 0.2s' }}>
                        {showProgression ? (
                            <ProgressionView lang={lang} onClose={() => setShowProgression(false)} />
                        ) : (
                            <ClinicalInfoPanel lang={lang} />
                        )}
                    </div>
                )}

                {/* CENTER: viewer */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                    {/* Viewer Panes */}
                    <div className={`viewer-panes layout-${layout === 'fundus+oct' ? '1x2' : layout}`} style={{ flex: 1 }}>
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
                        {layout === 'fundus+oct' && (
                            <div className="viewer-pane oct-pane">
                                <OCTViewer scanPosition={scanPosition} onScanPositionChange={setScanPosition} brightness={brightness} contrast={contrast} invert={invert} lang={lang} />
                            </div>
                        )}
                        {(layout === '1x2' || layout === '2x2') && (
                            <ViewerPane image={secondImage} images={images} selectedIndex={secondIndex} onSelectImage={setSecondIndex} brightness={brightness} contrast={contrast} invert={invert} activeTool={activeTool} syncTransform={syncPan ? syncTransform : undefined} onTransformChange={handleTransformChange} lang={lang} t={t} />
                        )}
                        {layout === '2x2' && (
                            <>
                                <ViewerPane image={images[2] || images[0]} images={images} selectedIndex={2} onSelectImage={setCurrentIndex} brightness={brightness} contrast={contrast} invert={invert} activeTool={activeTool} lang={lang} t={t} />
                                <ViewerPane image={images[3] || images[1]} images={images} selectedIndex={3} onSelectImage={setCurrentIndex} brightness={brightness} contrast={contrast} invert={invert} activeTool={activeTool} lang={lang} t={t} />
                            </>
                        )}
                        {layout === 'enface' && (<div className="viewer-pane" style={{ padding: 16 }}><EnFaceViewer lang={lang} /></div>)}
                        {layout === 'octa' && (<div className="viewer-pane" style={{ padding: 16 }}><OCTAViewer lang={lang} /></div>)}
                    </div>

                    {/* ═══ Tools Strip ═══ */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px',
                        borderTop: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0,
                    }}>
                        <button className={`tool-btn ${activeTool === 'pan' ? 'active' : ''}`} onClick={() => setActiveTool('pan')} title="Pan"><Eye style={{ width: 14, height: 14 }} /></button>
                        <button className={`tool-btn ${activeTool === 'measure' ? 'active' : ''}`} onClick={() => setActiveTool('measure')} title={lang === 'ja' ? '計測' : 'Measure'}><Ruler style={{ width: 14, height: 14 }} /></button>
                        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                        <button className={`tool-btn ${showThicknessMap ? 'active' : ''}`} onClick={() => setShowThicknessMap(!showThicknessMap)} title="Map"><Map style={{ width: 14, height: 14 }} /></button>
                        <button className={`tool-btn ${showOCT ? 'active' : ''}`} onClick={() => { setShowOCT(!showOCT); if (!showOCT) setLayout('fundus+oct'); else setLayout('1x1') }} title="OCT"><Layers style={{ width: 14, height: 14 }} /></button>

                        <div style={{ flex: 1 }} />

                        {/* Adjustments */}
                        <Sun style={{ width: 11, height: 11, color: 'var(--text-muted)' }} />
                        <input type="range" min={0} max={200} value={brightness} onChange={e => setBrightness(Number(e.target.value))} style={{ width: 50, accentColor: 'var(--primary)' }} />
                        <Contrast style={{ width: 11, height: 11, color: 'var(--text-muted)' }} />
                        <input type="range" min={0} max={200} value={contrast} onChange={e => setContrast(Number(e.target.value))} style={{ width: 50, accentColor: 'var(--primary)' }} />
                        <button onClick={() => setInvert(!invert)} className={`tool-btn ${invert ? 'active' : ''}`} title={t('viewer.invert')} style={{ padding: 3 }}><RotateCcw style={{ width: 11, height: 11 }} /></button>

                        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />

                        {/* Image Nav */}
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>{lang === 'ja' ? '画像' : 'IMG'}</span>
                        <button className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '2px 6px', minHeight: 24 }} disabled={currentIndex === 0} onClick={() => setCurrentIndex(p => p - 1)}>←</button>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--primary)' }}>{currentIndex + 1}/{images.length}</span>
                        <button className="btn btn-secondary" style={{ fontSize: '0.68rem', padding: '2px 6px', minHeight: 24 }} disabled={currentIndex === images.length - 1} onClick={() => setCurrentIndex(p => p + 1)}>→</button>

                        {/* Next Case button */}
                        <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                        <button
                            className="btn btn-primary"
                            style={{ fontSize: '0.68rem', padding: '3px 10px', minHeight: 24, display: 'flex', alignItems: 'center', gap: 4 }}
                            disabled={!hasNextCase}
                            onClick={handleNextCase}
                        >
                            {lang === 'ja' ? '次の症例' : 'Next Case'}
                            <ChevronRight style={{ width: 12, height: 12 }} />
                        </button>
                    </div>
                </div>{/* end center */}

                {/* RIGHT: Report Panel */}
                {showRightPanel && (
                    <div style={{ width: 300, minWidth: 300, flexShrink: 0, overflow: 'hidden', transition: 'width 0.2s' }}>
                        <ReportPanel lang={lang} onSubmit={handleCompleteQC} />
                    </div>
                )}
            </div>

            {/* ═══ Floating Case Discussion Chat ═══ */}
            {showChatPopup && (
                <div style={{
                    position: 'fixed', bottom: 16, right: showRightPanel ? 320 : 16,
                    width: 340, height: 420, zIndex: 1000,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                        <MessageCircle style={{ width: 16, height: 16, color: 'var(--primary)' }} />
                        <span style={{ fontWeight: 600, fontSize: '0.82rem', flex: 1 }}>{lang === 'ja' ? 'ケースディスカッション' : 'Case Discussion'}</span>
                        <button onClick={() => setShowChatPopup(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
                            <X style={{ width: 16, height: 16 }} />
                        </button>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {chatMessages.map(m => (
                            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.isOwn ? 'flex-end' : 'flex-start' }}>
                                {!m.isOwn && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 1 }}>{m.from}</span>}
                                <div style={{
                                    background: m.isOwn ? 'var(--primary)' : 'var(--surface)',
                                    color: m.isOwn ? 'white' : 'var(--text-primary)',
                                    padding: '6px 10px', borderRadius: 8, maxWidth: '85%', fontSize: '0.78rem', lineHeight: 1.4,
                                }}>{m.text}</div>
                                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 1 }}>{m.time}</span>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 6, padding: '8px 12px', borderTop: '1px solid var(--border)' }}>
                        <input
                            value={chatInput}
                            onChange={e => setChatInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendChat()}
                            placeholder={lang === 'ja' ? 'メッセージ...' : 'Message...'}
                            style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: '0.78rem', background: 'var(--bg)', color: 'var(--text-primary)' }}
                        />
                        <button onClick={sendChat} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                            <Send style={{ width: 14, height: 14 }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Chat FAB */}
            {!showChatPopup && (
                <button
                    onClick={() => setShowChatPopup(true)}
                    style={{
                        position: 'fixed', bottom: 16, right: showRightPanel ? 320 : 16,
                        width: 48, height: 48, borderRadius: '50%', zIndex: 999,
                        background: 'var(--primary)', color: 'white', border: 'none',
                        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                    }}
                    title={lang === 'ja' ? 'ケースディスカッション' : 'Case Discussion'}
                >
                    <MessageCircle style={{ width: 20, height: 20 }} />
                    {chatMessages.length > 0 && (
                        <span style={{
                            position: 'absolute', top: -2, right: -2,
                            width: 18, height: 18, borderRadius: '50%',
                            background: '#ef4444', color: 'white', fontSize: '0.6rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
                        }}>{chatMessages.length}</span>
                    )}
                </button>
            )}
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
