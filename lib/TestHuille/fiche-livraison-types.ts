export interface HEFicheLivraison {
  id: number;
  livreur_id: number;
  vendeur_id: number;
  date_heure_livraison: string;
  fonction_destinataire: string;
  lieu_depart: string;
  destination: string;
  type_produit: string;
  poids_net: number;
  quantite_a_livrer: number;
  quantite_restante: number;
  ristourne_regionale: number;
  ristourne_communale: number;
  created_at: string;
  updated_at: string;
  
  ficheReception?: {
    id: number;
    numero_document: string;
    statut: string;
    fournisseur?: {
      id: number;
      nom: string;
      prenom: string;
    };
    siteCollecte?: {
      id: number;
      Nom: string;
    };
  };
  
  livreur?: {
    id: number;
    nom: string;
    prenom: string;
    contact: string;
  };
  
  vendeur?: {
    id: number;
    nom: string;
    prenom: string;
    numero?: string;
    nom_complet?: string;
  };
}

export interface CreateFicheLivraisonData {
  livreur_id: number;
  vendeur_id: number;
  date_heure_livraison: string;
  fonction_destinataire: string;
  lieu_depart: string;
  destination: string;
  type_produit: string;
  poids_net: number;
  quantite_a_livrer: number;
  ristourne_regionale?: number;
  ristourne_communale?: number;
}

export interface UpdateFicheLivraisonData {
  livreur_id?: number;
  vendeur_id?: number;
  date_heure_livraison?: string;
  fonction_destinataire?: string;
  lieu_depart?: string;
  destination?: string;
  type_produit?: string;
  poids_net?: number;
  ristourne_regionale?: number;
  ristourne_communale?: number;
}

export interface Livreur {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
}

export interface Destinateur {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
}

export interface Vendeur {
  id: number;
  nom: string;
  prenom: string;
  numero?: string;
  nom_complet?: string;
}

export interface StockInfo {
  stock_total: number;
  stock_disponible: number;
  quantite_livree: number;
  reste_a_livrer: number;
}

export interface HEFicheLivraisonResponse {
  success: boolean;
  message: string;
  data: HEFicheLivraison;
  stock_info?: StockInfo;
}

export interface HEFichesLivraisonResponse {
  success: boolean;
  message: string;
  data: HEFicheLivraison[];
  count: number;
}

export interface LivreursResponse {
  success: boolean;
  message: string;
  data: Livreur[];
  count: number;
}

export interface DestinateursResponse {
  success: boolean;
  message: string;
  data: Destinateur[];
  count: number;
}

export interface VendeursResponse {
  success: boolean;
  message: string;
  data: Vendeur[];
  count: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  quantite_restauree?: number;
}

export interface EtatStockResponse {
  success: boolean;
  data: {
    stock_disponible: number;
    poids_net?: number;
    [key: string]: any;
  };
  message?: string;
}