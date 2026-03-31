import { Badge } from '@/components/ui/badge';

interface TableRow {
    region: string;
    value: string;
    change: string;
    confidence: 'ready' | 'processing';
}

interface ChatRevenueTableProps {
    rows: TableRow[];
}

export function ChatRevenueTable({ rows }: ChatRevenueTableProps) {
    if (!rows || rows.length === 0) {
return null;
}

    return (
        <div className="my-3 overflow-hidden rounded-[var(--radius-md)] border border-outline-variant/15">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant">
                        <th className="px-3 py-2 text-left">Entity/Region</th>
                        <th className="px-3 py-2 text-right">Value</th>
                        <th className="px-3 py-2 text-right">vs Previous</th>
                        <th className="px-3 py-2 text-right">Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className="border-t border-outline-variant/10 hover:bg-surface-container-low text-on-surface">
                            <td className="px-3 py-2 font-medium">{row.region}</td>
                            <td className="px-3 py-2 text-right">{row.value}</td>
                            <td className={`px-3 py-2 text-right ${row.change.startsWith('+') ? 'text-primary' : 'text-error'}`}>
                                {row.change}
                            </td>
                            <td className="px-3 py-2 text-right">
                                <Badge variant={row.confidence}>{row.confidence === 'ready' ? 'High' : 'Medium'}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
