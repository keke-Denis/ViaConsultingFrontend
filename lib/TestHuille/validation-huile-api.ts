// lib/TestHuille/validation-huile-api.ts
import api from '@/api/api';
import type { 
  HEValidation, 
  CreateHEValidationData, 
  UpdateHEValidationData,
  HEValidationResponse,
  HEValidationsResponse,
  ApiResponse
} from './validation-huile-types';

export const validationHuileApi = {
  // Créer une validation
  create: async (data: CreateHEValidationData): Promise<HEValidationResponse> => {
    try {
      console.log('📤 Envoi POST /validations avec données:', data)
      const response = await api.post<HEValidationResponse>('/validations', data);
      console.log('📥 Réponse POST /validations:', response.data)
      return response.data;
    } catch (error: any) {
      console.error('💥 Erreur détaillée API validation:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      })
      
      // Renvoyer l'erreur complète pour une meilleure gestion
      if (error.response?.status === 422) {
        return {
          success: false,
          message: 'Erreur de validation',
          errors: error.response.data?.errors,
          data: {} as HEValidation
        }
      }
      
      throw error; // Relancer l'erreur pour la gestion dans le composant
    }
  },

  // Récupérer toutes les validations
  getAll: async (): Promise<HEValidationsResponse> => {
    const response = await api.get<HEValidationsResponse>('/validations');
    return response.data;
  },

  // Récupérer une validation par ID
  getById: async (id: number): Promise<HEValidationResponse> => {
    const response = await api.get<HEValidationResponse>(`/validations/${id}`);
    return response.data;
  },

  // Mettre à jour une validation
  update: async (id: number, data: UpdateHEValidationData): Promise<HEValidationResponse> => {
    try {
      const response = await api.put<HEValidationResponse>(`/validations/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API update validation:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour',
        data: {} as HEValidation
      };
    }
  },

  // Supprimer une validation
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/validations/${id}`);
    return response.data;
  },
};

// ... reste du code inchangé

export const validationHuileUtils = {
  validerDonnees: (data: CreateHEValidationData): string[] => {
    const erreurs: string[] = [];

    if (!data.fiche_reception_id || data.fiche_reception_id <= 0) {
      erreurs.push('La fiche de réception est requise');
    }

    if (!data.test_id || data.test_id <= 0) {
      erreurs.push('Le test est requis');
    }

    if (!data.decision) {
      erreurs.push('La décision est requise');
    }

    // Vérification sécurisée pour TypeScript
    const poidsAgreeValue = data.poids_agreer;
    if (poidsAgreeValue !== null && poidsAgreeValue !== undefined && poidsAgreeValue < 0) {
      erreurs.push('Le poids agréé ne peut pas être négatif');
    }

    return erreurs;
  },

  // Mapper la décision vers le statut
  getStatutFromDecision: (decision: 'Accepter' | 'Refuser' | 'A retraiter'): string => {
    switch (decision) {
      case 'Accepter':
        return 'Accepté';
      case 'Refuser':
        return 'Refusé';
      case 'A retraiter':
        return 'A retraiter';
      default:
        return 'en cours de teste';
    }
  },

  // Calculer l'écart de poids
  calculerEcartPoids: (poidsBrut: number, poidsAgree: number | null): number => {
    if (poidsAgree === null || poidsAgree === undefined) return 0;
    return poidsBrut - poidsAgree;
  },

  // Formater l'écart de poids pour l'affichage
  formaterEcartPoids: (ecart: number): string => {
    if (ecart === 0) return '0.00';
    return ecart > 0 ? `+${ecart.toFixed(2)}` : ecart.toFixed(2);
  }
};

// Alias pour la compatibilité
export const validationService = validationHuileApi;