import api from "@/api/api";
import type { FournisseurDetteResponse, FournisseurDetteDetail } from "./affichageFournisseurDette-types";

export const affichageFournisseurDetteAPI = {
  // Récupérer les informations détaillées d'un fournisseur avec ses dettes et paiements
  async getFournisseurDetail(fournisseurId: number): Promise<FournisseurDetteResponse> {
    try {
      const response = await api.get(`/pv-receptions/fournisseur/${fournisseurId}`);
      return response.data;
    } catch (error: any) {
      console.error('Erreur API getFournisseurDetail:', error);
      return {
        success: false,
        data: {
          fournisseur: {
            id: 0,
            nom: '',
            prenom: '',
            contact: '',
            adresse: ''
          },
          paiements_avance: {
            total_arrive: 0,
            total_en_attente: 0,
            details_arrive: [],
            details_en_attente: []
          },
          resume: {
            peut_creer_pv: true,
            montant_utilisable: 0,
            alertes: null
          }
        },
        message: error.response?.data?.message || 'Erreur lors de la récupération des informations du fournisseur'
      };
    }
  }
};