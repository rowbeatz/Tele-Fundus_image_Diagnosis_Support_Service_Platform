import React, { createContext, useContext, useState, useCallback } from 'react'

interface BrandConfig {
    logoUrl: string
    platformName: string
    tagline: string
}

const DEFAULT_BRAND: BrandConfig = {
    logoUrl: '/brand/logo.png',
    platformName: 'RetinaInsight',
    tagline: 'Precision in Every Pixel.',
}

interface BrandContextType {
    brand: BrandConfig
    updateBrand: (partial: Partial<BrandConfig>) => void
    resetBrand: () => void
}

const BrandContext = createContext<BrandContextType | undefined>(undefined)

export function BrandProvider({ children }: { children: React.ReactNode }) {
    const [brand, setBrand] = useState<BrandConfig>(() => {
        try {
            const stored = localStorage.getItem('ri-brand')
            if (stored) return { ...DEFAULT_BRAND, ...JSON.parse(stored) }
        } catch { }
        return DEFAULT_BRAND
    })

    const updateBrand = useCallback((partial: Partial<BrandConfig>) => {
        setBrand(prev => {
            const next = { ...prev, ...partial }
            localStorage.setItem('ri-brand', JSON.stringify(next))
            return next
        })
    }, [])

    const resetBrand = useCallback(() => {
        setBrand(DEFAULT_BRAND)
        localStorage.removeItem('ri-brand')
    }, [])

    return (
        <BrandContext.Provider value={{ brand, updateBrand, resetBrand }}>
            {children}
        </BrandContext.Provider>
    )
}

export function useBrand() {
    const ctx = useContext(BrandContext)
    if (!ctx) throw new Error('useBrand must be used within BrandProvider')
    return ctx
}
