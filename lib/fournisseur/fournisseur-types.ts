
// lib/fournisseur/fournisseur-types.ts
export interface Fournisseur {
  id: number
  nom: string
  prenom: string
  adresse: string
  identification_fiscale: string
  cin?: string
  localisation_id: number
  contact: string
  created_at: string
  updated_at: string
  localisation?: {
    id: number
    Nom: string
    created_at: string
    updated_at: string
  }
}

export interface FournisseurFormData {
  nom: string
  prenom: string
  adresse: string
  identification_fiscale: string
  cin?: string
  localisation_id: number
  contact: string
}

export interface FournisseurResponse {
  success: boolean
  message: string
  data?: Fournisseur
}

export interface FournisseursResponse {
  success: boolean
  data: Fournisseur[]
}

export interface ApiResponse {
  success: boolean
  message: string
}