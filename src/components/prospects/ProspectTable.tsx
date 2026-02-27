"use client";

import { Prospect, ProspectStep } from '@/types/prospect';
import { getRecommendation, STEPS } from '@/lib/logic';
import { Edit2, Trash2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProspectTableProps {
    prospects: Prospect[];
    onEdit: (prospect: Prospect) => void;
    onDelete: (id: string) => void;
    onUpdateStep: (id: string, step: ProspectStep) => void;
    onToggleBool: (id: string, field: keyof Prospect, value: boolean) => void;
    onUpdateNumber: (id: string, field: keyof Prospect, value: number) => void;
}

export function ProspectTable({
    prospects,
    onEdit,
    onDelete,
    onUpdateStep,
    onToggleBool,
    onUpdateNumber
}: ProspectTableProps) {
    return (
        <div className="w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/50 text-muted-foreground">
                    <tr>
                        <th className="px-4 py-3 font-medium">Code</th>
                        <th className="px-4 py-3 font-medium">Nom</th>
                        <th className="px-4 py-3 font-medium">Étape</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                        <th className="px-4 py-3 font-medium text-center">Score</th>
                        <th className="px-4 py-3 font-medium">Recommandation</th>
                        <th className="px-4 py-3 font-medium text-right">Options</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {prospects.map((p) => {
                        const recommendation = getRecommendation(p);
                        return (
                            <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-4 font-mono font-medium text-primary">{p.code}</td>
                                <td className="px-4 py-4 font-medium text-primary">{p.nom}</td>
                                <td className="px-4 py-4">
                                    <select
                                        className="bg-transparent border-none p-0 focus:ring-0 text-sm cursor-pointer hover:underline"
                                        value={p.etape}
                                        onChange={(e) => onUpdateStep(p.id, e.target.value as ProspectStep)}
                                    >
                                        {STEPS.map(step => <option key={step} value={step}>{step}</option>)}
                                    </select>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex items-center space-x-4">
                                        <Tooltip label="Clic Link">
                                            <input
                                                type="checkbox"
                                                checked={p.lien_clique}
                                                onChange={(e) => onToggleBool(p.id, 'lien_clique', e.target.checked)}
                                                className="h-4 w-4 rounded border-input"
                                            />
                                        </Tooltip>
                                        <Tooltip label="Inscrit">
                                            <input
                                                type="checkbox"
                                                checked={p.inscrit}
                                                onChange={(e) => onToggleBool(p.id, 'inscrit', e.target.checked)}
                                                className="h-4 w-4 rounded border-input"
                                            />
                                        </Tooltip>
                                        <Tooltip label="Shop Conf">
                                            <input
                                                type="checkbox"
                                                checked={p.boutique_configuree}
                                                onChange={(e) => onToggleBool(p.id, 'boutique_configuree', e.target.checked)}
                                                className="h-4 w-4 rounded border-input"
                                            />
                                        </Tooltip>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-[10px] text-muted-foreground uppercase">Prod</span>
                                            <input
                                                type="number"
                                                value={p.nombre_produits}
                                                onChange={(e) => onUpdateNumber(p.id, 'nombre_produits', parseInt(e.target.value) || 0)}
                                                className="w-12 bg-transparent text-xs border-none focus:ring-0 p-0 text-primary"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className={cn(
                                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold",
                                        p.score >= 80 ? "bg-status-success/20 text-status-success" :
                                            p.score >= 50 ? "bg-blue-500/20 text-blue-500" :
                                                "bg-status-waiting/20 text-status-waiting"
                                    )}>
                                        {p.score}
                                    </span>
                                </td>
                                <td className="px-4 py-4">
                                    <span className={cn(
                                        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium border",
                                        recommendation.status === 'SUCCESS' ? "bg-status-success/10 text-status-success border-status-success/20" :
                                            recommendation.status === 'ALERT' ? "bg-status-alert/10 text-status-alert border-status-alert/20" :
                                                "bg-status-waiting/10 text-status-waiting border-status-waiting/20"
                                    )}>
                                        {recommendation.text}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => onEdit(p)}
                                            className="p-1 text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(p.id)}
                                            className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function Tooltip({ children, label }: { children: React.ReactNode, label: string }) {
    return (
        <div className="group relative flex items-center">
            {children}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max rounded bg-primary px-2 py-1 text-[10px] text-primary-foreground shadow-sm">
                {label}
            </span>
        </div>
    );
}
