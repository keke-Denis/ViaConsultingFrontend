// Types pour la distillation
export interface ExpeditionForDistillation {
  id: number
  fiche_livraison_id?: number
  numero?: string
  type_matiere?: string
  quantite_recue?: string | number
  quantite_expediee?: string | number
  date_reception?: string | null
  ficheLivraison?: any
}

export interface DistillationDto {
  id: number
  expedition_id?: number
  statut?: string
  numero_pv?: string
  type_matiere_premiere?: string
  quantite_recue?: string | number
  date_debut?: string | null
  date_fin?: string | null
  quantite_traitee?: string | number
  quantite_resultat?: string | number
  expedition?: any
  // Champs du backend pour démarrer/terminer
  id_ambalic?: string
  poids_distiller?: number
  usine?: string
  duree_distillation?: number
  poids_chauffage?: number
  carburant?: string
  main_oeuvre?: number
  reference?: string
  matiere?: string
  site?: string
  type_he?: string
  observations?: string
  rendement_formate?: string
  peut_demarrer?: boolean
  peut_terminer?: boolean
}

// Correction des types de réponse API
export interface ApiListResponse<T = any> {
  success: boolean
  data: T  // Le backend retourne directement le tableau
  count?: number
  stats?: Record<string, any>
  message?: string
  distilleur_info?: {
    id: number
    nom_complet: string
    site_collecte: string
  }
}

export interface ApiSingleResponse<T = any> {
  success: boolean
  data: T  // Données individuelles
  message?: string
  distilleur_info?: {
    id: number
    nom_complet: string
    site_collecte: string
  }
  rendement?: string
}

// Pour spécifier le type de données retournées par getDistillations
export interface DistillationListData {
  distillations: DistillationDto[]
  stats?: {
    total: number
    en_attente: number
    en_cours: number
    terminees: number
    quantite_recue_totale: number
    quantite_resultat_totale: number
  }
  count: number
}

// Types pour les payloads des requêtes
export interface DemarrerDistillationPayload {
  id_ambalic: string
  date_debut: string
  poids_distiller: number
  usine: string
  duree_distillation: number
  poids_chauffage: number
  carburant: string
  main_oeuvre: number
}

export interface TerminerDistillationPayload {
  reference: string
  matiere: string
  site: string
  quantite_traitee: number
  date_fin: string
  type_he: string
  quantite_resultat: number
  observations?: string
}