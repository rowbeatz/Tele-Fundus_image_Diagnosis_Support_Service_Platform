import { useState, useEffect, useRef } from 'react'
import { Send, Mic, MicOff, Image as ImageIcon, Video, Paperclip, X } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../contexts/AuthContext'

interface Message {
    id: string
    thread_id: string
    sender_id: string
    content_text: string
    audio_transcription?: string
    viewer_annotation_json?: any
    created_at: string
}

export function ChatPanel({ screeningId, onClose, onStartVideoCall }: { screeningId: string, onClose: () => void, onStartVideoCall?: () => void }) {
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [inputText, setInputText] = useState('')
    const [threadId, setThreadId] = useState<string | null>(null)

    // Audio Recording & Web Speech AI State
    const [isRecording, setIsRecording] = useState(false)
    const recognitionRef = useRef<unknown>(null)

    useEffect(() => {
        // 1. Fetch or Create Thread
        fetch(`/api/communication/screenings/${screeningId}/thread`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `Discussion for ${screeningId}` })
        })
            .then(r => r.json())
            .then(data => {
                setThreadId(data.id)
                return fetch(`/api/communication/threads/${data.id}/messages`)
            })
            .then(r => r.json())
            .then(data => setMessages(data.messages || []))
            .catch(console.error)
    }, [screeningId])

    // Simple polling for MVP real-time feel (Replace with WebSocket later)
    useEffect(() => {
        if (!threadId) return
        const interval = setInterval(() => {
            fetch(`/api/communication/threads/${threadId}/messages`)
                .then(r => r.json())
                .then(data => setMessages(data.messages || []))
        }, 5000)
        return () => clearInterval(interval)
    }, [threadId])

    const handleSendMessage = () => {
        if (!inputText.trim() || !threadId) return

        fetch(`/api/communication/threads/${threadId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contentText: inputText })
        }).then(r => r.json()).then(newMessage => {
            setMessages(prev => [...prev, newMessage])
            setInputText('')
        })
    }

    // --- Web Speech API (AI Voice-to-Text) ---
    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                // @ts-ignore
                ; (recognitionRef.current as any).stop()
            }
            setIsRecording(false)
        } else {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                alert("Web Speech API is not supported in this browser.")
                return
            }

            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.continuous = true
            recognition.interimResults = true
            recognition.lang = 'ja-JP' // Defaulting to Japanese for this platform

            recognition.onresult = (event: any) => {
                let finalTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript
                    }
                }

                if (finalTranscript) {
                    setInputText(prev => prev + ' ' + finalTranscript)
                }
            }

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error)
                setIsRecording(false)
            }

            recognition.onend = () => {
                setIsRecording(false)
            }

            recognition.start()
            recognitionRef.current = recognition
            setIsRecording(true)
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 w-80 shadow-xl fixed right-0 top-0 z-50">

            <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md">
                <h3 className="font-semibold text-sm">Case Discussion</h3>
                <button onClick={onClose} className="hover:bg-indigo-700 p-1 rounded-full text-white/80 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => {
                    const isMe = m.sender_id === user?.id
                    return (
                        <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white border text-slate-800 rounded-bl-none shadow-sm'}`}>
                                <p className="text-sm whitespace-pre-wrap">{m.content_text}</p>
                                {m.audio_transcription && (
                                    <div className="mt-2 text-xs border-t border-indigo-400/30 pt-1 italic opacity-80">
                                        🎤 {m.audio_transcription}
                                    </div>
                                )}
                                {m.viewer_annotation_json && (
                                    <button className="mt-2 text-xs bg-black/10 hover:bg-black/20 px-2 py-1 rounded inline-flex items-center gap-1 transition-colors">
                                        <ImageIcon className="w-3 h-3" /> View Pinned Area
                                    </button>
                                )}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-1">{new Date(m.created_at).toLocaleTimeString()}</span>
                        </div>
                    )
                })}
                {messages.length === 0 && (
                    <div className="text-center text-slate-400 mt-10 text-sm">
                        No messages yet. Start the discussion.
                    </div>
                )}
            </div>

            <div className="p-3 bg-white border-t border-slate-200">
                <div className="flex gap-2 mb-2">
                    <button onClick={onStartVideoCall} title="Start Video Call" className="text-slate-400 hover:text-indigo-600 p-1.5 transition-colors rounded-md hover:bg-slate-100">
                        <Video className="w-4 h-4" />
                    </button>
                    <button title="Attach Image Pin" className="text-slate-400 hover:text-indigo-600 p-1.5 transition-colors rounded-md hover:bg-slate-100">
                        <Paperclip className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                        <textarea
                            className="w-full resize-none rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 pr-10 text-sm py-2 px-3 shadow-sm bg-slate-50"
                            rows={2}
                            placeholder="Type a message or use voice..."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                            }}
                        />
                        <button
                            onClick={toggleRecording}
                            className={`absolute right-2 top-2 p-1.5 rounded-full transition-all ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                            title="AI Voice Dictation (Whisper API / Speech API)"
                        >
                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    </div>
                    <Button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim()}
                        className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0 shadow-md"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
