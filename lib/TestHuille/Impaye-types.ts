import type { FacturationResponse } from './Facturation-huile-api';

export interface HEImpaye {
  id: number;
  facturation_id: number;
  montant_du: number;
  montant_paye: number;
  reste_a_payer: number;
  created_at: string;
  updated_at: string;
  facturation?: FacturationResponse;
}

export interface CreateHEImpayeData {
  facturation_id: number;
  montant_paye: number;
}

export interface UpdateHEImpayeData {
  montant_paye: number;
}

export interface HEImpayeResponse {
  success: boolean;
  message: string;
  data: HEImpaye;
  nouveau_statut?: string;
  solde_info?: {
    solde_avant: number;
    solde_apres: number;
    montant_debite: number;
  };
}

export interface HEImpayesResponse {
  success: boolean;
  message: string;
  data: HEImpaye[];
  count: number;
  total_impayes?: number;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}