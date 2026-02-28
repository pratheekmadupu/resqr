import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={twMerge('bg-slate-900 rounded-2xl shadow-xl border border-slate-800 p-6', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, className }) {
    return (
        <div className={twMerge('mb-6', className)}>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
    );
}

export function CardContent({ children, className }) {
    return (
        <div className={className}>
            {children}
        </div>
    );
}
