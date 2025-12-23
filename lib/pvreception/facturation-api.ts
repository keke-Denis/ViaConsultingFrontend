import api from '@/api/api';
import type { 
  Facturation, 
  CreateFacturationData, 
  PaiementData,
  FacturationResponse,
  FacturationsResponse,
  ApiResponse
} from './facturation-types';

export const facturationApi = {
  // Créer une facturation
  create: async (data: CreateFacturationData): Promise<FacturationResponse> => {
    const response = await api.post<FacturationResponse>('/facturations', data);
    return response.data;
  },

  // Récupérer toutes les facturations
  getAll: async (): Promise<FacturationsResponse> => {
    const response = await api.get<FacturationsResponse>('/facturations');
    return response.data;
  },

  // Récupérer une facturation par ID
  getById: async (id: number): Promise<FacturationResponse> => {
    const response = await api.get<FacturationResponse>(`/facturations/${id}`);
    return response.data;
  },

  // Mettre à jour une facturation
  update: async (id: number, data: Partial<CreateFacturationData>): Promise<FacturationResponse> => {
    const response = await api.put<FacturationResponse>(`/facturations/${id}`, data);
    return response.data;
  },

  // Enregistrer un paiement
  enregistrerPaiement: async (facturationId: number, data: PaiementData): Promise<FacturationResponse> => {
    const response = await api.post<FacturationResponse>(`/facturations/${facturationId}/paiement`, data);
    return response.data;
  }
};

export const facturationUtils = {
  validerDonnees: (data: CreateFacturationData): string[] => {
    const erreurs: string[] = [];

    if (!data.pv_reception_id) {
      erreurs.push('Le PV de réception est requis');
    }

    if (!data.date_facturation) {
      erreurs.push('La date de facturation est requise');
    }

    if (!data.mode_paiement) {
      erreurs.push('Le mode de paiement est requis');
    }

    if (!data.montant_total || data.montant_total <= 0) {
      erreurs.push('Le montant total doit être supérieur à 0');
    }

    if (data.montant_paye < 0) {
      erreurs.push('Le montant payé ne peut pas être négatif');
    }

    if (data.montant_paye > data.montant_total) {
      erreurs.push('Le montant payé ne peut pas dépasser le montant total');
    }

    return erreurs;
  }
};
