import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'

type UserInfo = {
    id: string
    fullName: string
    email: string
    role: string
    adminLevel: string
    organizationId?: string | null
    physicianId?: string | null
    permissions: string[]
}

interface AuthContextType {
    user: UserInfo | null
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    hasPermission: (key: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkAuth = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/auth/me')
            setUser(res.data.user)
        } catch {
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        const res = await api.post('/auth/login', { email, password })
        if (res.data.success) {
            setUser(res.data.user)
        }
    }

    const logout = async () => {
        await api.post('/auth/logout')
        setUser(null)
    }

    const hasPermission = useCallback((key: string): boolean => {
        if (!user) return false
        // Super admin has all permissions
        if (user.adminLevel === 'super_admin') return true
        return user.permissions?.includes(key) ?? false
    }, [user])

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth, hasPermission }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
