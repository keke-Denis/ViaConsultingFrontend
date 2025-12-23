// lib/stock/stock-api.ts
import api from '@/api/api'
import { StockAPIResponse } from './stock-types'

class StockAPI {
  /**
   * Récupère l'état actuel du stock depuis votre API existante
   */
  async getEtatStock(): Promise<StockAPIResponse> {
    try {
      const response = await api.get('/matiere-premiere/stock')
      return response.data
    } catch (error: any) {
      console.error('Erreur lors de la récupération du stock:', error)
      return {
        success: false,
        data: {
          FG: { total_entree: 0, total_disponible: 0, total_utilise: 0, nombre_lots: 0 },
          CG: { total_entree: 0, total_disponible: 0, total_utilise: 0, nombre_lots: 0 },
          GG: { total_entree: 0, total_disponible: 0, total_utilise: 0, nombre_lots: 0 }
        }
      }
    }
  }

  /**
   * Récupère le poids net pour chaque type
   */
  async getPoidsNet(): Promise<Record<string, number>> {
    try {
      const response = await this.getEtatStock()

      console.log('Données API principale:', response.data)

      const poidsNet: Record<string, number> = {
        FG: response.data?.FG?.total_disponible || 0,
        CG: response.data?.CG?.total_disponible || 0,
        GG: response.data?.GG?.total_disponible || 0
      }

      console.log('Poids net final:', poidsNet)
      return poidsNet
    } catch (error) {
      console.error('Erreur dans getPoidsNet:', error)
      return {
        FG: 0,
        CG: 0,
        GG: 0
      }
    }
  }
}

export const stockAPI = new StockAPI()