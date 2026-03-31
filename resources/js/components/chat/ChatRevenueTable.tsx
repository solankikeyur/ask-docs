import { Badge } from '@/components/ui/badge';

export function ChatRevenueTable() {
    return (
        <div className="my-3 overflow-hidden rounded-[var(--radius-md)] border border-outline-variant/15">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-surface-container-low text-on-surface-variant">
                        <th className="px-3 py-2 text-left">Region</th>
                        <th className="px-3 py-2 text-right">Q4 Projection</th>
                        <th className="px-3 py-2 text-right">vs Q3</th>
                        <th className="px-3 py-2 text-right">Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    {[
                        { region: 'North America', q4: '$142.8M', change: '+8.4%', conf: 'ready' as const },
                        { region: 'EMEA', q4: '$98.3M', change: '+3.1%', conf: 'processing' as const },
                    ].map((row) => (
                        <tr key={row.region} className="border-t border-outline-variant/10 hover:bg-surface-container-low">
                            <td className="px-3 py-2 font-medium text-on-surface">{row.region}</td>
                            <td className="px-3 py-2 text-right text-on-surface">{row.q4}</td>
                            <td className="px-3 py-2 text-right text-primary">{row.change}</td>
                            <td className="px-3 py-2 text-right">
                                <Badge variant={row.conf}>{row.conf === 'ready' ? 'High' : 'Medium'}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
