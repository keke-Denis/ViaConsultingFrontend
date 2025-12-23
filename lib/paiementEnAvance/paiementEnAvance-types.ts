// lib/paiementEnAvance/paiementEnAvance-types.ts

export type StatutPaiement = 'en_attente' | 'arrivé' | 'annulé' | 'utilise';
export type MethodePaiement = 'espèces' | 'virement' | 'chèque';
export type TypePaiement = 'avance' | 'paiement_complet' | 'acompte' | 'règlement';

export interface PaiementEnAvance {
  id: number;
  fournisseur_id: number;
  pv_reception_id?: number | null;
  fiche_reception_id?: number | null; // NOUVEAU: ajouté pour les fiches de réception
  date_utilisation?: string | null; // Date de la première utilisation
  montant: number; // Montant total de l'avance
  montant_utilise: number; // Montant déjà utilisé
  montant_restant: number; // Montant encore disponible
  montantDu?: number | null; // Reste à payer
  montantAvance?: number | null; // Avance versée
  date: string;
  statut: StatutPaiement;
  methode: MethodePaiement;
  reference: string;
  type: TypePaiement;
  description?: string | null;
  delaiHeures?: number | null;
  raison?: string | null;
  created_at: string;
  updated_at: string;
  est_en_retard?: boolean;
  temps_restant?: string | null;

  fournisseur: {
    id: number;
    nom: string;
    prenom: string;
    contact: string;
  };
}

export interface PaiementEnAvanceFormData {
  fournisseur_id: number;
  montant: number; // Montant total du contrat
  montantDu?: number; // Reste à payer
  montantAvance?: number; // Avance versée
  methode: MethodePaiement;
  type: TypePaiement;
  description?: string;
  delaiHeures: number;
  raison?: string;
}

export interface PaiementEnAvanceResponse {
  success: boolean;
  message: string;
  data?: PaiementEnAvance;
  solde_utilisateur_apres?: number;
  delai_heures?: number;
  montant_utilise?: number;
  montant_restant?: number;
  statut?: StatutPaiement;
  est_en_retard?: boolean; // AJOUT: pour la réponse de confirmation
}

export interface PaiementsEnAvanceResponse {
  success: boolean;
  message: string;
  data: PaiementEnAvance[];
  total_montant_disponible?: number;
  nombre_retards?: number; // AJOUT: pour les retards
}

// AJOUT: Nouveau type pour utiliser les paiements
export interface UtiliserPaiementData {
  montant_utilise: number;
  pv_reception_id?: number;
  fiche_reception_id?: number; // AJOUT: pour les fiches de réception
}