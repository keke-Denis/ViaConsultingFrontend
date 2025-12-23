// lib/TestHuille/fiche-reception-types.ts

export interface FicheReception {
  id: number;
  numero_document: string;
  date_reception: string;
  heure_reception: string;
  fournisseur_id: number;
  site_collecte_id: number;
  utilisateur_id: number;
  poids_brut: number;
  poids_agreer?: number;
  taux_humidite?: number;
  taux_dessiccation?: number;
  poids_net?: number;
  statut: FicheReceptionStatut;
  created_at: string;
  updated_at: string;
  
  // NOUVEAUX CHAMPS
  type_emballage?: 'sac' | 'bidon' | 'fut';
  poids_emballage?: number;
  nombre_colisage?: number;
  prix_unitaire?: number;
  prix_total?: number;
  
  // Relations
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
  utilisateur?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  
  // Calculs automatiques depuis le backend
  calculs?: {
    poids_net_calcule?: number;
    prix_total_calcule?: number;
  };
}

export type FicheReceptionStatut = 
  | 'en attente de teste'
  | 'en cours de teste'
  | 'Accepté'
  | 'Teste terminée'
  | 'teste validé'
  | 'teste invalide'
  | 'En attente de livraison'
  | 'en cours de livraison'
  | 'payé'
  | 'incomplet'
  | 'partiellement payé'
  | 'en attente de paiement'
  | 'payement incomplète'
  | 'livré'
  | 'Refusé'
  | 'A retraiter';

export interface CreateFicheReceptionData {
  date_reception: string;
  heure_reception: string;
  fournisseur_id: number;
  site_collecte_id: number;
  utilisateur_id: number;
  poids_brut: number;
  poids_agreer?: number;
  taux_humidite?: number;
  taux_dessiccation?: number;
  // NOUVEAUX CHAMPS
  type_emballage?: 'sac' | 'bidon' | 'fut';
  poids_emballage?: number;
  nombre_colisage?: number;
  prix_unitaire?: number;
  prix_total?: number;
}

export interface UpdateFicheReceptionData {
  date_reception?: string;
  heure_reception?: string;
  fournisseur_id?: number;
  site_collecte_id?: number;
  utilisateur_id?: number;
  poids_brut?: number;
  poids_agreer?: number;
  taux_humidite?: number;
  taux_dessiccation?: number;
  statut?: FicheReceptionStatut;
  // NOUVEAUX CHAMPS
  type_emballage?: 'sac' | 'bidon' | 'fut';
  poids_emballage?: number;
  nombre_colisage?: number;
  prix_unitaire?: number;
  prix_total?: number;
}

// Responses API
export interface FicheReceptionResponse {
  success: boolean;
  message: string;
  data: FicheReception;
  errors?: any;
  calculs?: {
    poids_net_calcule?: number;
    prix_total_calcule?: number;
  };
}

export interface FicheReceptionsResponse {
  success: boolean;
  message: string;
  data: FicheReception[];
  count: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

// Nouveaux types pour les fournisseurs
export interface Fournisseur {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
  adresse?: string;
  est_disponible?: boolean;
}

export interface PaiementAvance {
  id: number;
  reference: string;
  montant: number;
  type: string;
  date: string;
  description?: string;
  statut: string;
  delai_heures?: number;
  est_en_retard?: boolean;
  temps_restant?: string;
}

export interface InfosFournisseurResponse {
  success: boolean;
  message: string;
  data: {
    fournisseur: Fournisseur;
    paiements_avance: {
      total_disponibles: number;
      total_en_attente: number;
      details_disponibles: PaiementAvance[];
      details_en_attente: PaiementAvance[];
    };
    resume: {
      peut_creer_pv: boolean;
      montant_utilisable: number;
      alertes: string | null;
    };
  };
}

export interface FournisseursDisponiblesResponse {
  success: boolean;
  message: string;
  data: Fournisseur[];
  count: number;
}