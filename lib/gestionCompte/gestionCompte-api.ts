// lib/gestionCompte/gestionCompte-api.ts
import api from "@/api/api"

export interface CaissierTransaction {
  id: number
  solde: number
  montant: number
  type: "revenu" | "depense"
  date: string
  created_at: string
  utilisateur: {
    id: number
    nom: string
    prenom: string
  }
}

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

export const gestionCompteApi = {
  /**
   * Récupère le solde actuel en prenant la DERNIÈRE transaction enregistrée
   * Utilise la route existante : GET /caissiers/{id}
   */
  getSoldeActuel: async (): Promise<number> => {
    try {
      // 1. D'abord, on récupère la liste complète pour trouver l'ID le plus élevé
      const listResponse = await api.get<{ success: true; data: CaissierTransaction[] }>("/caissiers")

      if (!listResponse.data.data || listResponse.data.data.length === 0) {
        return 0 // Aucune transaction → solde = 0
      }

      // 2. On prend la transaction la plus récente (triée par created_at DESC côté backend)
      const derniereTransaction = listResponse.data.data[0]

      // 3. Le champ "solde" est déjà calculé dans le modèle → on le retourne directement
      return derniereTransaction.solde

    } catch (error: any) {
      console.error("Erreur lors de la récupération du solde:", error.response?.data || error)

      // Si erreur 404 ou autre, on retourne 0 pour ne pas bloquer l'UI
      if (error.response?.status === 404 || error.response?.data?.message?.includes("non trouvée")) {
        return 0
      }

      throw error
    }
  },

  // Historique des demandes (inchangé – fonctionne parfaitement)
  getMesDemandes: async (utilisateurId: number): Promise<DemandeSoldeHistorique[]> => {
    try {
      const response = await api.get<{ success: true; data: DemandeSoldeHistorique[] }>(
        `/demande-soldes/utilisateur/${utilisateurId}`
      )
      return response.data.data
    } catch (error: any) {
      console.error("Erreur historique demandes:", error.response?.data || error)
      throw error
    }
  },
}