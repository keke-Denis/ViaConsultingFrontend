export type Facturation = {
  id: number;
  pv_reception_id: number;
  date_facturation: string;
  mode_paiement: string;
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  numero_facture: string;
  reference_paiement?: string;
  statut: string;
  created_at: string;
  updated_at: string;
  
  pv_reception?: {
    id: number;
    numero_document: string;
    date_reception: string;
    fournisseur?: {
      id: number;
      nom: string;
      prenom: string;
    };
    site_collecte?: {
      id: number;
      Nom: string;
    };
  };
};

export interface CreateFacturationData {
  pv_reception_id: number;
  date_facturation: string;
  mode_paiement: string;
  montant_total: number;
  montant_paye: number;
  reference_paiement?: string;
}

export interface PaiementData {
  montant_paye: number;
  mode_paiement: string;
  reference_paiement?: string;
  date_paiement?: string;
}

export interface FacturationResponse {
  status: string; // CHANGÉ: success → status
  message: string;
  data: Facturation;
  errors?: any;
}

export interface FacturationsResponse {
  status: string; // CHANGÉ: success → status
  message: string;
  data: Facturation[];
  count: number;
}

export interface ApiResponse {
  status: string; // CHANGÉ: success → status
  message: string;
}
