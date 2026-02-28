import { twMerge } from 'tailwind-merge';

export function Input({ label, error, className, ...props }) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-white mb-1.5 opacity-90">
                    {label}
                </label>
            )}
            <input
                className={twMerge(
                    'w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-slate-500 text-white',
                    error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
}

export function Select({ label, error, options = [], className, ...props }) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-white mb-1.5 opacity-90">
                    {label}
                </label>
            )}
            <select
                className={twMerge(
                    'w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-white',
                    error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                    className
                )}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
}
