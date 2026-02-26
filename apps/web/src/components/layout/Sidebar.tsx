import { NavLink } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
    Eye,
    LayoutDashboard,
    Users,
    Image as ImageIcon,
    CheckSquare,
    Building,
    CreditCard,
    Settings
} from 'lucide-react'

export function Sidebar() {
    const { user } = useAuth()
    const Shield = CheckSquare // temporary fallback

    const getLinks = () => {
        const role = user?.role
        const links = [
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['client', 'physician', 'operator', 'admin'] }
        ]

        if (role === 'client' || role === 'admin') {
            links.push({ to: '/patients', icon: Users, label: 'Patients', roles: ['client', 'admin'] })
            links.push({ to: '/uploads', icon: ImageIcon, label: 'Upload Images', roles: ['client', 'admin'] })
        }

        if (role === 'physician' || role === 'admin') {
            links.push({ to: '/readings', icon: Eye, label: 'My Readings', roles: ['physician', 'admin'] })
        }

        if (role === 'operator' || role === 'admin') {
            links.push({ to: '/ops/tasks', icon: CheckSquare, label: 'Task Board', roles: ['operator', 'admin'] })
            links.push({ to: '/ops/qc', icon: Shield, label: 'Quality Control', roles: ['operator', 'admin'] })
        }

        if (role === 'admin') {
            links.push({ to: '/admin/organizations', icon: Building, label: 'Organizations', roles: ['admin'] })
            links.push({ to: '/admin/billing', icon: CreditCard, label: 'Billing & Payments', roles: ['admin'] })
            links.push({ to: '/admin/settings', icon: Settings, label: 'Settings', roles: ['admin'] })
        }

        return links
    }

    const links = getLinks()

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800">
            <div className="flex items-center justify-center h-16 border-b border-gray-800">
                <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-wider">
                    <Eye className="w-6 h-6 text-blue-400" />
                    <span className="text-white">TF-PORTAL</span>
                </div>
            </div>

            <nav className="flex-1 py-6 px-3 space-y-1">
                {links.map((link) => {
                    const Icon = link.icon
                    return (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`
                            }
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {link.label}
                        </NavLink>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-800">
                <p className="text-xs text-center text-gray-500">v0.1.0 Enterprise</p>
            </div>
        </aside>
    )
}
