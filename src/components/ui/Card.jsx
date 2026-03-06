import { twMerge } from 'tailwind-merge';

export function Card({ className, children, ...props }) {
    return (
        <div
            className={twMerge('bg-medical-card rounded-[32px] shadow-2xl border border-white/5 relative overflow-hidden', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ title, subtitle, className }) {
    return (
        <div className={twMerge('mb-8', className)}>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white font-poppins">{title}</h3>
            {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2 italic">{subtitle}</p>}
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
