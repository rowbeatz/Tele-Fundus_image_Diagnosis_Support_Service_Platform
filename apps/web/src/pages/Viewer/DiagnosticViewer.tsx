import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FundusCanvas } from '../../components/canvas/FundusCanvas'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { api } from '../../lib/api'
import { Sun, Contrast, RotateCcw, Save, Settings2 } from 'lucide-react'

export default function DiagnosticViewer() {
    const { screeningId } = useParams()
    const navigate = useNavigate()

    const [images, setImages] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    // Viewer state
    const [brightness, setBrightness] = useState(100)
    const [contrast, setContrast] = useState(100)
    const [invert, setInvert] = useState(false)

    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        // Fetch images for this screening
        // Mocking the API response format for the MVP frontend demonstration where no active valid ID might be passed during test
        const loadImages = async () => {
            try {
                if (screeningId && screeningId !== 'mock') {
                    const res = await api.get(`/viewer/screenings/${screeningId}/images`)
                    setImages(res.data.images)
                } else {
                    // Mock data if running purely for UI test
                    setImages([{
                        id: 'mock-1',
                        url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80', // Replace with an eye image structurally
                        eyeSide: 'right',
                        annotationsJson: null
                    }])
                }
            } catch (err) {
                console.error('Failed to load images:', err)
            }
        }
        loadImages()
    }, [screeningId])

    const handleReset = () => {
        setBrightness(100)
        setContrast(100)
        setInvert(false)
    }

    const handleCompleteQC = async () => {
        setIsSaving(true)
        try {
            // Typically we'd save annotations, then mark the reading as QC completed or submitted
            // Wait for a simulated API call
            await new Promise(r => setTimeout(r, 800))
            alert('Diagnostic reading submitted successfully!')
            navigate('/dashboard')
        } catch (e) {
            console.error(e)
        } finally {
            setIsSaving(false)
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setCurrentIndex(prev => Math.min(images.length - 1, prev + 1))
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex(prev => Math.max(0, prev - 1))
            } else if (e.code === 'Space') {
                e.preventDefault()
                setInvert(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [images.length])

    if (images.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-80px)]">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const currentImage = images[currentIndex]

    return (
        <div className="flex h-[calc(100vh-110px)] gap-4">
            {/* Main Viewer Area */}
            <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 bg-black relative shadow-sm">
                <FundusCanvas
                    imageUrl={currentImage.url}
                    brightness={brightness}
                    contrast={contrast}
                    invert={invert}
                />

                {/* On-canvas info overlay */}
                <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-md backdrop-blur-sm text-sm font-medium">
                    {currentImage.eyeSide.toUpperCase()} EYE
                </div>
                <div className="absolute bottom-4 left-4 text-white/70 text-xs">
                    Scroll to zoom • Drag to pan • Space to invert
                </div>
            </div>

            {/* Tools Side Panel */}
            <Card className="w-80 flex flex-col h-full shrink-0">
                <div className="p-4 border-b border-gray-100 font-semibold flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-gray-500" />
                    Image Adjustments
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Sun className="w-4 h-4" /> Brightness
                            </label>
                            <span className="text-xs text-gray-500">{brightness}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="200"
                            value={brightness}
                            onChange={e => setBrightness(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                <Contrast className="w-4 h-4" /> Contrast
                            </label>
                            <span className="text-xs text-gray-500">{contrast}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="200"
                            value={contrast}
                            onChange={e => setContrast(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-medium text-gray-700">Invert Colors</span>
                        <button
                            onClick={() => setInvert(!invert)}
                            className={`w-11 h-6 rounded-full transition-colors relative ${invert ? 'bg-primary' : 'bg-gray-300'}`}
                        >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${invert ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="pt-4">
                        <Button variant="ghost" onClick={handleReset} className="w-full justify-center">
                            <RotateCcw className="w-4 h-4 mr-2" /> Reset Filters
                        </Button>
                    </div>

                    <hr className="border-gray-100" />

                    <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">Findings / Annotations</div>
                        <textarea
                            className="input-field min-h-[120px] resize-none"
                            placeholder="Enter diagnostic notes here..."
                        ></textarea>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 space-y-3">
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" disabled={currentIndex === 0} onClick={() => setCurrentIndex(prev => prev - 1)}>
                            Previous
                        </Button>
                        <Button variant="outline" className="flex-1" disabled={currentIndex === images.length - 1} onClick={() => setCurrentIndex(prev => prev + 1)}>
                            Next
                        </Button>
                    </div>
                    <Button className="w-full justify-center" disabled={isSaving} onClick={handleCompleteQC}>
                        {isSaving ? 'Submitting...' : <><Save className="w-4 h-4 mr-2" /> Submit Reading</>}
                    </Button>
                </div>
            </Card>
        </div>
    )
}
