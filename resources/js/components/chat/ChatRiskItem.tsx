import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

export type RiskIcon = 'warn' | 'alert' | 'info';

const riskIcons: Record<RiskIcon, LucideIcon> = {
    warn: AlertTriangle,
    alert: AlertCircle,
    info: Info,
};

const riskColors: Record<RiskIcon, string> = {
    warn: 'bg-error-container text-on-error-container',
    alert: 'text-on-tertiary-container bg-tertiary-container',
    info: 'text-primary bg-primary-container',
};

interface ChatRiskItemProps {
    icon: RiskIcon;
    text: string;
}

export function ChatRiskItem({ icon, text }: ChatRiskItemProps) {
    const Icon = riskIcons[icon];

    return (
        <div className={`mb-2 flex items-start gap-2.5 rounded-[var(--radius-md)] p-2.5 text-xs ${riskColors[icon]}`}>
            <Icon size={13} className="mt-0.5 shrink-0" />
            <span>{text}</span>
        </div>
    );
}
