"use client";

import { useState, useEffect } from 'react';
import { ProspectTable } from '@/components/prospects/ProspectTable';
import { ProspectModal } from '@/components/prospects/ProspectModal';
import { Prospect } from '@/types/prospect';
import { getRecommendation } from '@/lib/logic';

export default function RecommendationsPage() {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProspect, setSelectedProspect] = useState<Prospect | undefined>();

    useEffect(() => {
        fetchProspects();
    }, []);

    useEffect(() => {
        // Filtrer uniquement les prospect en état d'alerte (délai dépassé)
        const alerts = prospects.filter(p => getRecommendation(p).status === 'ALERT');
        setFilteredProspects(alerts);
    }, [prospects]);

    async function fetchProspects() {
        setLoading(true);
        try {
            const response = await fetch('/api/prospects');
            const data = await response.json();
            if (Array.isArray(data)) {
                setProspects(data);
            }
        } catch (error) {
            console.error("Failed to fetch prospects", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (data: any) => {
        const isEdit = !!data.id;
        const url = isEdit ? `/api/prospects/${data.id}` : '/api/prospects';
        const method = isEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                fetchProspects();
            }
        } catch (error) {
            console.error("Failed to save prospect", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce prospect ?')) return;

        try {
            const response = await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchProspects();
            }
        } catch (error) {
            console.error("Failed to delete prospect", error);
        }
    };

    const handleInlineUpdate = async (id: string, updates: Partial<Prospect>) => {
        try {
            const response = await fetch(`/api/prospects/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (response.ok) {
                const updated = await response.json();
                setProspects(prev => prev.map(p => p.id === id ? updated : p));
            }
        } catch (error) {
            console.error("Failed to update prospect", error);
        }
    };

    if (loading && prospects.length === 0) {
        return <div className="flex h-96 items-center justify-center">Chargement...</div>;
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-primary">Recommandations</h1>
                <p className="text-muted-foreground">Voici les prospects dont le délai d'attente est dépassé. Une action de relance est requise.</p>
            </div>

            {filteredProspects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-border">
                    <div className="text-4xl mb-4">🎉</div>
                    <h3 className="text-lg font-bold text-primary">Tout est à jour !</h3>
                    <p className="text-muted-foreground text-center mt-2 max-w-sm">
                        Aucun prospect ne nécessite de relance pour le moment. Vos objectifs de temps sont parfaitement respectés.
                    </p>
                </div>
            ) : (
                <ProspectTable
                    prospects={filteredProspects}
                    onEdit={(p) => { setSelectedProspect(p); setIsModalOpen(true); }}
                    onDelete={handleDelete}
                    onUpdateStep={(id, step) => handleInlineUpdate(id, { etape: step })}
                    onUpdateFields={(id, updates) => handleInlineUpdate(id, updates)}
                />
            )}

            <ProspectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                prospect={selectedProspect}
            />
        </div>
    );
}
