// lib/demandeSolde/demandeSolde-type.ts
export interface DemandeSolde {
  id: number
  utilisateur_id: number
  montant_demande: number
  raison: string
  statut: 'en_attente' | 'approuvee' | 'rejetee'
  admin_id?: number | null
  commentaire_admin?: string | null
  date: string
  created_at: string
  updated_at: string

  utilisateur?: {
    id: number
    nom: string
    prenom: string
    numero: string
    role: string
    CIN?: string
    localisation_id?: number
    localisation?: {
      id: number
      Nom: string
    }
  }

  admin?: {
    id: number
    nom: string
    prenom: string
  } | null
}

export interface CreateDemandeSoldeRequest {
  montant_demande: number
  raison: string
}

export interface TransfertRecu {
  id: number
  admin_id: number
  destinataire_id: number
  montant: number
  type_transfert: string
  raison?: string
  reference?: string
  created_at: string

  admin?: {
    id: number
    nom: string
    prenom: string
    numero?: string
  }
}