import { useState, useEffect, useRef } from 'react'
import { Video, VideoOff, Mic, MicOff, Maximize, X, Users } from 'lucide-react'
import { Button } from '../ui/Button'

interface VideoConferenceProps {
    screeningId: string
    onClose: () => void
    onSyncPanChange?: (x: number, y: number, zoom: number) => void
}

export function VideoConference({ screeningId, onClose, onSyncPanChange }: VideoConferenceProps) {
    const [isJoined, setIsJoined] = useState(false)
    const [cameraOn, setCameraOn] = useState(true)
    const [micOn, setMicOn] = useState(true)

    const localVideoRef = useRef<HTMLVideoElement>(null)

    // Simulated WebRTC Local Stream setup
    useEffect(() => {
        let stream: MediaStream | null = null
        if (isJoined && cameraOn) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: micOn })
                .then((mediaStream) => {
                    stream = mediaStream
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = mediaStream
                    }
                })
                .catch(err => console.error("Could not get media devices", err))
        }

        return () => {
            // Cleanup streams on unmount or toggle
            if (stream) {
                stream.getTracks().forEach(track => track.stop())
            }
        }
    }, [isJoined, cameraOn, micOn])

    if (!isJoined) {
        return (
            <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center space-y-6">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                        <Video className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Diagnostic Consultation</h2>
                        <p className="text-slate-500">Join the live video session for Screening {screeningId.slice(0, 8)}... Enable your camera and microphone to collaborate in real-time.</p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={() => setCameraOn(!cameraOn)} className={`p-4 rounded-full transition-colors ${cameraOn ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}>
                            {cameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        </button>
                        <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full transition-colors ${micOn ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-red-100 hover:bg-red-200 text-red-600'}`}>
                            {micOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </button>
                    </div>

                    <div className="flex gap-3 w-full pt-4 border-t border-slate-100">
                        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                        <Button className="flex-1" onClick={() => setIsJoined(true)}>Join Call</Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 left-6 z-[90] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-500/20 border border-slate-700 w-80">

            {/* Header */}
            <div className="bg-slate-800/80 p-3 flex justify-between items-center text-white text-xs font-semibold tracking-wider">
                <div className="flex items-center gap-2 text-emerald-400">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    Live Sync
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                    <Users className="w-3.5 h-3.5" /> 2 participants
                </div>
            </div>

            {/* Video Grid (Simulated P2P) */}
            <div className="relative aspect-video bg-black flex space-x-0.5 p-0.5">
                <div className="flex-1 relative bg-slate-800 flex items-center justify-center overflow-hidden rounded-l">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
                    <div className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 rounded">You</div>
                </div>
                <div className="flex-1 relative bg-slate-800 flex items-center justify-center overflow-hidden rounded-r">
                    {/* Mock Remote User */}
                    <div className="text-slate-500 text-xs">Waiting...</div>
                    <div className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 rounded">Clinic Op</div>
                </div>
            </div>

            {/* Controls */}
            <div className="p-3 bg-slate-800 flex justify-center gap-4">
                <button onClick={() => setMicOn(!micOn)} className={`p-2.5 rounded-full transition-colors ${micOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'}`}>
                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button onClick={() => setCameraOn(!cameraOn)} className={`p-2.5 rounded-full transition-colors ${cameraOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'}`}>
                    {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
                <button
                    className="p-2.5 rounded-full transition-colors bg-indigo-600 hover:bg-indigo-500 text-white"
                    title="Enable Sync Panning"
                    onClick={() => {
                        // Mock sending a sync event
                        if (onSyncPanChange) onSyncPanChange(0.5, 0.5, 2.0)
                    }}
                >
                    <Maximize className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="p-2.5 rounded-full transition-colors bg-red-600 hover:bg-red-500 text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>

        </div>
    )
}
