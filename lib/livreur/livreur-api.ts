// src/lib/livreur/livreur-api.ts

import api from '@/api/api'
import type { LivreurFormData, LivreurFromAPI, Livreur } from './livreur-types'

// Ajouter un livreur
export const ajouterLivreur = async (data: LivreurFormData): Promise<LivreurFromAPI> => {
  try {
    const response = await api.post<LivreurFromAPI>('/livreurs', data)
    const livreur = response.data

    console.log('Livreur ajouté avec succès :', livreur)
    return livreur
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout du livreur :', error.response?.data || error.message)
    throw error
  }
}

// Récupérer tous les livreurs
export const getLivreurs = async (): Promise<LivreurFromAPI[]> => {
  const response = await api.get<LivreurFromAPI[]>('/livreurs')
  return response.data
}

// Récupérer les livreurs d'un utilisateur
export const getLivreursByUser = async (userId: number): Promise<Livreur[]> => {
  const response = await api.get<Livreur[]>(`/livreurs/utilisateur/${userId}`)
  return response.data
}

// Supprimer un livreur
export const supprimerLivreur = async (id: number): Promise<void> => {
  await api.delete(`/livreurs/${id}`)
  console.log('Livreur supprimé (ID:', id, ')')
}

// Modifier un livreur
export const modifierLivreur = async (id: number, data: LivreurFormData): Promise<LivreurFromAPI> => {
  try {
    const response = await api.put<LivreurFromAPI>(`/livreurs/${id}`, data)
    const livreur = response.data

    console.log('Livreur modifié avec succès :', livreur)
    return livreur
  } catch (error: any) {
    console.error('Erreur lors de la modification du livreur :', error.response?.data || error.message)
    throw error
  }
}

// Mettre à jour un livreur (alias pour modifierLivreur, gardé pour la compatibilité)
export const updateLivreur = async (id: number, data: Partial<LivreurFormData>): Promise<Livreur> => {
  const response = await api.put<Livreur>(`/livreurs/${id}`, data)
  console.log('Livreur mis à jour :', response.data)
  return response.data
}