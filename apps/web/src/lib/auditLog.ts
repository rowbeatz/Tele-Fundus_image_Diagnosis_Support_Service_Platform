/**
 * Audit Log Utility
 * 
 * Stores operation logs for Save / Confirm / Unlock workflows.
 * Currently persists to localStorage for demo purposes.
 * Designed for future migration to POST /api/audit-logs.
 */

export type AuditAction =
    | 'save_draft'
    | 'confirm'
    | 'unlock_confirmed'
    | 'update_after_confirm'
    | 'batch_save'
    | 'batch_confirm'
    | 'batch_unlock'

export interface AuditEntry {
    id: string
    timestamp: string
    userId: string
    userName: string
    action: AuditAction
    targetId: string       // Patient ID or batch ID
    targetName?: string    // Patient name for display
    reason?: string        // Required for unlock_confirmed
    details?: string       // Additional context
}

const STORAGE_KEY = 'tele_fundus_audit_log'

/** Retrieve all audit log entries */
export function getAuditLog(): AuditEntry[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        return raw ? JSON.parse(raw) : []
    } catch {
        return []
    }
}

/** Add a new audit entry */
export function addAuditEntry(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
    const full: AuditEntry = {
        ...entry,
        id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
    }

    const log = getAuditLog()
    log.push(full)

    // Keep most recent 500 entries to avoid localStorage bloat
    const trimmed = log.slice(-500)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))

    // Also log to console for debugging visibility
    console.info('[AuditLog]', full.action, full.targetId, full.reason || '')

    return full
}

/** Get audit entries for a specific target */
export function getAuditEntriesForTarget(targetId: string): AuditEntry[] {
    return getAuditLog().filter(e => e.targetId === targetId)
}

/** Format an action for display (Japanese) */
export function formatAuditAction(action: AuditAction, lang: string = 'ja'): string {
    const labels: Record<AuditAction, { ja: string; en: string }> = {
        save_draft: { ja: '一時保存', en: 'Draft Saved' },
        confirm: { ja: '確定', en: 'Confirmed' },
        unlock_confirmed: { ja: '確定解除', en: 'Unlocked' },
        update_after_confirm: { ja: '確定後の変更', en: 'Post-confirm Update' },
        batch_save: { ja: '一括保存', en: 'Batch Saved' },
        batch_confirm: { ja: '一括確定', en: 'Batch Confirmed' },
        batch_unlock: { ja: '一括確定解除', en: 'Batch Unlocked' },
    }
    return labels[action]?.[lang === 'ja' ? 'ja' : 'en'] || action
}
