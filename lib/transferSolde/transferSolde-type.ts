// lib/transferSolde-type.ts
export interface Utilisateur {
  id: number
  nom: string
  prenom: string
  numero: string
  role: string
}

export interface TransfertFormData {
  destinataire_id: number
  montant: number
  type_transfert: 'especes' | 'mobile' | 'virement'
  reference?: string
  raison?: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  errors?: Record<string, string[]>
  solde_actuel?: number
}