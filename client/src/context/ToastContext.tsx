import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import { cn } from '../utils/cn';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration?: number;
}

interface ToastContextType {
    addToast: (type: ToastType, message: string, duration?: number) => void;
    success: (message: string, duration?: number) => void;
    error: (message: string, duration?: number) => void;
    warning: (message: string, duration?: number) => void;
    info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts(prev => [...prev, { id, type, message, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = (msg: string, dur?: number) => addToast('success', msg, dur);
    const error = (msg: string, dur?: number) => addToast('error', msg, dur);
    const warning = (msg: string, dur?: number) => addToast('warning', msg, dur);
    const info = (msg: string, dur?: number) => addToast('info', msg, dur);

    return (
        <ToastContext.Provider value={{ addToast, success, error, warning, info }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={cn(
                            "pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-lg border animate-slide-up transition-all",
                            toast.type === 'success' && "bg-white border-green-100 text-slate-800 shadow-green-500/10",
                            toast.type === 'error' && "bg-red-50 border-red-100 text-red-900 shadow-red-500/10",
                            toast.type === 'warning' && "bg-orange-50 border-orange-100 text-orange-900 shadow-orange-500/10",
                            toast.type === 'info' && "bg-blue-50 border-blue-100 text-blue-900 shadow-blue-500/10"
                        )}
                    >
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                            toast.type === 'success' && "bg-green-100 text-green-600",
                            toast.type === 'error' && "bg-red-100 text-red-600",
                            toast.type === 'warning' && "bg-orange-100 text-orange-600",
                            toast.type === 'info' && "bg-blue-100 text-blue-600"
                        )}>
                            {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            {toast.type === 'error' && <AlertOctagon className="w-5 h-5" />}
                            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                            {toast.type === 'info' && <Info className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 text-sm font-medium">{toast.message}</div>
                        <button onClick={() => removeToast(toast.id)} className="opacity-50 hover:opacity-100 p-1">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};
