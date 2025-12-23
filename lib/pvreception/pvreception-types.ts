// Types exportés
export type PVType = 'FG' | 'CG' | 'GG';
export type PVStatut = 'non_paye' | 'paye' | 'incomplet' | 'en_attente_livraison' | 'livree' | 'en_attente_livraison_partielle' | 'partiellement_livre';
export type TypeEmballage = 'sac' | 'bidon' | 'fut';

export interface PVReception {
  id: number;
  type: PVType;
  numero_doc: string;
  date_reception: string;
  dette_fournisseur: number;
  utilisateur_id: number;
  fournisseur_id: number;
  provenance_id: number; 
  poids_brut: number;
  type_emballage: TypeEmballage;
  poids_emballage: number;
  poids_net: number;
  nombre_colisage: number;
  prix_unitaire: number;
  taux_humidite?: number;
  prix_total: number;
  quantite_totale: number;
  quantite_restante: number;
  taux_dessiccation?: number;
  statut: PVStatut; 
  created_at: string;
  updated_at: string;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    role: string;
  };
  fournisseur?: {
    id: number;
    nom: string;
    prenom: string;
    contact: string;
  };
  provenance?: {
    id: number;
    Nom: string;
  };
}

export interface PVReceptionFormData {
  type: PVType;
  date_reception: string;
  dette_fournisseur: number;
  utilisateur_id: number;
  fournisseur_id: number;
  provenance_id: number; 
  poids_brut: number;
  type_emballage: TypeEmballage;
  poids_emballage: number;
  nombre_colisage: number;
  prix_unitaire: number;
  taux_humidite?: number;
  taux_dessiccation?: number;
}

export interface PVReceptionResponse {
  success: boolean;
  message: string;
  data?: PVReception;
  calculs?: {
    prix_total: number;
    montant_verse_actuel: number;
    montant_a_couvrir_par_paiements: number;
    paiements_avance_utilises: number;
    dette_fournisseur_finale: number;
    solde_utilisateur: number;
    statut: string;
    reste_a_couvrir_par_paiements: number;
    details_paiements?: Array<{
      id: number;
      reference: string;
      montant_total: number;
      montant_utilise_avant: number;
      montant_utilise_ce_pv: number;
      montant_utilise_total: number;
      montant_restant: number;
      type: string;
      statut: string;
    }>;
    message_paiements?: string;
  };
}

export interface PVReceptionsResponse {
  success: boolean;
  data: PVReception[];
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface CalculPoidsNet {
  poidsBrut: number;
  poidsEmballage: number;
  tauxHumidite?: number;
  tauxDessiccation?: number;
  type: PVType;
}

export interface CalculPrixTotal {
  poidsNet: number;
  prixUnitaire: number;
}

export interface PVReceptionUpdateData {
  type: string;
  date_reception: string;
  fournisseur_id: number;
  provenance_id: number; 
  poids_brut: number;
  type_emballage: string;
  poids_emballage: number;
  nombre_colisage: number;
  prix_unitaire: number;
  taux_dessiccation?: number;
  quantite_restante: number;
  dette_fournisseur: number;
  utilisateur_id: number;
}

export interface FournisseurDisponible {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
  adresse?: string;
  identification_fiscale?: string;
  localisation_id?: number;
  utilisateur_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface FournisseursDisponiblesResponse {
  success: boolean;
  data: FournisseurDisponible[];
  message: string;
  count: number;
}

export interface CalculResults {
  poidsNet: number;
  prixTotal: number;
  detteFournisseur: number;
}

// Nouveau type pour les paiements en avance à utiliser
export interface PaiementAvanceUtilise {
  id: number;
  reference: string;
  montant: number;
  montantUtilise: number;
  montantRestant: number;
  type: string;
  date: string;
  description?: string;
  statut: string;
  montantUtiliseCetteTransaction?: number;
}