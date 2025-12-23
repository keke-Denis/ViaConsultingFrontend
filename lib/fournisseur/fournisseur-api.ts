// lib/fournisseur/fournisseur-api.ts
import api from '@/api/api'
import type { Fournisseur, FournisseurFormData, FournisseurResponse, FournisseursResponse, ApiResponse } from './fournisseur-types'

export const fournisseurAPI = {
  // Créer un fournisseur
  create: async (data: FournisseurFormData): Promise<FournisseurResponse> => {
    // Si aucun identification_fiscale n'est fourni, générer un code unique
    if (!data.identification_fiscale || data.identification_fiscale.trim() === "") {
      // Récupérer le code_collecteur de l'utilisateur connecté
      try {
        const userResponse = await api.get('/user')
        const currentUser = userResponse.data.data
        
        if (currentUser?.code_collecteur) {
          // Récupérer le nombre de fournisseurs existants
          const allFournisseursResponse = await api.get<FournisseursResponse>('/fournisseurs')
          const existingFournisseurs = allFournisseursResponse.data.data
          
          // Compter les fournisseurs créés par cet utilisateur
          const userFournisseursCount = existingFournisseurs.filter(
            (f: Fournisseur) => f.identification_fiscale?.startsWith(currentUser.code_collecteur)
          ).length
          
          const numeroSequence = String(userFournisseursCount + 1).padStart(3, '0')
          data.identification_fiscale = `${currentUser.code_collecteur}-F${numeroSequence}`
        }
      } catch (error) {
        console.error('Erreur lors de la génération automatique du code fournisseur:', error)
        // Si erreur, utiliser un timestamp comme fallback
        data.identification_fiscale = `FOURN-${Date.now()}`
      }
    }
    
    const response = await api.post<FournisseurResponse>('/fournisseurs', data)
    return response.data
  },

  // Récupérer tous les fournisseurs
  getAll: async (): Promise<FournisseursResponse> => {
    const response = await api.get<FournisseursResponse>('/fournisseurs')
    return response.data
  },

  // Récupérer un fournisseur par ID
  getById: async (id: number): Promise<FournisseurResponse> => {
    const response = await api.get<FournisseurResponse>(`/fournisseurs/${id}`)
    return response.data
  },

  // Mettre à jour un fournisseur
  update: async (id: number, data: Partial<FournisseurFormData>): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/fournisseurs/${id}`, data)
    return response.data
  },

  // Supprimer un fournisseur
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/fournisseurs/${id}`)
    return response.data
  },

  // Rechercher des fournisseurs
  search: async (query: string): Promise<FournisseursResponse> => {
    const response = await api.get<FournisseursResponse>(`/fournisseurs/search/${query}`)
    return response.data
  }
}
