import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from '../../lib/i18n'
import { FundusCanvas } from '../../components/canvas/FundusCanvas'
import { Button } from '../../components/ui/Button'
import { Sun, Contrast, RotateCcw, Save, Settings2, MessageCircle } from 'lucide-react'
import { ChatPanel } from '../../components/chat/ChatPanel'
import { VideoConference } from '../../components/chat/VideoConference'

export default function DiagnosticViewer() {
    const { screeningId } = useParams()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [images, setImages] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [invert, setInvert] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [showVideoCall, setShowVideoCall] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        // Use local demo fundus images
        setImages([
            { id: 'demo-1', url: '/demo/fundus_right_01.png', eyeSide: 'right', annotationsJson: null },
            { id: 'demo-2', url: '/demo/fundus_left_01.png', eyeSide: 'left', annotationsJson: null },
            { id: 'demo-3', url: '/demo/fundus_right_02.png', eyeSide: 'right', annotationsJson: null },
            { id: 'demo-4', url: '/demo/fundus_left_02.png', eyeSide: 'left', annotationsJson: null },
        ])
    }, [screeningId])

    const handleReset = () => { setBrightness(100); setContrast(100); setInvert(false) }

    const handleCompleteQC = async () => {
        setIsSaving(true)
        try {
            await new Promise(r => setTimeout(r, 800))
            alert('Diagnostic reading submitted successfully!')
            navigate('/dashboard')
        } catch (e) { console.error(e) }
        finally { setIsSaving(false) }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))
            else if (e.key === 'ArrowLeft') setCurrentIndex(prev => Math.max(0, prev - 1))
            else if (e.code === 'Space') { e.preventDefault(); setInvert(prev => !prev) }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [images.length])

    if (images.length === 0) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 80px)' }}>
            <div style={{ width: 32, height: 32, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} className="animate-spin" />
        </div>
    )

    const currentImage = images[currentIndex]

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 110px)', gap: 16 }}>
            {/* Main Viewer */}
            <div style={{
                flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                border: '1px solid var(--border)', background: '#000', position: 'relative',
                boxShadow: 'var(--shadow)',
            }}>
                <FundusCanvas imageUrl={currentImage.url} brightness={brightness} contrast={contrast} invert={invert} />
                <div style={{
                    position: 'absolute', top: 16, left: 16,
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    padding: '6px 14px', borderRadius: 'var(--radius)',
                    backdropFilter: 'blur(8px)', fontSize: '0.85rem', fontWeight: 600,
                }}>
                    {currentImage.eyeSide.toUpperCase()} EYE
                </div>
                <div style={{
                    position: 'absolute', bottom: 16, left: 16,
                    color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem',
                }}>
                    {t('viewer.hint')}
                </div>

                {/* Image thumbnails */}
                <div style={{
                    position: 'absolute', bottom: 16, right: 16,
                    display: 'flex', gap: 6,
                }}>
                    {images.map((img, i) => (
                        <button key={img.id} onClick={() => setCurrentIndex(i)} style={{
                            width: 48, height: 48, borderRadius: 8,
                            border: i === currentIndex ? '2px solid var(--teal-400)' : '2px solid rgba(255,255,255,0.2)',
                            overflow: 'hidden', cursor: 'pointer', padding: 0,
                            opacity: i === currentIndex ? 1 : 0.6,
                            transition: 'all 0.15s ease',
                        }}>
                            <img src={img.url} alt={img.eyeSide} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Panel */}
            <div className="panel" style={{
                width: 300, display: 'flex', flexDirection: 'column',
                height: '100%', flexShrink: 0, padding: 0, overflow: 'hidden',
            }}>
                <div style={{
                    padding: '14px 18px', borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontWeight: 600, fontSize: '0.9rem',
                }}>
                    <Settings2 style={{ width: 18, height: 18, color: 'var(--text-muted)' }} />
                    {t('viewer.adjustments')}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Brightness */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Sun style={{ width: 16, height: 16 }} /> {t('viewer.brightness')}
                            </label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{brightness}%</span>
                        </div>
                        <input type="range" min="0" max="200" value={brightness}
                            onChange={e => setBrightness(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>

                    {/* Contrast */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <label style={{ fontSize: '0.85rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Contrast style={{ width: 16, height: 16 }} /> {t('viewer.contrast')}
                            </label>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{contrast}%</span>
                        </div>
                        <input type="range" min="0" max="200" value={contrast}
                            onChange={e => setContrast(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    </div>

                    {/* Invert */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{t('viewer.invert')}</span>
                        <button onClick={() => setInvert(!invert)} style={{
                            width: 44, height: 24, borderRadius: 12,
                            background: invert ? 'var(--primary)' : 'var(--border)',
                            border: 'none', cursor: 'pointer', position: 'relative',
                            transition: 'background 0.2s ease',
                        }}>
                            <div style={{
                                position: 'absolute', top: 3,
                                left: invert ? 23 : 3,
                                width: 18, height: 18, borderRadius: '50%',
                                background: 'white', transition: 'left 0.2s ease',
                            }} />
                        </button>
                    </div>

                    <Button variant="ghost" onClick={handleReset} className="w-full justify-center">
                        <RotateCcw style={{ width: 16, height: 16 }} /> {t('viewer.reset')}
                    </Button>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

                    <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>{t('viewer.findings')}</div>
                        <textarea className="input-field" style={{ minHeight: 120, resize: 'vertical' }}
                            placeholder={t('viewer.findings_placeholder')} />
                    </div>

                    <Button variant="outline" onClick={() => setShowChat(true)} className="w-full justify-center"
                        style={{ background: 'var(--info-light)', borderColor: '#bfdbfe', color: '#1e40af' }}>
                        <MessageCircle style={{ width: 16, height: 16 }} /> {t('viewer.discuss')}
                    </Button>
                </div>

                <div style={{ padding: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
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

            {showChat && screeningId && (
                <ChatPanel screeningId={screeningId} onClose={() => setShowChat(false)} onStartVideoCall={() => setShowVideoCall(true)} />
            )}
            {showVideoCall && screeningId && (
                <VideoConference screeningId={screeningId} onClose={() => setShowVideoCall(false)}
                    onSyncPanChange={(x, y, zoom) => console.log(`Sync: ${x},${y},${zoom}`)} />
            )}
        </div>
    )
}
