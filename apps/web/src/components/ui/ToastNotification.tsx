import React, { useEffect, useState, useCallback } from 'react'
import { Check, X, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
    id: string
    type: ToastType
    message: string
    duration?: number
}

interface ToastContextType {
    showToast: (type: ToastType, message: string, duration?: number) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
    const ctx = React.useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within a ToastProvider')
    return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([])

    const showToast = useCallback((type: ToastType, message: string, duration = 3000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        setToasts(prev => [...prev, { id, type, message, duration }])
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <ToastItemComponent key={toast.id} toast={toast} onRemove={removeToast} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItemComponent({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
    const [isLeaving, setIsLeaving] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLeaving(true)
            setTimeout(() => onRemove(toast.id), 300)
        }, toast.duration || 3000)
        return () => clearTimeout(timer)
    }, [toast.id, toast.duration, onRemove])

    const dismiss = () => {
        setIsLeaving(true)
        setTimeout(() => onRemove(toast.id), 300)
    }

    const icons: Record<ToastType, React.ReactNode> = {
        success: <Check size={20} />,
        error: <X size={20} />,
        warning: <AlertTriangle size={20} />,
        info: <Info size={20} />,
    }

    return (
        <div className={`toast-item toast-${toast.type} ${isLeaving ? 'toast-leaving' : 'toast-entering'}`}>
            <div className="toast-icon">{icons[toast.type]}</div>
            <span className="toast-message">{toast.message}</span>
            <button className="toast-close" onClick={dismiss}><X size={16} /></button>
        </div>
    )
}
