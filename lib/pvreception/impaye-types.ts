//lib/pvreception/impaye-type.ts
export type ModePaiement = 'especes' | 'virement' | 'cheque' | 'carte' | 'mobile_money';

export interface Impaye {
  id: number;
  pv_reception_id: number;
  numero_facture: string;
  date_paiement: string | null;
  montant_total: number;
  montant_paye: number;
  reste_a_payer: number;
  mode_paiement: ModePaiement;
  reference_paiement: string | null;
  statut: string;
  created_at: string;
  updated_at: string;
  pv_reception?: {
    id: number;
    type: 'FG' | 'CG' | 'GG';
    numero_doc: string;
    statut: string;
    fournisseur?: {
      id: number;
      nom: string;
      prenom: string;
    };
    provenance?: {
      id: number;
      Nom: string;
    };
  };
}

export interface CreateImpayeData {
  pv_reception_id: number;
  date_paiement: string;
  mode_paiement: ModePaiement;
  reference_paiement?: string;
  montant_total: number;
  montant_paye: number;
}

export interface PaiementImpayeData {
  montant_paye: number;
  mode_paiement: ModePaiement;
  reference_paiement?: string;
  date_paiement?: string;
}

export interface ImpayeResponse {
  status: string;
  message: string;
  data: Impaye;
}

export interface ImpayesResponse {
  status: string;
  message: string;
  data: Impaye[];
}
