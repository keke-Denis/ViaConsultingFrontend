import api from '@/api/api'

// Types simplifiés
export interface ExpeditionLocal {
  id: number
  documentNumber: string
  dateEnvoi: string | null
  dateArrivee: string | null
  typeMatierePremiere: string
  quantite: number
  quantiteRecue?: number | null
  lieuDepart: string
  status: 'receptionné' | 'en attente'
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

// Route pour afficher toutes les expéditions (GET /expeditions)
export async function getExpeditions() {
  const res = await api.get<ApiListResponse<any[]>>('/expeditions')
  return res.data
}

// Route pour marquer comme réceptionné (POST /expeditions/{id}/receptionner)
export async function receptionnerExpedition(expeditionId: number, quantiteRecue: number) {
  const res = await api.post<ApiSingleResponse<any>>(`/expeditions/${expeditionId}/receptionner`, { 
    quantite_recue: quantiteRecue 
  })
  return res.data
}