// lib/TestHuille/tester-huile-api.ts
import api from '@/api/api';
import type { 
  HETester, 
  CreateHETesterData, 
  UpdateHETesterData,
  HETesterResponse,
  HETestersResponse,
  ApiResponse
} from './Tester-huile-types';
export type { HETester } from './Tester-huile-types';
export const testerHuileApi = {
  // Créer un test
  create: async (data: CreateHETesterData): Promise<HETesterResponse> => {
    const response = await api.post<HETesterResponse>('/tests', data);
    return response.data;
  },

  // Récupérer tous les tests
  getAll: async (): Promise<HETestersResponse> => {
    const response = await api.get<HETestersResponse>('/tests');
    return response.data;
  },

  // Récupérer un test par ID
  getById: async (id: number): Promise<HETesterResponse> => {
    const response = await api.get<HETesterResponse>(`/tests/${id}`);
    return response.data;
  },

  // Mettre à jour un test
  update: async (id: number, data: UpdateHETesterData): Promise<HETesterResponse> => {
    try {
      const response = await api.put<HETesterResponse>(`/tests/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API update test:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour',
        data: {} as HETester
      };
    }
  },

  // Supprimer un test
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/tests/${id}`);
    return response.data;
  },
};

export const testerHuileUtils = {
  validerDonnees: (data: CreateHETesterData): string[] => {
    const erreurs: string[] = [];

    if (!data.fiche_reception_id || data.fiche_reception_id <= 0) {
      erreurs.push('La fiche de réception est requise');
    }

    if (!data.date_test) {
      erreurs.push('La date du test est requise');
    }

    if (!data.heure_debut) {
      erreurs.push('L\'heure de début est requise');
    }

    if (!data.heure_fin_prevue) {
      erreurs.push('L\'heure de fin prévue est requise');
    }

    if (!data.presence_huile_vegetale) {
      erreurs.push('La présence d\'huile végétale est requise');
    }

    if (!data.presence_lookhead) {
      erreurs.push('La présence de lookhead est requise');
    }

    return erreurs;
  },

  // Fonction utilitaire pour calculer l'heure de fin prévue (3 heures après le début)
  calculerHeureFinPrevue: (heureDebut: string): string => {
    const [heures, minutes] = heureDebut.split(':').map(Number);
    let heuresFin = heures + 3;
    
    if (heuresFin >= 24) {
      heuresFin -= 24;
    }
    
    return `${heuresFin.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
};

export const testService = testerHuileApi;
