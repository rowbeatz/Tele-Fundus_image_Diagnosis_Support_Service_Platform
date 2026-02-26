import React, { createContext, useContext, useState, useCallback } from 'react'

export interface TabItem {
    id: string
    title: string
    path: string
    icon?: string
}

interface TabContextType {
    tabs: TabItem[]
    activeTabId: string | null
    openTab: (tab: Omit<TabItem, 'id'>) => void
    closeTab: (id: string) => void
    switchTab: (id: string) => void
    closeAllTabs: () => void
}

const TabContext = createContext<TabContextType | undefined>(undefined)

let tabIdCounter = 0
const generateId = () => `tab-${++tabIdCounter}`

export function TabProvider({ children }: { children: React.ReactNode }) {
    const [tabs, setTabs] = useState<TabItem[]>([])
    const [activeTabId, setActiveTabId] = useState<string | null>(null)

    const openTab = useCallback((tab: Omit<TabItem, 'id'>) => {
        setTabs(prev => {
            // If tab for this path already exists, activate it
            const existing = prev.find(t => t.path === tab.path)
            if (existing) {
                setActiveTabId(existing.id)
                return prev
            }
            // Max 8 tabs
            const newTab: TabItem = { ...tab, id: generateId() }
            const updated = prev.length >= 8 ? [...prev.slice(1), newTab] : [...prev, newTab]
            setActiveTabId(newTab.id)
            return updated
        })
    }, [])

    const closeTab = useCallback((id: string) => {
        setTabs(prev => {
            const idx = prev.findIndex(t => t.id === id)
            const updated = prev.filter(t => t.id !== id)
            if (activeTabId === id && updated.length > 0) {
                // Activate neighbor tab
                const newIdx = Math.min(idx, updated.length - 1)
                setActiveTabId(updated[newIdx].id)
            } else if (updated.length === 0) {
                setActiveTabId(null)
            }
            return updated
        })
    }, [activeTabId])

    const switchTab = useCallback((id: string) => {
        setActiveTabId(id)
    }, [])

    const closeAllTabs = useCallback(() => {
        setTabs([])
        setActiveTabId(null)
    }, [])

    return (
        <TabContext.Provider value={{ tabs, activeTabId, openTab, closeTab, switchTab, closeAllTabs }}>
            {children}
        </TabContext.Provider>
    )
}

export function useTabs() {
    const ctx = useContext(TabContext)
    if (!ctx) throw new Error('useTabs must be used within TabProvider')
    return ctx
}
