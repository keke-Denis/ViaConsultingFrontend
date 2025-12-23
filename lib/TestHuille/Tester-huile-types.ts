// lib/TestHuille/tester-huile-types.ts
export interface HETester {
  id: number;
  fiche_reception_id: number;
  date_test: string;
  heure_debut: string;
  heure_fin_prevue: string;
  heure_fin_reelle: string | null;
  densite: number | null;
  presence_huile_vegetale: 'Oui' | 'Non';
  presence_lookhead: 'Oui' | 'Non';
  teneur_eau: number | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
  
  // Relations
  fiche_reception?: {
    id: number;
    numero_document: string;
    date_reception: string;
    heure_reception: string;
    poids_brut: number;
    statut: string;
    fournisseur?: {
      id: number;
      nom: string;
      prenom: string;
      contact: string;
    };
    site_collecte?: {
      id: number;
      Nom: string;
    };
  };
}

export interface CreateHETesterData {
  fiche_reception_id: number;
  date_test: string;
  heure_debut: string;
  heure_fin_prevue: string; // Nouveau champ requis
  heure_fin_reelle?: string | null;
  densite?: number | null;
  presence_huile_vegetale: 'Oui' | 'Non';
  presence_lookhead: 'Oui' | 'Non';
  teneur_eau?: number | null;
  observations?: string | null;
}

export interface UpdateHETesterData {
  date_test?: string;
  heure_debut?: string;
  heure_fin_prevue?: string;
  heure_fin_reelle?: string | null;
  densite?: number | null;
  presence_huile_vegetale?: 'Oui' | 'Non';
  presence_lookhead?: 'Oui' | 'Non';
  teneur_eau?: number | null;
  observations?: string | null;
}

export interface HETesterResponse {
  success: boolean;
  message: string;
  data: HETester;
  errors?: any;
}

export interface HETestersResponse {
  success: boolean;
  message: string;
  data: HETester[];
  count: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}