// lib/gestionCompte/gestionCompte-type.ts
export interface DemandeSoldeHistorique {
  id: number
  utilisateur_id: number
  montant_demande: number
  raison: string
  statut: "en_attente" | "approuvee" | "rejetee"
  date: string
  created_at: string
  updated_at: string
  commentaire_admin?: string | null
  admin?: {
    id: number
    nom: string
    prenom: string
  } | null
}