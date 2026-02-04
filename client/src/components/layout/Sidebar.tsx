import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, UserCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { STUDENT_NAV, STAFF_NAV, ADMIN_NAV } from '../../constants/navigation';
import { cn } from '../../utils/cn';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();

    if (!user) return null;

    let navItems: any[] = [];
    let roleColor = "";

    switch (user.role) {
        case 'STUDENT':
            navItems = STUDENT_NAV;
            roleColor = "text-blue-600 bg-blue-50";
            break;
        case 'STAFF':
            navItems = STAFF_NAV;
            roleColor = "text-indigo-600 bg-indigo-50";
            break;
        case 'ADMIN':
            navItems = ADMIN_NAV;
            roleColor = "text-blue-900 bg-blue-50";
            break;
        default:
            navItems = [];
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "w-72 bg-white h-screen border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand Header */}
                <div className="p-8 pb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            className="w-10 h-10 object-contain"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PlacementPrePro</h1>
                            <p className="text-xs text-slate-500 font-medium">Career Excellence</p>
                        </div>
                    </div>
                    {/* Close Button for Mobile */}
                    <button
                        onClick={onClose}
                        className="md:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* User Card */}
                <div className="px-8 mb-6">
                    <NavLink
                        to={`/${user.role.toLowerCase()}/profile`}
                        onClick={() => window.innerWidth < 768 && onClose()}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3 relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all cursor-pointer"
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 border-2 border-white shadow-sm">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className={cn("text-[10px] font-bold tracking-wider uppercase mb-0.5", roleColor.replace('bg-', 'text-'))}>
                                {user.role}
                            </p>
                            <p className="font-bold text-slate-800 text-sm truncate uppercase tracking-tight">
                                {user.name}
                            </p>
                            {user.role === 'STUDENT' && (user as any).rollNumber && (
                                <p className="text-[10px] text-slate-400 font-medium font-mono mt-0.5">
                                    {(user as any).rollNumber}
                                </p>
                            )}
                        </div>
                    </NavLink>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">Menu</p>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => window.innerWidth < 768 && onClose()}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                        isActive
                                            ? "text-blue-600 font-bold bg-blue-50"
                                            : "text-slate-500 font-medium hover:text-slate-900 hover:bg-slate-50"
                                    )
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                        <span className="flex-1">{item.label}</span>
                                        {isActive && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-4"></div>
                                        )}
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold group"
                    >
                        <LogOut className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>
        </>
    );
};
