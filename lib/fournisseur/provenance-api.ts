import api from '@/api/api'

export interface Provenance {
  id: number
  Nom: string
  created_at: string
  updated_at: string
}

export interface ProvenancesResponse {
  success: boolean
  data: Provenance[]
  message?: string
}

export interface ProvenanceCreateResponse {
  success: boolean
  data: Provenance
  message?: string
}

export interface ProvenanceCreateRequest {
  Nom: string
}

export interface ProvenanceUpdateRequest {
  Nom: string
}

export const provenanceAPI = {
  getAll: async (): Promise<Provenance[]> => {
    const response = await api.get<ProvenancesResponse>('/provenances')
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors du chargement des provenances')
    }
    return response.data.data
  },

  create: async (nom: string): Promise<Provenance> => {
    const response = await api.post<ProvenanceCreateResponse>('/provenances', { Nom: nom })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la création de la provenance')
    }
    return response.data.data
  },

  getById: async (id: number): Promise<Provenance> => {
    const response = await api.get<ProvenanceCreateResponse>(`/provenances/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la récupération de la provenance')
    }
    return response.data.data
  },

  update: async (id: number, nom: string): Promise<Provenance> => {
    const response = await api.put<ProvenanceCreateResponse>(`/provenances/${id}`, { Nom: nom })
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la mise à jour de la provenance')
    }
    return response.data.data
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/provenances/${id}`)
    if (!response.data.success) {
      throw new Error(response.data.message || 'Erreur lors de la suppression de la provenance')
    }
  }
}
