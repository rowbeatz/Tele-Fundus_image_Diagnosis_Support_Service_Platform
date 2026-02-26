import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../lib/i18n'
import { MessageSquare, X, Send, Video, Monitor, PhoneOff, Mic, MicOff, Camera, CameraOff } from 'lucide-react'

interface ChatMessage {
    id: number
    from: string
    fromInitials: string
    text: string
    time: string
    isOwn: boolean
}

const mockContacts = [
    { id: 1, name: 'Dr. 田中 康夫', role: 'Physician', initials: 'DT', online: true },
    { id: 2, name: 'オペレーター 山口', role: 'Operator', initials: 'OY', online: true },
    { id: 3, name: 'Dr. 佐藤 惠理子', role: 'Physician', initials: 'DS', online: false },
    { id: 4, name: '小林 直樹', role: 'Client', initials: 'KN', online: false },
]

const mockMessages: ChatMessage[] = [
    { id: 1, from: 'Dr. 田中 康夫', fromInitials: 'DT', text: 'スクリーニング結果を確認しました。左眼の所見について相談したいです。', time: '14:23', isOwn: false },
    { id: 2, from: 'You', fromInitials: 'SA', text: '承知しました。データをすぐに送ります。', time: '14:25', isOwn: true },
    { id: 3, from: 'Dr. 田中 康夫', fromInitials: 'DT', text: 'ありがとうございます。ビデオ通話で画像を共有できますか？', time: '14:26', isOwn: false },
]

interface ChatPanelProps {
    open: boolean
    onClose: () => void
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
    const { t } = useTranslation()
    const [selectedContact, setSelectedContact] = useState<number | null>(1)
    const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
    const [input, setInput] = useState('')
    const [showVideo, setShowVideo] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = () => {
        if (!input.trim()) return
        setMessages(prev => [...prev, {
            id: Date.now(), from: 'You', fromInitials: 'SA',
            text: input.trim(), time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
        }])
        setInput('')
    }

    if (!open) return null

    return (
        <>
            <div className="chat-panel">
                <div className="chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MessageSquare style={{ width: 18, height: 18 }} />
                        <span style={{ fontWeight: 600 }}>{t('chat.title' as any)}</span>
                    </div>
                    <button className="chat-close-btn" onClick={onClose}>
                        <X style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {/* Contacts */}
                <div className="chat-contacts">
                    {mockContacts.map(c => (
                        <button
                            key={c.id}
                            className={`chat-contact ${selectedContact === c.id ? 'active' : ''}`}
                            onClick={() => setSelectedContact(c.id)}
                        >
                            <div className="chat-avatar">{c.initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 500, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.role}</div>
                            </div>
                            <div className={`chat-online-dot ${c.online ? 'online' : ''}`} />
                        </button>
                    ))}
                </div>

                {/* Messages */}
                <div className="chat-messages">
                    {messages.map(m => (
                        <div key={m.id} className={`chat-bubble ${m.isOwn ? 'own' : ''}`}>
                            {!m.isOwn && <div className="chat-bubble-name">{m.from}</div>}
                            <div className="chat-bubble-text">{m.text}</div>
                            <div className="chat-bubble-time">{m.time}</div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Actions */}
                <div className="chat-actions">
                    <button className="chat-action-btn" onClick={() => setShowVideo(true)} title={t('chat.video_call' as any)}>
                        <Video style={{ width: 16, height: 16 }} />
                    </button>
                    <button className="chat-action-btn" title={t('chat.screen_share' as any)}>
                        <Monitor style={{ width: 16, height: 16 }} />
                    </button>
                </div>

                {/* Input */}
                <div className="chat-input-area">
                    <input
                        className="chat-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder={t('chat.placeholder' as any)}
                    />
                    <button className="chat-send-btn" onClick={sendMessage}>
                        <Send style={{ width: 16, height: 16 }} />
                    </button>
                </div>
            </div>

            {/* Video Call Modal */}
            {showVideo && (
                <VideoCallModal onClose={() => setShowVideo(false)} />
            )}
        </>
    )
}

function VideoCallModal({ onClose }: { onClose: () => void }) {
    const [micOn, setMicOn] = useState(true)
    const [camOn, setCamOn] = useState(true)

    return (
        <div className="video-modal-overlay">
            <div className="video-modal">
                <div className="video-modal-header">
                    <span style={{ fontWeight: 600 }}>Video Call — Dr. 田中 康夫</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>00:02:30</span>
                </div>
                <div className="video-modal-body">
                    <div className="video-remote">
                        <div className="video-placeholder">
                            <Camera style={{ width: 48, height: 48, opacity: 0.3 }} />
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Remote Video</span>
                        </div>
                    </div>
                    <div className="video-local">
                        <div className="video-placeholder small">
                            <span style={{ fontSize: '0.7rem' }}>You</span>
                        </div>
                    </div>
                </div>
                <div className="video-controls">
                    <button className={`video-control-btn ${!micOn ? 'off' : ''}`} onClick={() => setMicOn(!micOn)}>
                        {micOn ? <Mic style={{ width: 20, height: 20 }} /> : <MicOff style={{ width: 20, height: 20 }} />}
                    </button>
                    <button className={`video-control-btn ${!camOn ? 'off' : ''}`} onClick={() => setCamOn(!camOn)}>
                        {camOn ? <Camera style={{ width: 20, height: 20 }} /> : <CameraOff style={{ width: 20, height: 20 }} />}
                    </button>
                    <button className="video-control-btn" title="Screen Share">
                        <Monitor style={{ width: 20, height: 20 }} />
                    </button>
                    <button className="video-control-btn hangup" onClick={onClose}>
                        <PhoneOff style={{ width: 20, height: 20 }} />
                    </button>
                </div>
            </div>
        </div>
    )
}
