// lib/gestionCompte/solde-user-api.ts

import api from "@/api/api";
import type { SoldeUser, SoldeUserApiResponse } from "./solde-user-type";

/**
 * API dédiée au solde par utilisateur (nouvelle table solde_users)
 */
export const soldeUserApi = {
  /**
   * Récupère le solde de l'utilisateur connecté
   * Route : GET /api/soldes-utilisateurs/{id}
   */
  getSoldeUtilisateur: async (utilisateurId: number): Promise<number> => {
    try {
      const response = await api.get<SoldeUserApiResponse>(
        `/soldes-utilisateurs/${utilisateurId}`
      );
      return response.data.data.solde;
    } catch (error: any) {
      // Si l'utilisateur n'existe pas encore dans la table → solde = 0
      if (error.response?.status === 404) {
        return 0;
      }
      console.error("Erreur récupération solde utilisateur :", error.response?.data || error);
      return 0;
    }
  },

  /**
   * (Optionnel) Récupère tous les soldes – utile pour admin
   */
  getTousLesSoldes: async (): Promise<SoldeUser[]> => {
    try {
      const response = await api.get<{ success: true; data: SoldeUser[] }>(
        "/soldes-utilisateurs"
      );
      return response.data.data;
    } catch (error: any) {
      console.error("Erreur récupération de tous les soldes :", error);
      return [];
    }
  },
};