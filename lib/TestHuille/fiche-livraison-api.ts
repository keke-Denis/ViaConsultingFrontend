import api from '@/api/api';
import type {
  HEFicheLivraison,
  CreateFicheLivraisonData,
  UpdateFicheLivraisonData,
  HEFicheLivraisonResponse,
  HEFichesLivraisonResponse,
  LivreursResponse,
  DestinateursResponse,
  ApiResponse,
  EtatStockResponse,
  StockInfo
} from './fiche-livraison-types';

export const heFicheLivraisonApi = {
  getAll: async (): Promise<HEFichesLivraisonResponse> => {
    const response = await api.get<HEFichesLivraisonResponse>('/he-fiche-livraisons');
    return response.data;
  },

  getById: async (id: number): Promise<HEFicheLivraisonResponse> => {
    const response = await api.get<HEFicheLivraisonResponse>(`/he-fiche-livraisons/${id}`);
    return response.data;
  },

  create: async (data: CreateFicheLivraisonData): Promise<HEFicheLivraisonResponse> => {
    const response = await api.post<HEFicheLivraisonResponse>('/he-fiche-livraisons', data);
    return response.data;
  },

  update: async (id: number, data: UpdateFicheLivraisonData): Promise<HEFicheLivraisonResponse> => {
    const response = await api.put<HEFicheLivraisonResponse>(`/he-fiche-livraisons/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/he-fiche-livraisons/${id}`);
    return response.data;
  },

  getByFicheReception: async (fiche_reception_id: number): Promise<HEFicheLivraisonResponse> => {
    const response = await api.get<HEFicheLivraisonResponse>(`/he-fiche-livraisons/fiche/${fiche_reception_id}`);
    return response.data;
  },

  getLivreurs: async (): Promise<LivreursResponse> => {
    const response = await api.get<LivreursResponse>('/he-fiche-livraisons/livreurs');
    return response.data;
  },

  getDestinateurs: async (): Promise<DestinateursResponse> => {
    const response = await api.get<DestinateursResponse>('/he-fiche-livraisons/destinateurs');
    return response.data;
  },

  // Alias pour getDestinateurs - utilise la même route
  getVendeurs: async (): Promise<DestinateursResponse> => {
    const response = await api.get<DestinateursResponse>('/he-fiche-livraisons/destinateurs');
    return response.data;
  },

  getEtatStock: async (): Promise<EtatStockResponse> => {
    const response = await api.get<EtatStockResponse>('/stock-he');
    return response.data;
  },

  annulerLivraison: async (id: number): Promise<ApiResponse> => {
    const response = await api.post<ApiResponse>(`/he-fiche-livraisons/${id}/annuler`);
    return response.data;
  }
};

export const ficheLivraisonService = {
  validerDonnees: (data: CreateFicheLivraisonData): string[] => {
    const erreurs: string[] = [];

    if (!data.livreur_id) erreurs.push('Le livreur est requis');
    if (!data.vendeur_id) erreurs.push('Le vendeur est requis');
    if (!data.date_heure_livraison) erreurs.push('La date et heure de livraison sont requises');
    if (!data.fonction_destinataire) erreurs.push('La fonction du destinataire est requise');
    if (!data.lieu_depart) erreurs.push('Le lieu de départ est requis');
    if (!data.destination) erreurs.push('La destination est requise');
    if (!data.type_produit) erreurs.push('Le type de produit est requis');
    if (!data.poids_net || data.poids_net <= 0) erreurs.push('Le poids net doit être supérieur à 0');
    if (!data.quantite_a_livrer || data.quantite_a_livrer <= 0) erreurs.push('La quantité à livrer doit être supérieure à 0');

    return erreurs;
  },

  formaterDateHeure: (dateTime: string): string => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default heFicheLivraisonApi;