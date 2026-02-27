import { Prospect, ProspectStep } from "@/types/prospect";

// Structure liant chaque étape à son action requise, son délencheur et son délai
export interface StepDetail {
    // Le déclencheur qui démarre le timer
    triggerKey: keyof Prospect;
    triggerLabel: string;
    triggerType: 'boolean' | 'number';
    // L'objectif final attendu
    goalKey: keyof Prospect;
    goalLabel: string;
    goalType: 'boolean' | 'number';
    goalTarget?: number;
    // Le délai d'attente avant alerte (en heures)
    delayHours: number;
    // Messages pour les recommandations
    alertMessage: string;
    successMessage: string;
}

export const STEP_ACTION_MAPPING: Record<ProspectStep, StepDetail> = {
    'Prospection': {
        triggerKey: 'action_effectuee', triggerLabel: 'Message envoyé', triggerType: 'boolean',
        goalKey: 'lien_clique', goalLabel: 'Lien cliqué', goalType: 'boolean',
        delayHours: 24,
        alertMessage: "Le prospect n'a pas cliqué après 24h. Envoyer un message de relance.",
        successMessage: "Prospect engagé. Passer à l'étape Landing Page."
    },
    'Landing Page': {
        triggerKey: 'lien_clique', triggerLabel: 'Arrivé sur landing page', triggerType: 'boolean',
        goalKey: 'inscrit', goalLabel: 'Inscription complétée', goalType: 'boolean',
        delayHours: 12,
        alertMessage: "Le prospect ne s'est pas inscrit. Envoyer message de relance inscription.",
        successMessage: "Inscription complétée. Passer à Configuration."
    },
    'Configuration': {
        triggerKey: 'inscrit', triggerLabel: 'Inscription validée', triggerType: 'boolean',
        goalKey: 'boutique_configuree', goalLabel: 'Boutique configurée', goalType: 'boolean',
        delayHours: 24,
        alertMessage: "Boutique non configurée. Recommandation relance configuration.",
        successMessage: "Boutique configurée. Passer au Catalogue."
    },
    'Catalogue': {
        triggerKey: 'boutique_configuree', triggerLabel: 'Boutique prête', triggerType: 'boolean',
        goalKey: 'nombre_produits', goalLabel: 'Produit ajouté', goalType: 'number', goalTarget: 1,
        delayHours: 24,
        alertMessage: "Aucun produit après 24h. Recommandation relance ajout produit.",
        successMessage: "Produit(s) ajouté(s). Passer au Partage."
    },
    'Partage': {
        triggerKey: 'nombre_produits', triggerLabel: 'Produits ajoutés', triggerType: 'number',
        goalKey: 'lien_partage', goalLabel: 'Lien partagé', goalType: 'boolean',
        delayHours: 48,
        alertMessage: "Lien non partagé. Recommandation relance partage.",
        successMessage: "Lien partagé. Passer aux Ventes."
    },
    'Ventes': {
        triggerKey: 'lien_partage', triggerLabel: 'Lien partagé', triggerType: 'boolean',
        goalKey: 'nombre_commandes', goalLabel: '1 commande obtenue', goalType: 'number', goalTarget: 1,
        delayHours: 72,
        alertMessage: "Aucune commande après 72h. Recommandation relance stratégie ventes.",
        successMessage: "Première commande ! Passer à 5 Commandes."
    },
    '5 Commandes': {
        triggerKey: 'nombre_commandes', triggerLabel: 'Première commande', triggerType: 'number',
        goalKey: 'nombre_commandes', goalLabel: '5 commandes atteintes', goalType: 'number', goalTarget: 5,
        delayHours: 168, // 1 semaine
        alertMessage: "Objectif 5 commandes non atteint. Relancer pour scaler.",
        successMessage: "🎉 5 commandes atteintes ! Demander un avis client."
    },
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

    if (prospect.lien_clique) score += 10;
    if (prospect.inscrit) score += 20;
    if (prospect.boutique_configuree) score += 20;
    if ((prospect.nombre_produits || 0) >= 1) score += 15;
    if (prospect.lien_partage) score += 15;
    if ((prospect.nombre_commandes || 0) >= 1) score += 20;

    return Math.min(score, 100);
}

// Vérifie UNIQUEMENT l'objectif de l'étape ACTUELLE
export function isCurrentStepGoalReached(prospect: Partial<Prospect>): boolean {
    if (!prospect.etape) return false;

    const actionDef = STEP_ACTION_MAPPING[prospect.etape];
    if (!actionDef) return false;

    const value = prospect[actionDef.goalKey];

    if (actionDef.goalType === 'boolean') {
        return !!value;
    } else if (actionDef.goalType === 'number') {
        return (value as number || 0) >= (actionDef.goalTarget || 1);
    }

    return false;
}

// Vérifie si le DECLENCHEUR est actif
export function isCurrentStepTriggered(prospect: Partial<Prospect>): boolean {
    if (!prospect.etape) return false;
    const actionDef = STEP_ACTION_MAPPING[prospect.etape];
    if (!actionDef) return false;

    const triggerValue = prospect[actionDef.triggerKey];

    if (actionDef.triggerKey === 'nombre_produits' || actionDef.triggerKey === 'nombre_commandes') {
        return (triggerValue as number || 0) > 0;
    }

    return !!triggerValue;
}

export type RecommendationStatus = 'SUCCESS' | 'ALERT' | 'WAITING' | 'IN_PROGRESS';

export function getRecommendation(prospect: Partial<Prospect>): { text: string; status: RecommendationStatus; hoursLeft?: number } {
    if (!prospect.etape) return { text: "⏳ En attente", status: 'WAITING' };

    const actionDef = STEP_ACTION_MAPPING[prospect.etape];
    const reached = isCurrentStepGoalReached(prospect);

    // 1. Si l'objectif est atteint
    if (reached) {
        return { text: `✅ ${actionDef.successMessage}`, status: 'SUCCESS' };
    }

    const triggered = isCurrentStepTriggered(prospect);

    // 2. Si non déclenché
    if (!triggered || !prospect.timer_started_at) {
        return { text: `⏳ En attente de : ${actionDef.triggerLabel}`, status: 'WAITING' };
    }

    // 3. Si déclenché, vérifier le timer
    const startTime = new Date(prospect.timer_started_at).getTime();
    const now = new Date().getTime();
    const elapsedHours = (now - startTime) / (1000 * 60 * 60);
    const hoursLeft = Math.max(0, actionDef.delayHours - elapsedHours);

    // 4. Timer dépassé
    if (elapsedHours >= actionDef.delayHours) {
        return { text: `🚨 ${actionDef.alertMessage}`, status: 'ALERT', hoursLeft: 0 };
    }

    // 5. Timer en cours
    return {
        text: `⏳ Action en cours. Attente max : ${actionDef.delayHours}h (Reste ${Math.ceil(hoursLeft)}h)`,
        status: 'IN_PROGRESS',
        hoursLeft
    };
}
