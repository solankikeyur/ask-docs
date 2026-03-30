import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    'flex h-10 w-full rounded-[var(--radius-lg)] border-ghost bg-surface-container-lowest px-4 py-2 text-sm text-on-surface transition-all duration-200',
                    'placeholder:text-on-surface-variant/50',
                    'focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/30',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'dark:bg-surface-container dark:text-on-surface',
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = 'Input';

export { Input };
