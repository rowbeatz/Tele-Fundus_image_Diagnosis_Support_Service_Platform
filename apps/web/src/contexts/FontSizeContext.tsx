import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

/**
 * Font Size Context — 4-level system
 * 
 * 小 (small):     12px — 最小サイズ
 * 標準 (normal):  15px — 新しいベースライン（従来の標準より+1pt）
 * 標準+ (normalPlus): 17px — 標準よりやや大きめ
 * 大 (large):     21px — 明確に大きいサイズ
 */
type FontSize = 'small' | 'normal' | 'normalPlus' | 'large'

const fontSizeMap: Record<FontSize, number> = {
    small: 12,
    normal: 15,
    normalPlus: 17,
    large: 21,
}

const fontSizeLabels: Record<FontSize, { ja: string; en: string }> = {
    small: { ja: '小', en: 'Small' },
    normal: { ja: '標準', en: 'Normal' },
    normalPlus: { ja: '標準＋', en: 'Normal+' },
    large: { ja: '大', en: 'Large' },
}

const fontSizeOrder: FontSize[] = ['small', 'normal', 'normalPlus', 'large']

interface FontSizeContextType {
    fontSize: FontSize
    setFontSize: (size: FontSize) => void
    cycleFontSize: () => void
    fontSizeLabel: (lang: string) => string
    fontSizePx: number
    allSizes: { key: FontSize; label: { ja: string; en: string }; px: number }[]
}

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined)

function isValidFontSize(s: string): s is FontSize {
    return fontSizeOrder.includes(s as FontSize)
}

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
    const [fontSize, setFontSizeState] = useState<FontSize>(() => {
        const stored = localStorage.getItem('ri-fontsize')
        return stored && isValidFontSize(stored) ? stored : 'normal'
    })

    const setFontSize = useCallback((size: FontSize) => {
        setFontSizeState(size)
        localStorage.setItem('ri-fontsize', size)
        document.documentElement.style.fontSize = `${fontSizeMap[size]}px`
    }, [])

    const cycleFontSize = useCallback(() => {
        setFontSizeState(prev => {
            const next = fontSizeOrder[(fontSizeOrder.indexOf(prev) + 1) % fontSizeOrder.length]
            localStorage.setItem('ri-fontsize', next)
            document.documentElement.style.fontSize = `${fontSizeMap[next]}px`
            return next
        })
    }, [])

    const fontSizeLabel = useCallback((lang: string) => {
        return lang === 'ja' ? fontSizeLabels[fontSize].ja : fontSizeLabels[fontSize].en
    }, [fontSize])

    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSizeMap[fontSize]}px`
    }, [fontSize])

    const allSizes = fontSizeOrder.map(key => ({
        key,
        label: fontSizeLabels[key],
        px: fontSizeMap[key],
    }))

    return (
        <FontSizeContext.Provider value={{
            fontSize, setFontSize, cycleFontSize,
            fontSizeLabel, fontSizePx: fontSizeMap[fontSize], allSizes,
        }}>
            {children}
        </FontSizeContext.Provider>
    )
}

export function useFontSize() {
    const ctx = useContext(FontSizeContext)
    if (!ctx) throw new Error('useFontSize must be used within FontSizeProvider')
    return ctx
}
