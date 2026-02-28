import { twMerge } from 'tailwind-merge';

export function Badge({ children, variant = 'gray', className }) {
    const variants = {
        gray: 'bg-slate-800 text-white opacity-80',
        primary: 'bg-primary/20 text-primary',
        success: 'bg-green-500/20 text-green-400',
        warning: 'bg-yellow-500/20 text-yellow-400',
        danger: 'bg-red-500/20 text-red-400',
    };

    return (
        <span className={twMerge('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', variants[variant], className)}>
            {children}
        </span>
    );
}
