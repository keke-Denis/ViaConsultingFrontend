// lib/stock/stock-types.ts
export interface StockAPIResponse {
  success: boolean;
  data: {
    FG: {
      total_entree: number;
      total_disponible: number;
      total_utilise: number;
      nombre_lots: number;
    };
    CG: {
      total_entree: number;
      total_disponible: number;
      total_utilise: number;
      nombre_lots: number;
    };
    GG: {
      total_entree: number;
      total_disponible: number;
      total_utilise: number;
      nombre_lots: number;
    };
    // Supprimer HE_FEUILLES ici
  };
}

export interface StockCardData {
  type: string;
  poidsNet: number;
  nombreCollecteurs: number;
  totalEntree: number;
  totalDisponible: number;
  totalUtilise: number;
  nombreLots: number;
}