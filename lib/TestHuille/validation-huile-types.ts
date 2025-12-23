// lib/TestHuille/validation-huile-types.ts
export interface HEValidation {
  id: number;
  fiche_reception_id: number;
  test_id: number;
  decision: 'Accepter' | 'Refuser' | 'A retraiter';
  poids_agreer: number | null;
  observation_ecart_poids: string | null;
  observation_generale: string | null;
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
  test?: {
    id: number;
    date_test: string;
    heure_debut: string;
    heure_fin_prevue: string;
    heure_fin_reelle: string | null;
    densite: number | null;
    presence_huile_vegetale: 'Oui' | 'Non';
    presence_lookhead: 'Oui' | 'Non';
    teneur_eau: number | null;
    observations: string | null;
  };
}

export interface CreateHEValidationData {
  fiche_reception_id: number;
  test_id: number;
  decision: 'Accepter' | 'Refuser' | 'A retraiter';
  poids_agreer?: number | null;
  observation_ecart_poids?: string | null;
  observation_generale?: string | null;
}

export interface UpdateHEValidationData {
  decision?: 'Accepter' | 'Refuser' | 'A retraiter';
  poids_agreer?: number | null;
  observation_ecart_poids?: string | null;
  observation_generale?: string | null;
}

// Responses API
export interface HEValidationResponse {
  success: boolean;
  message: string;
  data: HEValidation;
  errors?: any;
}

export interface HEValidationsResponse {
  success: boolean;
  message: string;
  data: HEValidation[];
  count: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}