"use client";

import { Prospect, ProspectStep } from '@/types/prospect';
import { getRecommendation, STEPS, STEP_ACTION_MAPPING } from '@/lib/logic';
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
    onUpdateFields: (id: string, updates: Partial<Prospect>) => void;
}

export function ProspectTable({
    prospects,
    onEdit,
    onDelete,
    onUpdateStep,
    onUpdateFields
}: ProspectTableProps) {
    return (
        <>
            {/* Desktop View */}
            <div className="hidden lg:block w-full overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
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
                                        <div className="flex items-center space-x-6">
                                            {(() => {
                                                const actionDef = STEP_ACTION_MAPPING[p.etape];
                                                if (!actionDef) return null;

                                                const handleTriggerChange = (isChecked: boolean) => {
                                                    const updates: Partial<Prospect> = { [actionDef.triggerKey]: isChecked };
                                                    if (isChecked && !p.timer_started_at) {
                                                        updates.timer_started_at = new Date().toISOString();
                                                    } else if (!isChecked) {
                                                        updates.timer_started_at = null;
                                                    }
                                                    onUpdateFields(p.id, updates);
                                                };

                                                const handleGoalNumberChange = (valStr: string) => {
                                                    const val = parseInt(valStr) || 0;
                                                    onUpdateFields(p.id, { [actionDef.goalKey]: val });
                                                };

                                                return (
                                                    <>
                                                        {/* Trigger Action */}
                                                        <div className="flex items-center space-x-2 border-r border-border pr-4">
                                                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Déclencheur</span>
                                                            {actionDef.triggerType === 'boolean' ? (
                                                                <Tooltip label={actionDef.triggerLabel}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!p[actionDef.triggerKey]}
                                                                        onChange={(e) => handleTriggerChange(e.target.checked)}
                                                                        className="h-4 w-4 rounded border-input"
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <div className="flex items-center space-x-1">
                                                                    <Tooltip label={actionDef.triggerLabel}>
                                                                        <span className="text-xs">{actionDef.triggerLabel}:</span>
                                                                    </Tooltip>
                                                                    <span className="text-primary font-medium">{String(p[actionDef.triggerKey] || 0)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Goal Action */}
                                                        <div className="flex items-center space-x-2 pl-2">
                                                            <span className="text-[10px] uppercase text-muted-foreground font-semibold">Cible</span>
                                                            {actionDef.goalType === 'boolean' ? (
                                                                <Tooltip label={actionDef.goalLabel}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!p[actionDef.goalKey]}
                                                                        onChange={(e) => onUpdateFields(p.id, { [actionDef.goalKey]: e.target.checked })}
                                                                        className="h-4 w-4 rounded border-input"
                                                                    />
                                                                </Tooltip>
                                                            ) : (
                                                                <div className="flex items-center space-x-1">
                                                                    <Tooltip label={actionDef.goalLabel}>
                                                                        <input
                                                                            type="number"
                                                                            value={(p[actionDef.goalKey] as number) || 0}
                                                                            onChange={(e) => handleGoalNumberChange(e.target.value)}
                                                                            className="w-16 bg-transparent border-b border-input focus:border-primary focus:ring-0 text-primary px-1 py-0.5 text-xs inline-block"
                                                                        />
                                                                    </Tooltip>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                );
                                            })()}
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
                                                    recommendation.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
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

            {/* Mobile View */}
            <div className="flex lg:hidden flex-col gap-4">
                {prospects.map((p) => {
                    const recommendation = getRecommendation(p);
                    const actionDef = STEP_ACTION_MAPPING[p.etape];

                    const handleTriggerChange = (isChecked: boolean) => {
                        const updates: Partial<Prospect> = { [actionDef?.triggerKey as any]: isChecked };
                        if (isChecked && !p.timer_started_at) {
                            updates.timer_started_at = new Date().toISOString();
                        } else if (!isChecked) {
                            updates.timer_started_at = null;
                        }
                        onUpdateFields(p.id, updates);
                    };

                    const handleGoalNumberChange = (valStr: string) => {
                        const val = parseInt(valStr) || 0;
                        onUpdateFields(p.id, { [actionDef?.goalKey as any]: val });
                    };

                    return (
                        <div key={`mobile-${p.id}`} className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-primary text-base">{p.nom}</h3>
                                    <p className="text-xs font-mono text-muted-foreground">{p.code}</p>
                                </div>
                                <div className="flex space-x-1">
                                    <button onClick={() => onEdit(p)} className="p-2 text-muted-foreground hover:bg-secondary transition-colors rounded-md">
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => onDelete(p.id)} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                                <span className="text-muted-foreground font-medium">Étape</span>
                                <select
                                    className="bg-secondary border-none rounded py-1 px-2 text-xs font-medium focus:ring-1 focus:ring-ring"
                                    value={p.etape}
                                    onChange={(e) => onUpdateStep(p.id, e.target.value as ProspectStep)}
                                >
                                    {STEPS.map(step => <option key={step} value={step}>{step}</option>)}
                                </select>
                            </div>

                            {/* Actions Trigger/Goal Mobile */}
                            {actionDef && (
                                <div className="bg-muted/30 rounded-lg p-3 flex flex-col space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-xs uppercase text-muted-foreground font-semibold line-clamp-1 mr-2">{actionDef.triggerLabel}</span>
                                        {actionDef.triggerType === 'boolean' ? (
                                            <input type="checkbox" checked={!!p[actionDef.triggerKey]} onChange={(e) => handleTriggerChange(e.target.checked)} className="h-5 w-5 rounded border-input flex-shrink-0" />
                                        ) : (
                                            <span className="text-primary font-bold flex-shrink-0">{String(p[actionDef.triggerKey] || 0)}</span>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-border pt-3">
                                        <span className="text-xs uppercase text-muted-foreground font-semibold line-clamp-1 mr-2">{actionDef.goalLabel}</span>
                                        {actionDef.goalType === 'boolean' ? (
                                            <input type="checkbox" checked={!!p[actionDef.goalKey]} onChange={(e) => onUpdateFields(p.id, { [actionDef.goalKey]: e.target.checked })} className="h-5 w-5 rounded border-input flex-shrink-0" />
                                        ) : (
                                            <input type="number" value={(p[actionDef.goalKey] as number) || 0} onChange={(e) => handleGoalNumberChange(e.target.value)} className="w-16 bg-background border border-input flex-shrink-0 rounded focus:border-primary focus:ring-0 text-primary px-2 py-1 text-sm text-center" />
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col space-y-3 pt-3 border-t border-border">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground font-medium">Score d'engagement</span>
                                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold", p.score >= 80 ? "bg-status-success/20 text-status-success" : p.score >= 50 ? "bg-blue-500/20 text-blue-500" : "bg-status-waiting/20 text-status-waiting")}>{p.score} / 100</span>
                                </div>
                                <div className="w-full">
                                    <span className={cn("flex items-center justify-center w-full rounded-md px-2 py-2 text-[11px] font-medium border text-center", recommendation.status === 'SUCCESS' ? "bg-status-success/10 text-status-success border-status-success/20" : recommendation.status === 'ALERT' ? "bg-status-alert/10 text-status-alert border-status-alert/20" : recommendation.status === 'IN_PROGRESS' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-status-waiting/10 text-status-waiting border-status-waiting/20")}>{recommendation.text}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
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
