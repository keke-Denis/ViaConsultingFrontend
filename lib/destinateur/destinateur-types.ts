// lib/destinateur/destinateur-types.ts
export interface Destinateur {
  id: number
  nom_entreprise: string
  nom_prenom: string
  contact: string
  observation: string | null
  created_by: number
  created_at: string
  updated_at: string
  createur?: {
    id: number
    nom: string
    prenom: string
    role: string
  }
}

export type DestinateurFormData = {
  nom_entreprise: string
  nom_prenom: string
  contact: string
  observation?: string
}