import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LinkProp {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: LinkProp[];
}

export function Pagination({ links }: PaginationProps) {
    if (links.length <= 3) return null; // Previous, 1, Next - don't show if only one page

    return (
        <div className="flex items-center gap-1">
            {links.map((link, i) => {
                if (link.url === null) {
                    return (
                        <div
                            key={i}
                            className="flex min-w-[28px] items-center justify-center rounded px-2 py-1 text-xs text-on-surface-variant/40"
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                }

                return (
                    <Link
                        key={i}
                        href={link.url}
                        className={cn(
                            'flex min-w-[28px] items-center justify-center rounded px-2 py-1 text-xs transition-colors',
                            link.active
                                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        )}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
}
