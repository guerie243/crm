import { Prospect, ProspectStep } from "@/types/prospect";

export function calculateScore(prospect: Partial<Prospect>): number {
    let score = 0;

    if (prospect.lien_clique) score += 10;
    if (prospect.inscrit) score += 20;
    if (prospect.boutique_configuree) score += 20;
    if ((prospect.nombre_produits || 0) >= 1) score += 15;
    if (prospect.lien_partage) score += 15;
    if ((prospect.nombre_commandes || 0) >= 1) score += 20;

    return Math.min(score, 100);
}

export function isGoalReached(prospect: Partial<Prospect>): boolean {
    const { etape, lien_clique, inscrit, boutique_configuree, nombre_produits, lien_partage, nombre_commandes } = prospect;

    switch (etape) {
        case 'Prospection':
            return !!lien_clique;
        case 'Landing Page':
            return !!inscrit;
        case 'Configuration':
            return !!boutique_configuree;
        case 'Catalogue':
            return (nombre_produits || 0) >= 1;
        case 'Partage':
            return !!lien_partage;
        case 'Ventes':
            return (nombre_commandes || 0) >= 1;
        case '5 Commandes':
            return (nombre_commandes || 0) >= 5;
        default:
            return false;
    }
}

export type RecommendationStatus = 'SUCCESS' | 'ALERT' | 'WAITING';

export function getRecommendation(prospect: Partial<Prospect>): { text: string; status: RecommendationStatus } {
    const reached = isGoalReached(prospect);

    if (reached) {
        return { text: "✅ Succès - Passe à l'étape suivante", status: 'SUCCESS' };
    }

    if (prospect.action_effectuee && !reached) {
        return { text: "🚨 Relancer prospect", status: 'ALERT' };
    }

    return { text: "⏳ En attente", status: 'WAITING' };
}

export const STEPS: ProspectStep[] = [
    'Prospection',
    'Landing Page',
    'Configuration',
    'Catalogue',
    'Partage',
    'Ventes',
    '5 Commandes'
];
