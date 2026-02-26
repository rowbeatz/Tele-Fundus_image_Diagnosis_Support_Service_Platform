import React, { useState, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { UploadCloud, FileImage, X } from 'lucide-react'

// Simple helper to hash file using Web Crypto API
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

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (files.length === 0) {
            alert('Please select at least one fundus image.')
            return
        }

        setIsUploading(true)
        setProgress(10)

        try {
            // 1. Create Patient & Screening (Assuming a simplified /api/ops-screenings endpoint or similar, 
            // or we can just mock a submission for the sake of MVP frontend demonstration)
            // Since ops-screenings POST requires an existing clientOrderId, we might need a dedicated upload API or mock it.

            const payload = {
                externalExamineeId: externalId,
                displayName: examineeName,
                bloodPressureSystolic: parseInt(systolic),
                bloodPressureDiastolic: parseInt(diastolic)
            }
            console.log('Registering examinee & screening', payload)
            setProgress(30)

            // Mock delay representing DB creation
            await new Promise(r => setTimeout(r, 1000))

            // 2. Hash & Get Presigned URLs
            setProgress(50)
            const imagePayloads = await Promise.all(
                files.map(async (file) => ({
                    originalFilename: file.name,
                    eyeSide: file.name.toLowerCase().includes('left') ? 'left' : 'right',
                    mimeType: file.type,
                    fileSizeBytes: file.size,
                    sha256Hash: await hashFile(file)
                }))
            )

            console.log('Requesting signed URLs for', imagePayloads)
            await new Promise(r => setTimeout(r, 1000))
            setProgress(75)

            // 3. Upload to S3 (Mocking physical upload time)
            await new Promise(r => setTimeout(r, 1500))

            setProgress(100)
            alert('Upload completed successfully!')

            // Reset
            setExamineeName('')
            setExternalId('')
            setSystolic('')
            setDiastolic('')
            setFiles([])
        } catch (err: any) {
            console.error(err)
            alert('Upload failed: ' + err.message)
        } finally {
            setIsUploading(false)
            setProgress(0)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">New Screening Registration</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Examinee Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Examinee ID / Chart No.</Label>
                                <Input value={externalId} onChange={e => setExternalId(e.target.value)} required placeholder="e.g. EX-12345" />
                            </div>
                            <div>
                                <Label>Full Name</Label>
                                <Input value={examineeName} onChange={e => setExamineeName(e.target.value)} required placeholder="John Doe" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Systolic BP</Label>
                                    <Input type="number" value={systolic} onChange={e => setSystolic(e.target.value)} placeholder="120" />
                                </div>
                                <div>
                                    <Label>Diastolic BP</Label>
                                    <Input type="number" value={diastolic} onChange={e => setDiastolic(e.target.value)} placeholder="80" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Fundus Images</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-colors cursor-pointer ${files.length > 0 ? 'border-primary/50 bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 text-center">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 mt-1">JPEG, PNG up to 10MB each</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    multiple
                                    accept="image/jpeg,image/png"
                                />
                            </div>

                            {files.length > 0 && (
                                <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                                    {files.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded-md shadow-sm">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <FileImage className="w-5 h-5 text-blue-500 shrink-0" />
                                                <span className="text-sm truncate font-medium text-gray-700">{f.name}</span>
                                                <span className="text-xs text-gray-400">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                            <button type="button" onClick={() => removeFile(i)} className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-100">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <Button type="submit" size="lg" disabled={isUploading || files.length === 0}>
                        {isUploading ? `Uploading... ${progress}%` : 'Submit Screening'}
                    </Button>
                </div>

                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
            </form>
        </div>
    )
}
