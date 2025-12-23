// lib/pvreception/fichelivraison-api.ts

import api from '@/api/api';
import type {
  FicheLivraison,
  CreateFicheLivraisonData,
  FicheLivraisonResponse,
  FicheLivraisonsResponse,
} from './fichelivraison-types';

export const ficheLivraisonApi = {
  // Récupérer toutes les fiches de livraison
  getAll: async (stockpvId?: number): Promise<FicheLivraisonsResponse> => {
    const params = stockpvId ? { stockpvs_id: stockpvId } : {};
    const response = await api.get<FicheLivraisonsResponse>('/fiche-livraisons', { params });
    return response.data;
  },

  // Créer une fiche de livraison
  create: async (data: CreateFicheLivraisonData): Promise<FicheLivraisonResponse> => {
    const response = await api.post<FicheLivraisonResponse>('/fiche-livraisons', {
      stockpvs_id: data.stockpvs_id,
      livreur_id: data.livreur_id,
      distilleur_id: data.distilleur_id,           // Changé
      date_livraison: data.date_livraison,
      lieu_depart: data.lieu_depart,
      ristourne_regionale: data.ristourne_regionale ?? 0,
      ristourne_communale: data.ristourne_communale ?? 0,
      quantite_a_livrer: data.quantite_a_livrer,
    });
    return response.data;
  },

  // Récupérer une fiche par ID
  getById: async (id: number): Promise<FicheLivraisonResponse> => {
    const response = await api.get<FicheLivraisonResponse>(`/fiche-livraisons/${id}`);
    return response.data;
  },

  // Confirmer la livraison complète (si cette route existe toujours)
  livrer: async (ficheLivraisonId: number): Promise<FicheLivraisonResponse> => {
    const response = await api.post<FicheLivraisonResponse>(
      `/fiche-livraisons/${ficheLivraisonId}/livrer`
    );
    return response.data;
  },
};

export const ficheLivraisonUtils = {
  validerDonnees: (data: CreateFicheLivraisonData): string[] => {
    const erreurs: string[] = [];

    if (!data.stockpvs_id) {
      erreurs.push('Le stock PV est requis');
    }

    if (!data.livreur_id) {
      erreurs.push('Le livreur est requis');
    }

    if (!data.distilleur_id) {
      erreurs.push('Le distillateur est requis');
    }

    if (!data.date_livraison) {
      erreurs.push('La date de livraison est requise');
    }

    if (!data.lieu_depart) {
      erreurs.push('Le lieu de départ est requis');
    }

    if (!data.quantite_a_livrer || data.quantite_a_livrer <= 0) {
      erreurs.push('La quantité à livrer doit être supérieure à 0');
    }

    return erreurs;
  },
};