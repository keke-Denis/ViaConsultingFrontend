// lib/collecte/stock-api.ts
import api from '@/api/api';

export interface TypeStat {
  stock_total: number;
  nombre_pv: number;
  quantite_totale_receptionnee: number;
  quantite_livree: number;
  prix_total: number;
  prix_unitaire_moyen: number;
  poids_net_total: number; // AJOUT
  libelle: string;
  icone: string;
}

export interface StockStats {
  FG: TypeStat;
  CG: TypeStat;
  GG: TypeStat;
}

export interface StockStatsResponse {
  status: string;
  message?: string;
  data: {
    stats_par_type: StockStats;
    totaux: {
      stock_total: number;
      nombre_pv_total: number;
      prix_total: number;
      poids_net_total: number; // AJOUT
      types_actifs: number;
    };
    derniere_mise_a_jour: string;
    utilisateur: {
      id: number;
      nom: string;
      email: string;
    };
  };
}

export interface Mouvement {
  id: number;
  type: string;
  numero_doc: string;
  quantite_totale: number;
  quantite_restante: number;
  prix_total: number;
  prix_unitaire: number;
  statut: string;
  date_reception: string;
  livraisons: Array<{
    quantite_livree: number;
    date_livraison: string;
    confirmee: boolean;
  }>;
}

export interface HistoriqueResponse {
  status: string;
  data: {
    mouvements: Mouvement[];
    utilisateur: {
      id: number;
      nom: string;
    };
  };
}

export interface Tendance {
  date: string;
  quantite_receptionnee: number;
  stock_restant: number;
  prix_total: number;
}

export interface TendancesResponse {
  status: string;
  data: {
    tendances: {
      FG: Tendance[];
      CG: Tendance[];
      GG: Tendance[];
    };
    periode: {
      debut: string;
      fin: string;
    };
    utilisateur: {
      id: number;
      nom: string;
    };
  };
}

export const stockApi = {
  // Récupérer les statistiques de stock
  getStockStats: async (): Promise<StockStatsResponse> => {
    const response = await api.get<StockStatsResponse>('/stock/stats');
    return response.data;
  },
  // Récupérer l'historique des mouvements
  getHistoriqueMouvements: async (): Promise<HistoriqueResponse> => {
    const response = await api.get<HistoriqueResponse>('/stock/historique');
    return response.data;
  },
  // Récupérer les tendances
  getTendancesStock: async (): Promise<TendancesResponse> => {
    const response = await api.get<TendancesResponse>('/stock/tendances');
    return response.data;
  }
};

export const stockUtils = {
  // Formater les nombres avec séparateurs
  formatNumber: (num: number): string => {
    return new Intl.NumberFormat('fr-FR').format(num);
  },
  // Formater les prix en Ariary
  formatPrice: (price: number): string => {
    return `${stockUtils.formatNumber(price)} Ar`;
  },
  // Obtenir l'icône par type
  getIcone: (type: string): string => {
    switch (type) {
      case 'CG': return 'Package';
      case 'GG': return 'Box';
      case 'FG': return 'Leaf';
      default: return 'Package';
    }
  },
  // Obtenir le libellé par type
  getLibelle: (type: string): string => {
    switch (type) {
      case 'CG': return 'Clous';
      case 'GG': return 'Griffes';
      case 'FG': return 'Feuilles';
      default: return 'Inconnu';
    }
  }
};
