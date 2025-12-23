export interface FournisseurInfo {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
  adresse?: string;
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

export interface FournisseurDetteDetail {
  fournisseur: FournisseurInfo;
  paiements_avance: {
    total_arrive: number;
    total_en_attente: number;
    details_arrive: PaiementAvance[];
    details_en_attente: PaiementAvance[];
  };
  resume: {
    peut_creer_pv: boolean;
    montant_utilisable: number;
    alertes: string | null;
  };
}

export interface FournisseurDetteResponse {
  success: boolean;
  data: FournisseurDetteDetail;
  message?: string;
}