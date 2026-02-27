import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../lib/i18n'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, X, Send, Video, Monitor, PhoneOff, Mic, MicOff, Camera, CameraOff, AlertTriangle } from 'lucide-react'

interface ChatMessage {
    id: number
    from: string
    fromInitials: string
    text: string
    time: string
    isOwn: boolean
    caseRef?: string  // e.g. "SCR-001"
}

const mockContacts = [
    { id: 1, name: 'Dr. 田中 康夫', role: 'Physician', initials: 'DT', online: true },
    { id: 2, name: 'オペレーター 山口', role: 'Operator', initials: 'OY', online: true },
    { id: 3, name: 'Dr. 佐藤 惠理子', role: 'Physician', initials: 'DS', online: false },
    { id: 4, name: '小林 直樹', role: 'Client', initials: 'KN', online: false },
]

const mockMessages: ChatMessage[] = [
    { id: 1, from: 'Dr. 田中 康夫', fromInitials: 'DT', text: 'スクリーニング結果を確認しました。', time: '14:23', isOwn: false },
    { id: 2, from: 'Dr. 田中 康夫', fromInitials: 'DT', text: '左眼の所見について相談したいです。@case:SCR-003 を確認してください。', time: '14:23', isOwn: false, caseRef: 'SCR-003' },
    { id: 3, from: 'You', fromInitials: 'SA', text: '承知しました。データをすぐに送ります。', time: '14:25', isOwn: true },
    { id: 4, from: 'Dr. 田中 康夫', fromInitials: 'DT', text: 'ありがとうございます。ビデオ通話で画像を共有できますか？', time: '14:26', isOwn: false },
]

// Simple @mention suggestions
const mentionSuggestions = [
    { type: 'user' as const, label: '@Dr. 田中 康夫', value: '@dr.tanaka' },
    { type: 'user' as const, label: '@オペレーター 山口', value: '@op.yamaguchi' },
    { type: 'case' as const, label: '@case:SCR-001 田中太郎', value: '@case:SCR-001' },
    { type: 'case' as const, label: '@case:SCR-002 鈴木花子', value: '@case:SCR-002' },
    { type: 'case' as const, label: '@case:SCR-003 佐藤健一', value: '@case:SCR-003' },
]

interface ChatPanelProps {
    open: boolean
    onClose: () => void
}

