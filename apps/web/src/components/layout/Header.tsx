import { useAuth } from '../../contexts/AuthContext'
import { Bell, LogOut, User } from 'lucide-react'

export function Header() {
    const { user, logout } = useAuth()

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                    Tele-Fundus
                    {user?.role && <span className="ml-2 text-sm px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">{user.role}</span>}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
                    <Bell className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full">
                        <User className="w-4 h-4" />
                    </div>
                    <div className="hidden md:block text-sm">
                        <p className="font-medium text-gray-700">{user?.fullName || 'User'}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="p-2 ml-2 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Sign out"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    )
}
