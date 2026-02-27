import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 flex items-baseline space-x-2">
                <h3 className="text-2xl font-bold tracking-tight text-primary">{value}</h3>
                {trend && (
                    <span className={`text-xs font-medium ${trend.isUp ? 'text-status-success' : 'text-status-alert'}`}>
                        {trend.isUp ? '+' : '-'}{trend.value}%
                    </span>
                )}
            </div>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
            )}
        </div>
    );
}
