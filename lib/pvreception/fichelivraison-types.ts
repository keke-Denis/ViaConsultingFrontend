// lib/pvreception/fichelivraison-types.ts

export type FicheLivraison = {
  id: number;
  stockpvs_id: number;
  livreur_id: number;
  distilleur_id: number;
  date_livraison: string;
  lieu_depart: string;
  ristourne_regionale: number;
  ristourne_communale: number;
  quantite_a_livrer: number;
  created_at: string;
  updated_at: string;

  stockpv?: {
    id: number;
    type_matiere: string;
    stock_total: number;
    stock_disponible: number;
  };

  livreur?: {
    id: number;
    nom: string;
    prenom: string;
    telephone: string;
    numero_vehicule?: string;
  };

  distilleur?: {
    id: number;
    nom: string;
    prenom: string;
    numero?: string;
    site_collecte_id?: number;
    siteCollecte?: {
      id: number;
      Nom: string;
    };
  };
};

export interface CreateFicheLivraisonData {
  stockpvs_id: number;
  livreur_id: number;
  distilleur_id: number;         // Changé : plus destinateur_id
  date_livraison: string;
  lieu_depart: string;
  ristourne_regionale?: number;
  ristourne_communale?: number;
  quantite_a_livrer: number;
}

export interface FicheLivraisonResponse {
  success: boolean;
  message: string;
  data: FicheLivraison;
  errors?: { [key: string]: string[] } | string[];

  // Informations supplémentaires retournées lors de la création
  destinataire?: {
    distilleur_id: number;
    nom_complet: string;
    site_collecte: string;
    site_collecte_id?: number;
  };
}

export interface FicheLivraisonsResponse {
  success: boolean;
  message: string;
  data: FicheLivraison[];
  errors?: { [key: string]: string[] } | string[];
}