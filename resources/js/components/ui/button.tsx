import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*="size-"])]:size-4 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    {
        variants: {
            variant: {
                default:
                    'bg-primary-gradient text-primary-foreground shadow-ambient hover:opacity-90 active:scale-[0.98]',
                secondary:
                    'bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim dark:bg-primary-container dark:text-on-primary-container',
                ghost:
                    'bg-transparent text-on-surface-variant hover:bg-surface-container-low dark:hover:bg-surface-container',
                outline:
                    'border-ghost bg-transparent text-on-surface-variant hover:bg-surface-container-low',
                destructive:
                    'bg-error text-on-error hover:opacity-90',
                link:
                    'text-primary underline-offset-4 hover:underline p-0 h-auto',
            },
            size: {
                default: 'h-10 px-5 py-2.5 rounded-[var(--radius-md)]',
                sm:      'h-8 px-3.5 py-1.5 text-xs rounded-[var(--radius-md)]',
                lg:      'h-12 px-7 py-3 text-base rounded-[var(--radius-lg)]',
                icon:    'h-10 w-10 rounded-[var(--radius-md)]',
                'icon-sm': 'h-8 w-8 rounded-[var(--radius-sm)]',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
