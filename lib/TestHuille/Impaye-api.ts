import api from '@/api/api';
import type { 
  HEImpaye, 
  CreateHEImpayeData, 
  UpdateHEImpayeData,
  HEImpayeResponse,
  HEImpayesResponse,
  ApiResponse
} from './Impaye-types';

export type { HEImpaye } from './Impaye-types';

export const impayeApi = {
// Créer un paiement d'impayé - AVEC MEILLEUR LOGGING
  create: async (data: CreateHEImpayeData): Promise<HEImpayeResponse> => {
    try {
      console.log('📤 Envoi POST /he-impayes avec données:', {
        facturation_id: data.facturation_id,
        montant_paye: data.montant_paye,
        type_montant: typeof data.montant_paye
      });

      const response = await api.post<HEImpayeResponse>('/he-impayes', data);
      
      console.log('✅ Réponse POST /he-impayes:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('💥 Erreur détaillée API création impaye:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      
      // Retourner une réponse d'erreur structurée
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur serveur lors de la création',
        data: {} as HEImpaye
      };
    }
  },


  // Récupérer tous les impayés
  getAll: async (): Promise<HEImpayesResponse> => {
    const response = await api.get<HEImpayesResponse>('/he-impayes');
    return response.data;
  },

  // Récupérer les impayés actifs
  getActifs: async (): Promise<HEImpayesResponse> => {
    const response = await api.get<HEImpayesResponse>('/he-impayes/actifs');
    return response.data;
  },

  // Récupérer un impayé par ID
  getById: async (id: number): Promise<HEImpayeResponse> => {
    const response = await api.get<HEImpayeResponse>(`/he-impayes/${id}`);
    return response.data;
  },

  // Mettre à jour un impayé
  update: async (id: number, data: UpdateHEImpayeData): Promise<HEImpayeResponse> => {
    try {
      const response = await api.put<HEImpayeResponse>(`/he-impayes/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API update impaye:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour',
        data: {} as HEImpaye
      };
    }
  },

  // Supprimer un impayé
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/he-impayes/${id}`);
    return response.data;
  },
};

export const impayeUtils = {
  validerDonnees: (data: CreateHEImpayeData): string[] => {
    const erreurs: string[] = [];

    if (!data.facturation_id || data.facturation_id <= 0) {
      erreurs.push('La facturation est requise');
    }

    if (!data.montant_paye || data.montant_paye <= 0) {
      erreurs.push('Le montant à payer est requis et doit être positif');
    }

    return erreurs;
  },

  formaterMontant: (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant) + ' Ar';
  },

  calculerPourcentagePaye: (montantPaye: number, montantTotal: number): number => {
    if (montantTotal <= 0) return 0;
    return Math.round((montantPaye / montantTotal) * 100);
  },

validerPaiement: (montantPaiement: number, resteAPayer: number): string[] => {
    const erreurs: string[] = [];

    if (!montantPaiement || montantPaiement <= 0) {
      erreurs.push('Le montant à payer est requis et doit être positif');
    }

    if (montantPaiement > resteAPayer) {
      erreurs.push(`Le montant ne peut pas dépasser ${impayeUtils.formaterMontant(resteAPayer)}`);
    }

    return erreurs;
  },

  // Nouvelle fonction pour valider la saisie
  validerSaisieMontant: (valeur: string): boolean => {
    // Permet les nombres avec point décimal optionnel
    return /^\d*\.?\d*$/.test(valeur);
  }
};

export const impayeService = impayeApi;