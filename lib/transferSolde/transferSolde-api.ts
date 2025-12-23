// lib/transferSolde-api.ts
import api from '@/api/api'
import type { Utilisateur, TransfertFormData, ApiResponse } from './transferSolde-type'

let utilisateursCache: Utilisateur[] = []

// Charger tous les utilisateurs une seule fois (ou avec cache)
export const fetchUtilisateurs = async (): Promise<Utilisateur[]> => {
  if (utilisateursCache.length > 0) return utilisateursCache

  const response = await api.get<ApiResponse<Utilisateur[]>>('/utilisateurs')
  utilisateursCache = response.data.data || []
  return utilisateursCache
}

// Récupérer le solde actuel
export const getSoldeActuel = async (): Promise<number> => {
  const response = await api.get<ApiResponse<{ solde_actuel: number }>>('/solde-actuel')
  return response.data.data?.solde_actuel || 0
}

// Créer un transfert
export const createTransfert = async (
  data: TransfertFormData & { admin_id: number }
): Promise<ApiResponse> => {
  const response = await api.post<ApiResponse>('/transferts', data)
  return response.data
}