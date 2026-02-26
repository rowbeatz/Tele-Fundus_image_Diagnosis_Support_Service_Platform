import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Label } from '../../components/ui/Label'
import { FileJson, Link as LinkIcon, Download, RefreshCw } from 'lucide-react'

export default function IntegrationSettings() {
    const [exportFormat, setExportFormat] = useState('hl7_fhir_r4')
    const [autoSync, setAutoSync] = useState(false)

    const handleSave = () => {
        // Save preferences to context/API
        alert(`Integration preferences saved.\\nFormat: ${exportFormat}\\nAuto-Sync: ${autoSync}`)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold tracking-tight">System Integrations</h1>
                <Button onClick={handleSave}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Save Preferences
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export / Import Formats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileJson className="w-5 h-5 text-indigo-500" />
                            Data Exchange Formatting
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label>Default Export / Import Format</Label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-slate-300 bg-white"
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                            >
                                <option value="hl7_fhir_r4">HL7 FHIR (Release 4) - Recommended (HIPAA Compliant)</option>
                                <option value="csv_legacy">Legacy CSV Report</option>
                                <option value="pdf_summary">PDF Visual Summary</option>
                                <option value="dicom_wado">DICOM WADO-RS</option>
                            </select>
                            <p className="text-sm text-slate-500 mt-2">
                                All external API calls and bulk downloads will utilize this standard vocabulary for Patient (Examinee) and Observation (Screening) mapping.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex gap-4">
                            <Button variant="outline" className="w-full bg-slate-50">
                                <Download className="w-4 h-4 mr-2" />
                                Test FHIR Patient Export
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* EMR / Webhooks */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <LinkIcon className="w-5 h-5 text-indigo-500" />
                            EMR System Webhooks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="auto-sync"
                                    className="rounded text-indigo-600 w-4 h-4"
                                    checked={autoSync}
                                    onChange={(e) => setAutoSync(e.target.checked)}
                                />
                                <Label htmlFor="auto-sync">Enable Auto-Sync to EMR passing DiagnosticReport Data</Label>
                            </div>

                            <div className="space-y-2">
                                <Label>Webhook Endpoint URL</Label>
                                <input
                                    type="text"
                                    disabled={!autoSync}
                                    placeholder="https://client-emr.local/api/receive"
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-slate-50 disabled:opacity-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>API Secret Key</Label>
                                <input
                                    type="password"
                                    disabled={!autoSync}
                                    placeholder="••••••••••••••••"
                                    className="w-full h-10 px-3 rounded-md border border-slate-300 bg-slate-50 disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
