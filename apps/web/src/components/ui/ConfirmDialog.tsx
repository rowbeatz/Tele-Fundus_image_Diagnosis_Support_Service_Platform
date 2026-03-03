import React, { useState } from 'react'
import { AlertTriangle, ShieldCheck, X } from 'lucide-react'

interface ConfirmDialogProps {
    isOpen: boolean
    title: string
    message: string
    requireReason?: boolean
    reasonLabel?: string
    reasonPlaceholder?: string
    confirmText?: string
    cancelText?: string
    variant?: 'warning' | 'danger' | 'info'
    onConfirm: (reason: string) => void
    onCancel: () => void
}

export default function ConfirmDialog({
    isOpen,
    title,
    message,
    requireReason = true,
    reasonLabel,
    reasonPlaceholder,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'warning',
    onConfirm,
    onCancel
}: ConfirmDialogProps) {
    const [reason, setReason] = useState('')

    if (!isOpen) return null

    const handleConfirm = () => {
        if (requireReason && !reason.trim()) return
        onConfirm(reason.trim())
        setReason('')
    }

    const handleCancel = () => {
        setReason('')
        onCancel()
    }

    const variantColors: Record<string, { icon: string; border: string; bg: string; btn: string }> = {
        warning: { icon: '#f59e0b', border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.05)', btn: '#f59e0b' },
        danger: { icon: '#ef4444', border: 'rgba(239,68,68,0.3)', bg: 'rgba(239,68,68,0.05)', btn: '#ef4444' },
        info: { icon: '#3b82f6', border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.05)', btn: '#3b82f6' },
    }
    const colors = variantColors[variant]

    return (
        <div className="confirm-dialog-overlay" onClick={handleCancel}>
            <div className="confirm-dialog" onClick={e => e.stopPropagation()} style={{ borderColor: colors.border }}>
                {/* Header */}
                <div className="confirm-dialog-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: colors.bg, borderRadius: '50%', padding: 10, display: 'flex' }}>
                            {variant === 'danger' ? <AlertTriangle size={24} color={colors.icon} /> : <ShieldCheck size={24} color={colors.icon} />}
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
                    </div>
                    <button onClick={handleCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="confirm-dialog-body">
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>{message}</p>

                    {requireReason && (
                        <div>
                            <label className="label" style={{ marginBottom: 6 }}>
                                {reasonLabel || '変更理由'} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <textarea
                                className="input-field"
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder={reasonPlaceholder || '変更の理由を入力してください...'}
                                rows={3}
                                style={{ width: '100%', resize: 'vertical' }}
                                autoFocus
                            />
                            {requireReason && !reason.trim() && (
                                <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: 4 }}>
                                    変更理由は必須です
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="confirm-dialog-footer">
                    <button className="btn btn-secondary" onClick={handleCancel} style={{ padding: '0 20px', height: 40 }}>
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        onClick={handleConfirm}
                        disabled={requireReason && !reason.trim()}
                        style={{
                            padding: '0 20px',
                            height: 40,
                            background: requireReason && !reason.trim() ? 'var(--border)' : colors.btn,
                            color: '#fff',
                            border: 'none',
                            cursor: requireReason && !reason.trim() ? 'not-allowed' : 'pointer',
                            opacity: requireReason && !reason.trim() ? 0.5 : 1,
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
