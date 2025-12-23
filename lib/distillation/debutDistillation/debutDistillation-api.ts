import api from '@/api/api'
import type { DistillationDto, ApiListResponse, ApiSingleResponse } from './debutDistillation-types'

// Route GET /distillations - Pour récupérer toutes les distillations
export const getDistillations = async (): Promise<ApiListResponse<DistillationDto[]>> => {
  const res = await api.get('/distillations')
  return res.data
}

// Route POST /distillations/{id}/demarrer - Pour démarrer une distillation
export const demarrerDistillation = async (distillationId: number, payload: any): Promise<ApiSingleResponse<DistillationDto>> => {
  const res = await api.post(`/distillations/${distillationId}/demarrer`, payload)
  return res.data
}

// Route POST /distillations/{id}/terminer - Pour terminer une distillation
export const terminerDistillation = async (distillationId: number, payload: any): Promise<ApiSingleResponse<DistillationDto>> => {
  const res = await api.post(`/distillations/${distillationId}/terminer`, payload)
  return res.data
}

// Fonction utilitaire pour filtrer par statut (fait côté frontend)
export const filterDistillationsByStatus = (distillations: DistillationDto[], status: 'en_attente' | 'en_cours' | 'termine') => {
  return distillations.filter(d => d.statut === status)
}