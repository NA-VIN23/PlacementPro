import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
    preventClose?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className,
    showCloseButton = true,
    preventClose = false
}) => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (!preventClose && onClose && e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={handleBackdropClick}
        >
            <div
                ref={modalRef}
                className={cn(
                    "bg-white rounded-3xl shadow-2xl w-full max-w-lg relative animate-scale-up border border-slate-100",
                    className
                )}
            >
                {(title || (showCloseButton && !preventClose)) && (
                    <div className="flex items-center justify-between p-6 border-b border-slate-100">
                        {title && <h3 className="text-xl font-bold text-slate-800">{title}</h3>}
                        {showCloseButton && !preventClose && onClose && (
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
