export interface Provenance {
  id: number
  Nom: string
  created_at?: string
  updated_at?: string
}

export interface ProvenanceResponse {
  success: boolean
  message: string
  data?: Provenance
}

export interface ProvenancesResponse {
  success: boolean
  data: Provenance[]
}

export interface ApiResponse {
  success: boolean
  message: string
}