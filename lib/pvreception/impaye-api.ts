import api from '@/api/api';
import type { 
  Impaye, 
  CreateImpayeData, 
  PaiementImpayeData,
  ImpayeResponse,
  ImpayesResponse
} from './impaye-types';

export const impayeApi = {
  // Récupérer tous les impayés
  getAll: async (): Promise<ImpayesResponse> => {
    const response = await api.get<ImpayesResponse>('/impayes');
    return response.data;
  },

  // Créer un impayé
  create: async (data: CreateImpayeData): Promise<ImpayeResponse> => {
    const response = await api.post<ImpayeResponse>('/impayes', data);
    return response.data;
  },

  // Récupérer un impayé par ID
  getById: async (id: number): Promise<ImpayeResponse> => {
    const response = await api.get<ImpayeResponse>(`/impayes/${id}`);
    return response.data;
  },

  // Enregistrer un paiement d'impayé
  enregistrerPaiement: async (impayeId: number, data: PaiementImpayeData): Promise<ImpayeResponse> => {
    const response = await api.post<ImpayeResponse>(`/impayes/${impayeId}/paiement`, data);
    return response.data;
  }
};

export const impayeUtils = {
  validerDonnees: (data: CreateImpayeData | PaiementImpayeData): string[] => {
    const erreurs: string[] = [];

    // Validation pour CreateImpayeData
    if ('pv_reception_id' in data && !data.pv_reception_id) {
      erreurs.push('Le PV de réception est requis');
    }

    if (!data.date_paiement) {
      erreurs.push('La date de paiement est requise');
    }

    if (!data.mode_paiement) {
      erreurs.push('Le mode de paiement est requis');
    }

    if ('montant_total' in data && (!data.montant_total || data.montant_total <= 0)) {
      erreurs.push('Le montant total doit être supérieur à 0');
    }

    if (data.montant_paye < 0) {
      erreurs.push('Le montant payé ne peut pas être négatif');
    }

    return erreurs;
  }
};