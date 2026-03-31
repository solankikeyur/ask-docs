import { Search } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';

interface DocumentSearchProps {
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentSearch({ value, onChange }: DocumentSearchProps) {
    return (
        <div className="relative flex-1 group">
            <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors"
            />
            <Input
                className="pl-10 h-10 bg-surface-container-low border-outline-variant/10 focus:bg-surface-container transition-all"
                placeholder="Search documents by name, type, or status…"
                value={value}
                onChange={onChange}
            />
        </div>
    );
}
