import React, { useState, useRef } from 'react'
import { useTranslation } from '../../lib/i18n'
import { UploadCloud, FileImage, X } from 'lucide-react'

async function hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function Uploads() {
    const [examineeName, setExamineeName] = useState('')
    const [externalId, setExternalId] = useState('')
    const [systolic, setSystolic] = useState('')
    const [diastolic, setDiastolic] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { t } = useTranslation()

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files) {
            const added = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
            setFiles(prev => [...prev, ...added])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const added = Array.from(e.target.files).filter(f => f.type.startsWith('image/'))
            setFiles(prev => [...prev, ...added])
        }
    }

    const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (files.length === 0) { alert('Please select at least one fundus image.'); return }
        setIsUploading(true); setProgress(10)
        try {
            await new Promise(r => setTimeout(r, 1000)); setProgress(50)
            await Promise.all(files.map(async (file) => ({
                originalFilename: file.name,
                eyeSide: file.name.toLowerCase().includes('left') ? 'left' : 'right',
                sha256Hash: await hashFile(file)
            })))
            setProgress(75); await new Promise(r => setTimeout(r, 1500)); setProgress(100)
            alert('Upload completed!')
            setExamineeName(''); setExternalId(''); setSystolic(''); setDiastolic(''); setFiles([])
        } catch (err: any) { alert('Upload failed: ' + err.message) }
        finally { setIsUploading(false); setProgress(0) }
    }

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }} className="space-y-6">
            <h1>{t('uploads.title')}</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    {/* Examinee */}
                    <div className="panel space-y-4">
                        <h3>{t('uploads.examinee')}</h3>
                        <div>
                            <label className="label">{t('uploads.id')}</label>
                            <input className="input-field" value={externalId} onChange={e => setExternalId(e.target.value)} required placeholder="EX-12345" />
                        </div>
                        <div>
                            <label className="label">{t('uploads.name')}</label>
                            <input className="input-field" value={examineeName} onChange={e => setExamineeName(e.target.value)} required placeholder="田中 太郎" />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label className="label">{t('uploads.systolic')}</label>
                                <input className="input-field" type="number" value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="120" />
                            </div>
                            <div>
                                <label className="label">{t('uploads.diastolic')}</label>
                                <input className="input-field" type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="80" />
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="panel space-y-4">
                        <h3>{t('uploads.images')}</h3>
                        <div
                            className={`drop-zone ${files.length > 0 ? 'active' : ''}`}
                            onDragOver={e => e.preventDefault()} onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <UploadCloud style={{ width: 40, height: 40, color: 'var(--text-muted)', marginBottom: 8 }} />
                            <p style={{ fontSize: '0.9rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{t('uploads.drop')}</span> {t('uploads.drop_hint')}
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t('uploads.format')}</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} multiple accept="image/jpeg,image/png" />
                        </div>

                        {files.length > 0 && (
                            <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {files.map((f, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '8px 12px', background: 'var(--bg)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                                            <FileImage style={{ width: 18, height: 18, color: 'var(--info)', flexShrink: 0 }} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }} className="truncate">{f.name}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button type="button" onClick={() => removeFile(i)} style={{
                                            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                                            color: 'var(--text-muted)', borderRadius: 4,
                                        }}>
                                            <X style={{ width: 16, height: 16 }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-primary" type="submit" style={{ minWidth: 180, height: 44 }} disabled={isUploading || files.length === 0}>
                        {isUploading ? `${t('uploads.uploading')} ${progress}%` : t('uploads.submit')}
                    </button>
                </div>

                {isUploading && (
                    <div className="progress-bar" style={{ marginTop: 12 }}>
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                )}
            </form>
        </div>
    )
}
