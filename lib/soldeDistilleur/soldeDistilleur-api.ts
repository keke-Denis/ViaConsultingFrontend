import api from '@/api/api'

export interface RetraitPayload {
  montant: number
  motif?: string
}

export interface RetraitResponse {
  id: number | string
  reference?: string
  type?: string
  montant: number
  solde_avant?: number
  solde_apres?: number
  motif?: string
  date_operation?: string
  utilisateur?: { id?: number; nom?: string; prenom?: string; numero?: string }
}

export const soldeDistilleurApi = {
  retrait: async (payload: RetraitPayload): Promise<RetraitResponse> => {
    const resp = await api.post('/gestion-solde-distilleur/retrait', payload)
    return resp.data?.data?.transaction || resp.data?.data || resp.data
  },

  monSolde: async () => {
    const resp = await api.get('/gestion-solde-distilleur/mon-solde')
    return resp.data?.data || {}
  },

  // Some backends expose a separate historique route. Try common names, otherwise return empty.
  fetchHistoriqueRetraits: async (): Promise<RetraitResponse[]> => {
    const candidates = [
      '/gestion-solde-distilleur/historique-retraits',
    ]

    for (const url of candidates) {
      try {
        const r = await api.get(url)
        const data = r.data?.data || r.data
        if (Array.isArray(data)) return data
        // sometimes payload is { historique: [...] }
        for (const key of ['historique', 'historique_retraits', 'items', 'transactions']) {
          if (data && Array.isArray((data as any)[key])) return (data as any)[key]
        }
      } catch (e) {
        // try next
      }
    }
    return []
  },
}

export default soldeDistilleurApi
