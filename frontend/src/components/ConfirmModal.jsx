import React from 'react';
import { X, AlertTriangle, HelpCircle } from 'lucide-react';

/**
 * General purpose confirm modal.
 * Props:
 *   isOpen, onClose, onConfirm, title, message,
 *   confirmText, cancelText, variant ('danger' | 'warning' | 'info'), loading
 */
const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Bạn có chắc chắn?',
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'danger',
    loading = false,
}) => {
    if (!isOpen) return null;

    const headerGradient = {
        danger: 'from-red-500 to-red-600',
        warning: 'from-amber-500 to-orange-500',
        info: 'from-blue-500 to-blue-600',
    }[variant] || 'from-red-500 to-red-600';

    const confirmBtnClass = {
        danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
        warning: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
        info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    }[variant] || 'bg-red-600 hover:bg-red-700 focus:ring-red-500';

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={!loading ? onClose : undefined}
            />
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
                {/* Header */}
                <div className={`relative p-5 bg-gradient-to-br ${headerGradient} overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mt-14" />
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mb-10" />
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-lg font-bold text-white">{title}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="p-1.5 hover:bg-white/20 rounded-lg transition-all group"
                        >
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200" />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6">
                    {message && (
                        <p className="text-slate-600 leading-relaxed mb-6">{message}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 ${confirmBtnClass}`}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Đang xử lý...
                                </span>
                            ) : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
