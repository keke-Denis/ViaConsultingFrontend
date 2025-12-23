export interface FicheLivraison {
  id: number
  numero?: string
  created_at?: string
  date_livraison?: string
  type_matiere?: string
  quantite_a_expedier?: number
  quantite_a_livrer?: number
  stockpv?: { type_matiere?: string }
  livreur?: any
  distilleur_info?: { site_collecte?: string }
  siteCollecte?: { Nom?: string }
}

export interface ExpeditionDto {
  id: number
  statut: string
  date_expedition?: string | null
  date_reception?: string | null
  quantite_expediee?: string | number
  quantite_recue?: string | number
  type_matiere?: string
  fiche_livraison_id?: number
  ficheLivraison?: FicheLivraison
}

export interface ApiListResponse<T> {
  success: boolean
  data: T
  count?: number
  stats?: Record<string, any>
  message?: string
}

export interface ApiSingleResponse<T> {
  success: boolean
  data: T
  message?: string
}
