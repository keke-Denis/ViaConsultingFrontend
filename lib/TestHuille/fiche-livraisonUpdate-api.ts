// lib/TestHuille/fiche-livraison-api.ts

import api from '@/api/api'
import type { CreateFicheLivraisonPayload, FicheLivraisonApiResponse } from './fiche-livraisonUpdate-types'

export const createFicheLivraison = async (
  payload: CreateFicheLivraisonPayload
): Promise<FicheLivraisonApiResponse> => {
  const response = await api.post<FicheLivraisonApiResponse>('/he-fiche-livraisons', payload)
  return response.data
}

export const getFicheLivraisonByFiche = async (ficheId: number) => {
  const response = await api.get(`/he-fiche-livraisons/fiche/${ficheId}`)
  return response.data
}