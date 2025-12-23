export interface EtatStockHE {
  stock_disponible?: number;
  poids_net?: number;
  dernier_mouvement?: string;
  updated_at?: string;
}

export interface StockHEResponse {
  success: boolean;
  data: EtatStockHE;
  message?: string;
}

export interface VerifierDisponibiliteRequest {
  quantite: number;
}

export interface VerifierDisponibiliteResponse {
  success: boolean;
  disponible: boolean;
  stock_actuel: number;
  quantite_demandee: number;
  message?: string;
}

export interface PoidsNetResponse {
  success: boolean;
  data: EtatStockHE;
  message?: string;
}

export interface PoidsNetData {
  HE_FEUILLES: number | null;
}