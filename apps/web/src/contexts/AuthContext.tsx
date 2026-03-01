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

// Demo accounts matching seed data — used when API backend is unavailable
const DEMO_USERS: Record<string, UserInfo> = {
    'admin@retinainsight.jp': {
        id: 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        fullName: 'System Administrator',
        email: 'admin@retinainsight.jp',
        role: 'admin',
        adminLevel: 'super_admin',
        organizationId: null,
        physicianId: null,
        permissions: ['dashboard.view', 'screening.create', 'screening.view_all', 'screening.edit', 'screening.delete', 'reading.create', 'reading.submit', 'reading.qc', 'reading.reassign', 'image.upload', 'image.view', 'image.delete', 'image.annotate', 'user.view', 'user.create', 'user.edit', 'user.deactivate', 'user.manage_admins', 'role.view', 'role.manage', 'permission.manage', 'organization.view', 'organization.manage', 'billing.view', 'billing.manage', 'settings.view', 'settings.manage', 'brand.manage'],
    },
    'operator@retinainsight.jp': {
        id: 'bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        fullName: 'オペレーター 山口',
        email: 'operator@retinainsight.jp',
        role: 'operator',
        adminLevel: 'standard',
        organizationId: null,
        physicianId: null,
        permissions: ['dashboard.view', 'screening.view_all', 'screening.edit', 'reading.qc', 'reading.reassign', 'image.view', 'image.annotate', 'user.view'],
    },
    'dr.tanaka@retinainsight.jp': {
        id: 'bbbb3333-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        fullName: 'Dr. 田中 康夫',
        email: 'dr.tanaka@retinainsight.jp',
        role: 'physician',
        adminLevel: 'standard',
        organizationId: null,
        physicianId: 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        permissions: ['dashboard.view', 'screening.view_all', 'reading.create', 'reading.submit', 'image.view', 'image.annotate'],
    },
    'client@sakura-hospital.jp': {
        id: 'bbbb4444-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        fullName: '小林 直樹',
        email: 'client@sakura-hospital.jp',
        role: 'client',
        adminLevel: 'standard',
        organizationId: '11111111-1111-1111-1111-111111111111',
        physicianId: null,
        permissions: ['dashboard.view', 'screening.create', 'screening.view_own', 'image.upload', 'image.view'],
    },
}

const DEMO_SESSION_KEY = 'demo_user_email'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserInfo | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const checkAuth = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/auth/me')
            setUser(res.data.user)
        } catch {
            // Check for demo session
            const demoEmail = localStorage.getItem(DEMO_SESSION_KEY)
            if (demoEmail && DEMO_USERS[demoEmail]) {
                setUser(DEMO_USERS[demoEmail])
            } else {
                setUser(null)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const login = async (email: string, password: string) => {
        try {
            const res = await api.post('/auth/login', { email, password })
            if (res.data.success) {
                setUser(res.data.user)
                localStorage.removeItem(DEMO_SESSION_KEY)
                return
            }
        } catch {
            // API unavailable — try demo login
            const demoUser = DEMO_USERS[email]
            if (demoUser) {
                localStorage.setItem(DEMO_SESSION_KEY, email)
                setUser(demoUser)
                return
            }
            throw new Error('Invalid email or password')
        }
    }

    const logout = async () => {
        try {
            await api.post('/auth/logout')
        } catch { /* ignore */ }
        localStorage.removeItem(DEMO_SESSION_KEY)
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

