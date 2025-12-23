// lib/siteCollecte/site-collecte-api.ts

import api from '@/api/api';
import type { 
  SiteCollecte, 
  CreateSiteCollecteData,
  SiteCollecteResponse,
  SiteCollectesResponse,
  ApiResponse
} from './site-collecte-types';

export const siteCollecteApi = {
  // Récupérer tous les sites de collecte
  getAll: async (): Promise<SiteCollectesResponse> => {
    const response = await api.get<SiteCollectesResponse>('/site-collectes');
    return response.data;
  },

  // Créer un site de collecte
  create: async (data: CreateSiteCollecteData): Promise<SiteCollecteResponse> => {
    const response = await api.post<SiteCollecteResponse>('/site-collectes', data);
    return response.data;
  },

  // Récupérer un site de collecte par ID
  getById: async (id: number): Promise<SiteCollecteResponse> => {
    const response = await api.get<SiteCollecteResponse>(`/site-collectes/${id}`);
    return response.data;
  },

  // Mettre à jour un site de collecte
  update: async (id: number, data: CreateSiteCollecteData): Promise<SiteCollecteResponse> => {
    const response = await api.put<SiteCollecteResponse>(`/site-collectes/${id}`, data);
    return response.data;
  },

  // Supprimer un site de collecte
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/site-collectes/${id}`);
    return response.data;
  }
};

export const siteCollecteUtils = {
  validerDonnees: (data: CreateSiteCollecteData): string[] => {
    const erreurs: string[] = [];

    if (!data.Nom || data.Nom.trim() === '') {
      erreurs.push('Le nom du site de collecte est requis');
    }

    if (data.Nom && data.Nom.length > 50) {
      erreurs.push('Le nom du site de collecte ne peut pas dépasser 50 caractères');
    }

    return erreurs;
  }
};
