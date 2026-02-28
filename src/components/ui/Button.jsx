import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({ className, variant = 'primary', size = 'md', isLoading, children, ...props }) {
    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-dark',
        secondary: 'bg-secondary text-white hover:bg-secondary-light',
        outline: 'bg-transparent border-2 border-slate-200 text-secondary hover:bg-slate-50 hover:border-slate-300',
        ghost: 'bg-transparent text-secondary hover:bg-slate-100',
        danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={twMerge(
                'rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : children}
        </button>
    );
}
