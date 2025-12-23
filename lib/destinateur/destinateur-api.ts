// lib/destinateur/destinateur-api.ts
import api from '@/api/api'
import type { Destinateur, DestinateurFormData } from './destinateur-types'

export const destinateurApi = {
  // Liste tous les destinataires
  async getAll(): Promise<Destinateur[]> {
    const res = await api.get<Destinateur[]>('/destinateurs')
    return res.data
  },

  // Création → Laravel renvoie directement le modèle (pas { data: ... })
  async create(data: DestinateurFormData): Promise<Destinateur> {
    const res = await api.post<Destinateur>('/destinateurs', data)
    console.log('Destinataire ajouté avec succès :', res.data)
    return res.data
  },

  // Modification → même chose
  async update(id: number, data: Partial<DestinateurFormData>): Promise<Destinateur> {
    const res = await api.put<Destinateur>(`/destinateurs/${id}`, data)
    console.log('Destinataire modifié avec succès :', res.data)
    return res.data
  },

  // Suppression
  async delete(id: number): Promise<void> {
    await api.delete(`/destinateurs/${id}`)
    console.log('Destinataire supprimé (ID):', id)
  }
}