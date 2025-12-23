// lib/paiementEnAvance/paiementEnAvance-api.ts

import api from '@/api/api';
import type {
  PaiementEnAvance,
  PaiementEnAvanceFormData,
  PaiementEnAvanceResponse,
  PaiementsEnAvanceResponse,
  UtiliserPaiementData, // AJOUT: import du nouveau type
} from './paiementEnAvance-types';

export const paiementEnAvanceAPI = {
  // Récupérer tous les paiements en avance
  getAll: async (): Promise<PaiementsEnAvanceResponse> => {
    const res = await api.get<PaiementsEnAvanceResponse>('/paiements-avance');
    console.log('Liste des paiements en avance récupérés :', res.data.data);
    return res.data;
  },

  // Créer un nouveau paiement en avance
  create: async (data: PaiementEnAvanceFormData): Promise<PaiementEnAvanceResponse> => {
    const res = await api.post<PaiementEnAvanceResponse>('/paiements-avance', data);
    return res.data;
  },

  // Récupérer un seul paiement
  getById: async (id: number): Promise<PaiementEnAvance> => {
    const res = await api.get<PaiementEnAvance>(`/paiements-avance/${id}`);
    console.log('Détail paiement récupéré :', res.data);
    return res.data;
  },

  // MODIFICATION : Mettre à jour un paiement
  update: async (id: number, data: Partial<PaiementEnAvanceFormData>): Promise<PaiementEnAvanceResponse> => {
    const res = await api.put<PaiementEnAvanceResponse>(`/paiements-avance/${id}`, data);
    console.log('Paiement MODIFIÉ :', res.data);
    return res.data;
  },

  // SUPPRESSION : Supprimer définitivement un paiement
  delete: async (id: number): Promise<PaiementEnAvanceResponse> => {
    const res = await api.delete<PaiementEnAvanceResponse>(`/paiements-avance/${id}`);
    console.log('Paiement SUPPRIMÉ :', res.data);
    return res.data;
  },

  // Confirmer un paiement (CHANGÉ: endpoint POST)
   confirmer: async (id: number): Promise<PaiementEnAvanceResponse> => {
    const res = await api.put<PaiementEnAvanceResponse>(`/paiements-avance/${id}/confirmer`);
    console.log('Paiement CONFIRMÉ :', res.data);
    return res.data;
  },

  // Annuler un paiement (CHANGÉ: endpoint POST)
 annuler: async (id: number, raison_annulation: string): Promise<PaiementEnAvanceResponse> => {
    const res = await api.put<PaiementEnAvanceResponse>(`/paiements-avance/${id}/annuler`, {
      raison_annulation,
    });
    console.log('Paiement ANNULÉ :', res.data);
    return res.data;
  },

  // Récupérer les paiements en retard (CHANGÉ: endpoint corrigé)
 getEnRetard: async (): Promise<PaiementsEnAvanceResponse> => {
    const res = await api.get<PaiementsEnAvanceResponse>('/paiements-avance/retard/en-retard');
    console.log('Paiements en retard :', res.data.data);
    return res.data;
  },

  // Récupérer les paiements utilisables (statut "arrivé" et montant_restant > 0)
  getPaiementsUtilisables: async (fournisseur_id?: number): Promise<PaiementsEnAvanceResponse> => {
    const url = fournisseur_id
      ? `/paiements-avance/utilisables/${fournisseur_id}`
      : '/paiements-avance/utilisables';
    const res = await api.get<PaiementsEnAvanceResponse>(url);
    console.log('Paiements utilisables :', res.data.data);
    return res.data;
  },

  // Utiliser un montant du paiement en avance (CHANGÉ: endpoint POST et nouveau paramètre)
  utiliser: async (
    id: number,
    montant_utilise: number,
    pv_reception_id?: number,
    fiche_reception_id?: number 
  ): Promise<PaiementEnAvanceResponse> => {
    const data: UtiliserPaiementData = {
      montant_utilise,
      pv_reception_id,
      fiche_reception_id
    };
    
    const res = await api.post<PaiementEnAvanceResponse>(`/paiements-avance/${id}/utiliser`, data);
    console.log('Paiement UTILISÉ :', res.data);
    return res.data;
  },

  // AJOUT: Méthode pour utiliser un paiement pour une fiche de réception
  utiliserPourFiche: async (
    id: number,
    montant_utilise: number,
    fiche_reception_id: number
  ): Promise<PaiementEnAvanceResponse> => {
    return paiementEnAvanceAPI.utiliser(id, montant_utilise, undefined, fiche_reception_id);
  },

  // AJOUT: Méthode pour utiliser un paiement pour un PV de réception
  utiliserPourPV: async (
    id: number,
    montant_utilise: number,
    pv_reception_id: number
  ): Promise<PaiementEnAvanceResponse> => {
    return paiementEnAvanceAPI.utiliser(id, montant_utilise, pv_reception_id);
  },

  // AJOUT: Récupérer les statistiques des paiements
  getStatistiques: async (): Promise<any> => {
    const res = await api.get('/paiements-avance/statistiques');
    console.log('Statistiques paiements :', res.data.data);
    return res.data;
  },
};