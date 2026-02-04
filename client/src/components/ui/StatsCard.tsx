import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsCardProps {
    label: string;
    value: string;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    color?: 'brand' | 'purple' | 'emerald' | 'orange' | 'pink' | 'blue';
}

export const StatsCard: React.FC<StatsCardProps> = ({
    label,
    value,
    icon: Icon,
    trend,
    trendUp,
    color = 'brand'
}) => {
    const styles = {
        brand: { bg: "bg-brand-50", text: "text-brand-600", border: "border-brand-100", ring: "group-hover:ring-brand-100" },
        blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", ring: "group-hover:ring-blue-100" },
        purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100", ring: "group-hover:ring-purple-100" },
        emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", ring: "group-hover:ring-emerald-100" },
        orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-100", ring: "group-hover:ring-orange-100" },
        pink: { bg: "bg-pink-50", text: "text-pink-600", border: "border-pink-100", ring: "group-hover:ring-pink-100" },
    };

    const currentStyle = styles[color as keyof typeof styles] || styles.brand;

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl transition-colors", currentStyle.bg, currentStyle.text)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1",
                        trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                    )}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </span>
                )}
            </div>

            <div>
                <h3 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">{value}</h3>
                <p className="text-sm font-medium text-slate-500">{label}</p>
            </div>
        </div>
    );
};
