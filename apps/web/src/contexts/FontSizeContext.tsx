import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

type FontSize = 'small' | 'normal' | 'large'

const fontSizeMap: Record<FontSize, number> = {
    small: 13,
    normal: 15,
    large: 17,
}

interface FontSizeContextType {
    fontSize: FontSize
    setFontSize: (size: FontSize) => void
    cycleFontSize: () => void
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        const stored = localStorage.getItem('ri-fontsize')
        return (stored === 'small' || stored === 'normal' || stored === 'large') ? stored : 'normal'
    })

    const setFontSize = useCallback((size: FontSize) => {
        setFontSizeState(size)
        localStorage.setItem('ri-fontsize', size)
        document.documentElement.style.fontSize = `${fontSizeMap[size]}px`
    }, [])

    const cycleFontSize = useCallback(() => {
        setFontSizeState(prev => {
            const order: FontSize[] = ['small', 'normal', 'large']
            const next = order[(order.indexOf(prev) + 1) % 3]
            localStorage.setItem('ri-fontsize', next)
            document.documentElement.style.fontSize = `${fontSizeMap[next]}px`
            return next
        })
    }, [])

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSizeMap[fontSize]}px`
    }, [fontSize])

    return (
        <FontSizeContext.Provider value={{ fontSize, setFontSize, cycleFontSize }}>
            {children}
        </FontSizeContext.Provider>
    )
}

export function useFontSize() {
    const ctx = useContext(FontSizeContext)
    if (!ctx) throw new Error('useFontSize must be used within FontSizeProvider')
    return ctx
}
