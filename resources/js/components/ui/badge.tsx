import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.05em] transition-colors',
    {
        variants: {
            variant: {
                processing:
                    'bg-tertiary-container text-on-tertiary-container',
                ready:
                    'bg-primary-container text-on-primary-container',
                failed:
                    'bg-error-container text-on-error-container',
                secondary:
                    'bg-secondary-container text-on-secondary-container',
                outline:
                    'border-ghost text-on-surface-variant',
            },
        },
        defaultVariants: {
            variant: 'ready',
        },
    },
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
