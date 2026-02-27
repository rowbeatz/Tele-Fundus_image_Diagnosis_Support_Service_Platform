import { useState, useRef } from 'react'
import { useBrand } from '../../contexts/BrandContext'
import { useTranslation } from '../../lib/i18n'
import { Palette, Upload, RotateCcw, Save, Check, X } from 'lucide-react'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '../../utils/cropImage'

export default function BrandSettings() {
    const { brand, updateBrand, resetBrand } = useBrand()
    const { t } = useTranslation()
    const [name, setName] = useState(brand.platformName)
    const [tagline, setTagline] = useState(brand.tagline)
    const [logoPreview, setLogoPreview] = useState(brand.logoUrl)
    const [saved, setSaved] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    // Cropper State
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number, y: number, width: number, height: number } | null>(null)
    const [isCropping, setIsCropping] = useState(false)

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setImageSrc(url)
            setIsCropping(true)
            // Reset the file input so the same file could be selected again if cancelled
            if (fileRef.current) {
                fileRef.current.value = ''
            }
        }
    }

    const handleCropComplete = (_croppedArea: { x: number, y: number, width: number, height: number }, croppedAreaPixels: { x: number, y: number, width: number, height: number }) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const finishCropping = async () => {
        try {
            if (imageSrc && croppedAreaPixels) {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
                setLogoPreview(croppedImage)
                setIsCropping(false)
            }
        } catch (e) {
            console.error(e)
        }
    }

    const cancelCropping = () => {
        setIsCropping(false)
        setImageSrc(null)
    }

    const handleSave = () => {
        updateBrand({ logoUrl: logoPreview, platformName: name, tagline })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    const handleReset = () => {
        resetBrand()
        setName('RetinaInsight')
        setTagline('Precision in Every Pixel.')
        setLogoPreview('/brand/logo.png')
    }

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }} className="space-y-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>{t('admin.brand.title')}</h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{t('admin.brand.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleReset}>
                        <RotateCcw style={{ width: 16, height: 16 }} /> {t('admin.brand.reset')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {saved ? <><Check style={{ width: 16, height: 16 }} /> {t('admin.brand.saved' as any)}</> : <><Save style={{ width: 16, height: 16 }} /> {t('admin.brand.save')}</>}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Settings */}
                <div className="panel space-y-6">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Palette style={{ width: 20, height: 20, color: 'var(--primary)' }} />
                        {t('admin.brand.config' as any)}
                    </h3>

                    <div>
                        <label className="label">{t('admin.brand.logo')}</label>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 16,
                            padding: 16, border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                            background: 'var(--bg)',
                        }}>
                            <div style={{
                                width: 64, height: 64, borderRadius: 12, overflow: 'hidden',
                                background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}>
                                <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
                            </div>
                            <div>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', marginBottom: 4 }}
                                    onClick={() => fileRef.current?.click()}>
                                    <Upload style={{ width: 14, height: 14 }} /> {t('admin.brand.upload')}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{t('admin.brand.upload_hint' as any)}</p>
                                <input type="file" ref={fileRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="label">{t('admin.brand.name')}</label>
                        <input className="input-field" value={name} onChange={e => setName(e.target.value)} />
                    </div>

                    <div>
                        <label className="label">{t('admin.brand.tagline')}</label>
                        <input className="input-field" value={tagline} onChange={e => setTagline(e.target.value)} />
                    </div>
                </div>

                {/* Preview */}
                <div className="panel space-y-4">
                    <h3>{t('admin.brand.preview')}</h3>

                    {/* Sidebar Preview */}
                    <div style={{
                        background: '#0f172a', borderRadius: 'var(--radius-lg)', padding: 16,
                        color: 'white', minHeight: 160,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                            <img src={logoPreview} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {[t('nav.dashboard'), t('nav.patients'), t('nav.uploads')].map((item, i) => (
                                <div key={item} style={{
                                    padding: '8px 12px', borderRadius: 6, fontSize: '0.8rem',
                                    background: i === 0 ? 'rgba(13,148,136,0.15)' : 'transparent',
                                    color: i === 0 ? '#5eead4' : 'rgba(255,255,255,0.5)',
                                }}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Login Hero Preview */}
                    <div style={{
                        background: 'linear-gradient(135deg, #0f172a 0%, #0d9488 100%)',
                        borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center',
                    }}>
                        <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', marginBottom: 12 }} />
                        <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>{name}</div>
                        <div style={{ color: 'rgba(94,234,212,0.8)', fontSize: '0.85rem', fontStyle: 'italic' }}>{tagline}</div>
                    </div>
                </div>
            </div>

            {/* Cropping Modal */}
            {isCropping && imageSrc && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)', zIndex: 100, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'var(--bg-card)', padding: 24, borderRadius: 'var(--radius-lg)',
                        width: '90%', maxWidth: 600, border: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3 style={{ margin: 0 }}>画像の調整・切り抜き (Crop Image)</h3>
                            <button className="icon-btn" onClick={cancelCropping}>
                                <X style={{ width: 20, height: 20 }} />
                            </button>
                        </div>
                        <div style={{ position: 'relative', width: '100%', height: 400, background: '#333', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Square aspect ratio for logos
                                onCropChange={setCrop}
                                onCropComplete={handleCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                aria-labelledby="Zoom"
                                onChange={(e) => {
                                    setZoom(Number(e.target.value))
                                }}
                                style={{ flex: 1 }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button className="btn btn-secondary" onClick={cancelCropping}>キャンセル (Cancel)</button>
                            <button className="btn btn-primary" onClick={finishCropping}>
                                <Check style={{ width: 16, height: 16 }} /> 適用する (Apply)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