export function ChatPanel({ open, onClose }: ChatPanelProps) {
    const { t, lang } = useTranslation()
    const navigate = useNavigate()
    const [selectedContact, setSelectedContact] = useState<number | null>(1)
    const [messages, setMessages] = useState<ChatMessage[]>(mockMessages)
    const [input, setInput] = useState('')
    const [showVideo, setShowVideo] = useState(false)
    const [showMentions, setShowMentions] = useState(false)
    const [mentionFilter, setMentionFilter] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleInputChange = (value: string) => {
        setInput(value)
        // Check for @ trigger
        const lastAt = value.lastIndexOf('@')
        if (lastAt >= 0 && lastAt === value.length - 1) {
            setShowMentions(true)
            setMentionFilter('')
        } else if (lastAt >= 0) {
            const afterAt = value.slice(lastAt + 1)
            if (!afterAt.includes(' ')) {
                setShowMentions(true)
                setMentionFilter(afterAt.toLowerCase())
            } else {
                setShowMentions(false)
            }
        } else {
            setShowMentions(false)
        }
    }

    const insertMention = (mention: typeof mentionSuggestions[0]) => {
        const lastAt = input.lastIndexOf('@')
        const newInput = input.slice(0, lastAt) + mention.value + ' '
        setInput(newInput)
        setShowMentions(false)
    }

    const sendMessage = () => {
        if (!input.trim()) return
        const caseMatch = input.match(/@case:(SCR-\d+)/)
        setMessages(prev => [...prev, {
            id: Date.now(), from: 'You', fromInitials: 'SA',
            text: input.trim(),
            time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
            isOwn: true,
            caseRef: caseMatch ? caseMatch[1] : undefined,
        }])
        setInput('')
        setShowMentions(false)
    }

    const handleCaseClick = (caseRef: string) => {
        // Navigate to the viewer for this case
        navigate(`/viewer/${caseRef}`)
    }

    const renderMessageText = (msg: ChatMessage) => {
        const text = msg.text
        // Replace @case:XXX with clickable links
        const parts = text.split(/(@case:SCR-\d+|@\S+)/g)
        return parts.map((part, i) => {
            if (part.startsWith('@case:')) {
                const ref = part.replace('@case:', '')
                return (
                    <span key={i} className="chat-mention case" onClick={() => handleCaseClick(ref)}>
                        📋 {ref}
                    </span>
                )
            } else if (part.startsWith('@')) {
                return <span key={i} className="chat-mention">{part}</span>
            }
            return part
        })
    }

    const filteredMentions = mentionSuggestions.filter(m =>
        mentionFilter === '' || m.label.toLowerCase().includes(mentionFilter) || m.value.toLowerCase().includes(mentionFilter)
    )

    if (!open) return null

    return (
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

            {/* Inline Video Call */}
            {showVideo && (
                <InlineVideoCall onEnd={() => setShowVideo(false)} />
            )}

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
                        <div className="chat-bubble-text">{renderMessageText(m)}</div>
                        <div className="chat-bubble-time">{m.time}</div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Actions */}
            <div className="chat-actions">
                <button className="chat-action-btn" onClick={() => setShowVideo(v => !v)} title={t('chat.video_call' as any)}
                    style={showVideo ? { background: 'var(--primary)', color: 'white', borderColor: 'var(--primary)' } : {}}>
                    <Video style={{ width: 16, height: 16 }} />
                </button>
                <button className="chat-action-btn" title={t('chat.screen_share' as any)}>
                    <Monitor style={{ width: 16, height: 16 }} />
                </button>
                <button className="question-btn" title={lang === 'ja' ? '疑義照会' : 'Query Case'}>
                    <AlertTriangle style={{ width: 14, height: 14 }} />
                    {lang === 'ja' ? '疑義' : 'Query'}
                </button>
            </div>

            {/* Mention Autocomplete */}
            {showMentions && filteredMentions.length > 0 && (
                <div style={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)',
                    maxHeight: 160, overflowY: 'auto', margin: '0 12px',
                }}>
                    {filteredMentions.map((m, i) => (
                        <button key={i} onClick={() => insertMention(m)} style={{
                            display: 'block', width: '100%', padding: '8px 12px',
                            border: 'none', background: 'transparent', textAlign: 'left',
                            fontFamily: 'var(--font-sans)', fontSize: '0.8rem', cursor: 'pointer',
                            color: m.type === 'case' ? 'var(--primary)' : 'var(--text-primary)',
                        }}>
                            {m.type === 'case' ? '📋 ' : '👤 '}{m.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="chat-input-area">
                <input
                    className="chat-input"
                    value={input}
                    onChange={e => handleInputChange(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={t('chat.placeholder' as any)}
                />
                <button className="chat-send-btn" onClick={sendMessage}>
                    <Send style={{ width: 16, height: 16 }} />
                </button>
            </div>
        </div>
    )
}

function InlineVideoCall({ onEnd }: { onEnd: () => void }) {
    const [micOn, setMicOn] = useState(true)
    const [camOn, setCamOn] = useState(true)

    return (
        <div className="video-inline">
            <div className="video-inline-body">
                <div className="video-remote">
                    <div className="video-placeholder">
                        <Camera style={{ width: 32, height: 32, opacity: 0.3 }} />
                        <span>Remote Video</span>
                    </div>
                </div>
                <div className="video-local">
                    <div className="video-placeholder small">
                        <span>You</span>
                    </div>
                </div>
            </div>
            <div className="video-controls">
                <button className={`video-control-btn ${!micOn ? 'off' : ''}`} onClick={() => setMicOn(!micOn)}>
                    {micOn ? <Mic style={{ width: 16, height: 16 }} /> : <MicOff style={{ width: 16, height: 16 }} />}
                </button>
                <button className={`video-control-btn ${!camOn ? 'off' : ''}`} onClick={() => setCamOn(!camOn)}>
                    {camOn ? <Camera style={{ width: 16, height: 16 }} /> : <CameraOff style={{ width: 16, height: 16 }} />}
                </button>
                <button className="video-control-btn" title="Screen Share">
                    <Monitor style={{ width: 16, height: 16 }} />
                </button>
                <button className="video-control-btn hangup" onClick={onEnd}>
                    <PhoneOff style={{ width: 16, height: 16 }} />
                </button>
            </div>
        </div>
    )
}
