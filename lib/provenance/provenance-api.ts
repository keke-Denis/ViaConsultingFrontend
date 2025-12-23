import api from '@/api/api'
import type { Provenance, ProvenanceResponse, ProvenancesResponse, ApiResponse } from './provenance-types'

export const provenanceAPI = {
  // Récupérer toutes les provenances
  getAll: async (): Promise<ProvenancesResponse> => {
    const response = await api.get<ProvenancesResponse>('/provenances')
    return response.data
  },

  // Récupérer une provenance par ID
  getById: async (id: number): Promise<ProvenanceResponse> => {
    const response = await api.get<ProvenanceResponse>(`/provenances/${id}`)
    return response.data
  },

  // Créer une provenance
  create: async (data: { Nom: string }): Promise<ProvenanceResponse> => {
    const response = await api.post<ProvenanceResponse>('/provenances', data)
    return response.data
  },

  // Mettre à jour une provenance
  update: async (id: number, data: { Nom: string }): Promise<ApiResponse> => {
    const response = await api.put<ApiResponse>(`/provenances/${id}`, data)
    return response.data
  },

  // Supprimer une provenance
  delete: async (id: number): Promise<ApiResponse> => {
    const response = await api.delete<ApiResponse>(`/provenances/${id}`)
    return response.data
  }
}