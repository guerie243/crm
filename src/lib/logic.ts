import { Prospect, ProspectStep } from "@/types/prospect";

// Structure liant chaque étape à son action requise
export const STEP_ACTION_MAPPING: Record<ProspectStep, { key: keyof Prospect; label: string; type: 'boolean' | 'number'; target?: number }> = {
    'Prospection': { key: 'lien_clique', label: 'Lien cliqué', type: 'boolean' },
    'Landing Page': { key: 'inscrit', label: 'Inscription effectuée', type: 'boolean' },
    'Configuration': { key: 'boutique_configuree', label: 'Boutique configurée', type: 'boolean' },
    'Catalogue': { key: 'nombre_produits', label: 'Produit ajouté', type: 'number', target: 1 },
    'Partage': { key: 'lien_partage', label: 'Lien partagé', type: 'boolean' },
    'Ventes': { key: 'nombre_commandes', label: 'Au moins 1 commande', type: 'number', target: 1 },
    '5 Commandes': { key: 'nombre_commandes', label: '5 commandes atteintes', type: 'number', target: 5 },
};

export const STEPS: ProspectStep[] = [
    'Prospection',
    'Landing Page',
    'Configuration',
    'Catalogue',
    'Partage',
    'Ventes',
    '5 Commandes'
];

export function calculateScore(prospect: Partial<Prospect>): number {
    let score = 0;

    // Le score total reste calculé sur l'historique complet pour la progression globale
    if (prospect.lien_clique) score += 10;
    if (prospect.inscrit) score += 20;
    if (prospect.boutique_configuree) score += 20;
    if ((prospect.nombre_produits || 0) >= 1) score += 15;
    if (prospect.lien_partage) score += 15;
    if ((prospect.nombre_commandes || 0) >= 1) score += 20;

    return Math.min(score, 100);
}

// Vérifie UNIQUEMENT l'action de l'étape ACTUELLE
export function isCurrentStepGoalReached(prospect: Partial<Prospect>): boolean {
    if (!prospect.etape) return false;

    const actionDef = STEP_ACTION_MAPPING[prospect.etape];
    if (!actionDef) return false;

    const value = prospect[actionDef.key];

    if (actionDef.type === 'boolean') {
        return !!value;
    } else if (actionDef.type === 'number') {
        return (value as number || 0) >= (actionDef.target || 1);
    }

    return false;
}

export type RecommendationStatus = 'SUCCESS' | 'ALERT' | 'WAITING';

export function getRecommendation(prospect: Partial<Prospect>): { text: string; status: RecommendationStatus } {
    if (!prospect.etape) return { text: "⏳ En attente", status: 'WAITING' };

    const reached = isCurrentStepGoalReached(prospect);

    if (reached) {
        return { text: "✅ Objectif atteint — Prêt à passer à l'étape suivante", status: 'SUCCESS' };
    }

    return { text: "🚨 Relancer le prospect pour compléter l'action de cette étape", status: 'ALERT' };
}
