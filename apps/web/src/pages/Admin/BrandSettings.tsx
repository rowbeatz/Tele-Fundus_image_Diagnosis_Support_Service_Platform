import { useState, useRef } from 'react'
import { useBrand } from '../../contexts/BrandContext'
import { useTranslation } from '../../lib/i18n'
import { Palette, Upload, RotateCcw, Save, Check } from 'lucide-react'

export default function BrandSettings() {
    const { brand, updateBrand, resetBrand } = useBrand()
    const { t } = useTranslation()
    const [name, setName] = useState(brand.platformName)
    const [tagline, setTagline] = useState(brand.tagline)
    const [logoPreview, setLogoPreview] = useState(brand.logoUrl)
    const [saved, setSaved] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const url = URL.createObjectURL(file)
            setLogoPreview(url)
        }
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
                    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>White-label configuration</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleReset}>
                        <RotateCcw style={{ width: 16, height: 16 }} /> {t('admin.brand.reset')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {saved ? <><Check style={{ width: 16, height: 16 }} /> Saved!</> : <><Save style={{ width: 16, height: 16 }} /> {t('admin.brand.save')}</>}
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Settings */}
                <div className="panel space-y-6">
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Palette style={{ width: 20, height: 20, color: 'var(--primary)' }} />
                        Configuration
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
                                <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            </div>
                            <div>
                                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', marginBottom: 4 }}
                                    onClick={() => fileRef.current?.click()}>
                                    <Upload style={{ width: 14, height: 14 }} /> {t('admin.brand.upload')}
                                </button>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>PNG, SVG. Recommended 256×256px</p>
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
                            <img src={logoPreview} alt="Logo" style={{ width: 28, height: 28, objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{name}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {['Dashboard', 'Patients', 'Upload Images'].map((item, i) => (
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
                        <img src={logoPreview} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', filter: 'brightness(0) invert(1)', marginBottom: 12 }} />
                        <div style={{ color: 'white', fontSize: '1.3rem', fontWeight: 700, marginBottom: 6 }}>{name}</div>
                        <div style={{ color: 'rgba(94,234,212,0.8)', fontSize: '0.85rem', fontStyle: 'italic' }}>{tagline}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
