"use client";

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Prospect, ProspectInsert, ProspectStep } from '@/types/prospect';
import { STEPS, STEP_ACTION_MAPPING } from '@/lib/logic';

interface ProspectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prospect: ProspectInsert | (Partial<Prospect> & { id: string })) => Promise<void>;
    prospect?: Prospect;
}

export function ProspectModal({ isOpen, onClose, onSave, prospect }: ProspectModalProps) {
    const [formData, setFormData] = useState<ProspectInsert>({
        code: '',
        nom: '',
        etape: 'Prospection',
        action_effectuee: false,
        lien_clique: false,
        inscrit: false,
        boutique_configuree: false,
        nombre_produits: 0,
        lien_partage: false,
        nombre_commandes: 0,
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (prospect) {
            setFormData({
                code: prospect.code,
                nom: prospect.nom,
                etape: prospect.etape,
                action_effectuee: prospect.action_effectuee,
                lien_clique: prospect.lien_clique,
                inscrit: prospect.inscrit,
                boutique_configuree: prospect.boutique_configuree,
                nombre_produits: prospect.nombre_produits,
                lien_partage: prospect.lien_partage,
                nombre_commandes: prospect.nombre_commandes,
            });
        } else {
            setFormData({
                code: '',
                nom: '',
                etape: 'Prospection',
                action_effectuee: false,
                lien_clique: false,
                inscrit: false,
                boutique_configuree: false,
                nombre_produits: 0,
                lien_partage: false,
                nombre_commandes: 0,
            });
        }
    }, [prospect, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(prospect ? { ...formData, id: prospect.id } : formData);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-primary">
                        {prospect ? 'Modifier le Prospect' : 'Ajouter un Prospect'}
                    </h2>
                    <button onClick={onClose} className="text-muted-foreground hover:text-primary">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Code</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Nom</label>
                            <input
                                type="text"
                                required
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Étape Actuelle</label>
                            <select
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                value={formData.etape}
                                onChange={(e) => setFormData({ ...formData, etape: e.target.value as ProspectStep })}
                            >
                                {STEPS.map(step => <option key={step} value={step}>{step}</option>)}
                            </select>
                        </div>
                        {(() => {
                            const actionDef = STEP_ACTION_MAPPING[formData.etape];
                            if (!actionDef) return null;

                            return (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-muted-foreground">{actionDef.label}</label>
                                    <div className="flex h-10 items-center">
                                        {actionDef.type === 'boolean' ? (
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-input"
                                                checked={!!(formData as any)[actionDef.key]}
                                                onChange={(e) => setFormData({ ...formData, [actionDef.key]: e.target.checked })}
                                            />
                                        ) : (
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                                                value={(formData as any)[actionDef.key] || 0}
                                                onChange={(e) => setFormData({ ...formData, [actionDef.key]: parseInt(e.target.value) || 0 })}
                                            />
                                        )}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="mt-8 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
