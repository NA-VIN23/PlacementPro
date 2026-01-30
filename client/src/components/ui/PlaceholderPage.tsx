import React from 'react';
import { PageHeader } from './PageHeader';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
    title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
    return (
        <div>
            <PageHeader title={title} />
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-100 border-dashed min-h-[400px]">
                <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
                    <Construction className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700">Under Development</h3>
                <p className="text-slate-500 mt-2 max-w-md text-center">
                    This feature ({title}) is currently being built. Check back soon for updates.
                </p>
            </div>
        </div>
    );
};
