import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'gray', className }) {
    const variants = {
        gray: 'bg-slate-900 text-slate-400 border-white/5',
        primary: 'bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(230,57,70,0.1)]',
        success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        warning: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        danger: 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
    };

    return (
        <span className={twMerge(
            'inline-flex items-center px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest italic transition-all',
            variants[variant],
            className
        )}>
            <span className="relative flex items-center gap-1.5">
                {variant !== 'gray' && <span className="w-1 h-1 rounded-full bg-current animate-pulse" />}
                {children}
            </span>
        </span>
    );
}
