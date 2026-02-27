export type ProspectStep =
    | 'Prospection'
    | 'Landing Page'
    | 'Configuration'
    | 'Catalogue'
    | 'Partage'
    | 'Ventes'
    | '5 Commandes';

export interface Prospect {
    id: string;
    code: string;
    nom: string;
    etape: ProspectStep;
    action_effectuee: boolean;
    lien_clique: boolean;
    inscrit: boolean;
    boutique_configuree: boolean;
    nombre_produits: number;
    lien_partage: boolean;
    nombre_commandes: number;
    score: number;
    timer_started_at: string | null;
    created_at: string;
    updated_at: string | null;
}

export type ProspectInsert = Omit<Prospect, 'id' | 'created_at' | 'updated_at' | 'score'>;
export type ProspectUpdate = Partial<ProspectInsert> & { id: string };

export interface ProspectStats {
    total: number;
    byStep: Record<ProspectStep, number>;
    alerts: number;
    avgScore: number;
}
