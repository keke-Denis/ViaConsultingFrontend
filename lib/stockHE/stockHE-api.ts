import api from '@/api/api';
import { 
  PoidsNetData,
  PoidsNetResponse
} from './stockHE-types';

export const stockHEAPI = {
  async getPoidsNet(): Promise<PoidsNetData> {
    try {
      const response = await api.get<PoidsNetResponse>('/stock-he');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erreur lors de la récupération du poids net');
      }

      const stockData = response.data.data;
      const poidsNet = stockData?.poids_net || stockData?.stock_disponible || null;

      return {
        HE_FEUILLES: poidsNet
      };
    } catch (error) {
      console.error('Erreur lors de la récupération du poids net:', error);
      return {
        HE_FEUILLES: null
      };
    }
  },

  async verifierDisponibilite(quantite: number) {
    const requestData = { quantite };
    const response = await api.post('/stock-he/verifier', requestData);
    return response.data;
  },

  async refreshData(): Promise<PoidsNetData> {
    return this.getPoidsNet();
  }
};

export default stockHEAPI;