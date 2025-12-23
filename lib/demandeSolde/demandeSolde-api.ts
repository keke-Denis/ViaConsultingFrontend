// lib/demandeSolde/demandeSolde-api.ts
import api from '@/api/api'

export const demandeSoldeApi = {
  // Créer une demande (utilisateur)
  create: async (data: { montant_demande: number; raison: string }, userId: string | number) => {
    const response = await api.post('/demande-soldes', {
      utilisateur_id: userId,
      montant_demande: data.montant_demande,
      raison: data.raison,
    })
    return response.data.data
  },

  // Récupérer ses propres demandes
  getMyDemands: async (userId: string | number) => {
    const response = await api.get(`/demande-soldes/utilisateur/${userId}`)
    return response.data.data
  },

  // Récupérer les transferts reçus
  getReceivedTransfers: async (userId: string | number) => {
    const response = await api.get(`/transferts/utilisateur/${userId}`)
    return response.data.data || []
  },

  // UNIQUEMENT POUR L'ADMIN : toutes les demandes en attente
  getPendingDemands: async () => {
    const response = await api.get('/demande-soldes/statut/en-attente')
    return response.data.data
  },

  // --- nouvelles méthodes pour gérer l'état lu/non-lu côté backend ---
  markAsReadByUser: async (demandeId: string | number) => {
    const response = await api.put(`/demande-soldes/${demandeId}/lu-utilisateur`)
    return response.data
  },

  markAsReadByAdmin: async (demandeId: string | number) => {
    const response = await api.put(`/demande-soldes/${demandeId}/lu-admin`)
    return response.data
  },

  resetReadState: async (demandeId: string | number) => {
    const response = await api.put(`/demande-soldes/${demandeId}/reinitialiser-lu`)
    return response.data
  },

  getNonLues: async (userId: string | number, role: string) => {
    const response = await api.get(`/demande-soldes/non-lues/${userId}/${role}`)
    return response.data.data
  },

  markAllAsReadByUser: async (utilisateur_id: string | number) => {
    const response = await api.put(`/demande-soldes/toutes-lues-utilisateur/${utilisateur_id}`)
    return response.data
  },

  markAllAsReadByAdmin: async () => {
    const response = await api.put(`/demande-soldes/toutes-lues-admin`)
    return response.data
  },
}