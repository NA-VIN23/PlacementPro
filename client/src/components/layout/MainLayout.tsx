import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { cn } from '../../utils/cn';

export const MainLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#fafafa] font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-30 shadow-sm">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                    <span className="font-bold text-slate-800">PlacementPrePro</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className={cn(
                "flex-1 p-4 pt-20 md:p-8 lg:p-12 md:pt-12 overflow-y-auto h-screen scroll-smooth",
                "md:ml-72 transition-all duration-300"
            )}>
                <div className="max-w-6xl mx-auto animate-slide-up">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
