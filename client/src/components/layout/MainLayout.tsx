import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#fafafa] flex font-sans">
            <Sidebar />
            <main className="flex-1 ml-72 p-8 lg:p-12 overflow-y-auto h-screen scroll-smooth">
                <div className="max-w-6xl mx-auto animate-slide-up">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
