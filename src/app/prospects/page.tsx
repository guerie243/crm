"use client";

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle } from 'lucide-react';
import { ProspectTable } from '@/components/prospects/ProspectTable';
import { ProspectModal } from '@/components/prospects/ProspectModal';
import { Prospect, ProspectStep } from '@/types/prospect';
import { getRecommendation, STEPS } from '@/lib/logic';

export default function ProspectsPage() {
    const [prospects, setProspects] = useState<Prospect[]>([]);
    const [filteredProspects, setFilteredProspects] = useState<Prospect[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProspect, setSelectedProspect] = useState<Prospect | undefined>();

    // Filters
    const [search, setSearch] = useState('');
    const [stepFilter, setStepFilter] = useState<ProspectStep | 'All'>('All');
    const [alertFilter, setAlertFilter] = useState(false);

    useEffect(() => {
        fetchProspects();
    }, []);

    useEffect(() => {
        let result = prospects;

        if (search) {
            result = result.filter(p =>
                p.nom.toLowerCase().includes(search.toLowerCase()) ||
                p.code.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (stepFilter !== 'All') {
            result = result.filter(p => p.etape === stepFilter);
        }

        if (alertFilter) {
            result = result.filter(p => getRecommendation(p).status === 'ALERT');
        }

        setFilteredProspects(result);
    }, [search, stepFilter, alertFilter, prospects]);

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
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Prospects</h1>
                    <p className="text-muted-foreground">Gérez votre liste de prospects et suivez leur progression.</p>
                </div>
                <button
                    onClick={() => { setSelectedProspect(undefined); setIsModalOpen(true); }}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 shadow-sm transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter Prospect
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou code..."
                        className="w-full bg-background border border-input rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <select
                        className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        value={stepFilter}
                        onChange={(e) => setStepFilter(e.target.value as any)}
                    >
                        <option value="All">Toutes les étapes</option>
                        {STEPS.map(step => <option key={step} value={step}>{step}</option>)}
                    </select>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`p-2 rounded-md transition-colors ${alertFilter ? 'bg-status-alert/20 text-status-alert' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'}`}>
                        <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Alertes uniquement</span>
                    <input
                        type="checkbox"
                        className="hidden"
                        checked={alertFilter}
                        onChange={(e) => setAlertFilter(e.target.checked)}
                    />
                </label>
            </div>

            <ProspectTable
                prospects={filteredProspects}
                onEdit={(p) => { setSelectedProspect(p); setIsModalOpen(true); }}
                onDelete={handleDelete}
                onUpdateStep={(id, step) => handleInlineUpdate(id, { etape: step })}
                onToggleBool={(id, field, value) => handleInlineUpdate(id, { [field]: value })}
                onUpdateNumber={(id, field, value) => handleInlineUpdate(id, { [field]: value })}
            />

            <ProspectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                prospect={selectedProspect}
            />
        </div>
    );
}
