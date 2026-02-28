import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-secondary/40 backdrop-blur-sm"
                />

                {/* Modal content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800"
                >
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <h3 className="text-xl font-bold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-white/50 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
