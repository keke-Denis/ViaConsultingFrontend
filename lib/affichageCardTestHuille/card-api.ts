// lib/affichageCardTestHuille/card-api.ts

import api from '@/api/api'
import type { FicheStatistique, ApiResponse, CardStats } from './card-types'

export const cardStatistiqueService = {
  /**
   * Récupère les statistiques des fiches de réception
   */
  async getStatistiques(): Promise<CardStats> {
    try {
      const response = await api.get<ApiResponse<FicheStatistique>>('/fiche-statistique')
      
      if (response.data.success && response.data.data) {
        const data = response.data.data
        return {
          totalFiches: data.total_fiches ?? 0,
          awaitingTest: data.en_attente_test ?? 0,
          totalStock: data.stock_brut_total ?? 0,
          totalPoidsNet: data.stock_net_total ?? 0
        }
      }
      
      throw new Error('Réponse invalide du serveur')
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      throw error
    }
  }
}
