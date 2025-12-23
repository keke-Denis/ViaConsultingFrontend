// lib/localisation/localisation-api.ts
import api from '@/api/api'

export interface Localisation {
  id: number
  Nom: string
  created_at: string
  updated_at: string
}

export interface LocalisationsResponse {
  success: boolean
  data: Localisation[]
  message?: string
}

export interface LocalisationCreateResponse {
  success: boolean
  data: Localisation
  message?: string
}

export interface LocalisationCreateRequest {
  Nom: string
}

export const localisationAPI = {
  getAll: async (): Promise<Localisation[]> => {
    const response = await api.get<LocalisationsResponse>('/localisations')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors du chargement des localisations')
    }
    return response.data.data
  },

  create: async (nom: string): Promise<Localisation> => {
    const response = await api.post<LocalisationCreateResponse>('/localisations', { Nom: nom })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création de la localisation')
    }
    return response.data.data
  },

  // Optionnel : autres méthodes si besoin
  getById: async (id: number): Promise<Localisation> => {
    const response = await api.get<LocalisationCreateResponse>(`/localisations/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la récupération de la localisation')
    }
    return response.data.data
  }
}
