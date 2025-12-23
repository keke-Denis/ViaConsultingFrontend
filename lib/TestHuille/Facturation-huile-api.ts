import api from "@/api/api"

export interface FacturationData {
  fiche_reception_id: number
  montant_total: number
  avance_versee: number
  controller_qualite: string
  responsable_commercial: string
}

export interface FacturationResponse {
  numero_facture: string
  id: number
  fiche_reception_id: number
  montant_total: number
  avance_versee: number
  reste_a_payer: number
  controller_qualite: string
  responsable_commercial: string
  created_at: string
  updated_at: string
  fiche_reception?: {
    id: number
    numero_document: string
    poids_brut: number
    poids_agreer?: number
    prix_total?: number
    prix_unitaire?: number
    poids_net?: number
    statut: string
    utilisateur_id: number
    fournisseur?: {
      id: number
      nom: string
      prenom: string
      contact: string
    }
    site_collecte?: {
      id: number
      Nom: string
    }
    utilisateur?: {
      id: number
      name: string
      email: string
      role: string
    }
  }
}

export interface FacturationCompleteResponse {
  success: boolean
  message: string
  data: FacturationResponse
  nouveau_statut: string
  solde_info?: {
    solde_avant: number
    solde_apres: number
    montant_debite: number
  }
}

export interface FacturationUpdateResponse {
  success: boolean
  message: string
  data: FacturationResponse
  nouveau_statut_fiche?: string
}

export interface PaiementData {
  montant_paiement: number
}

export interface SoldeInfo {
  solde_actuel: number
  avance_requise: number
  solde_insuffisant: boolean
}

export interface ValidationResponse {
  valid: boolean
  message: string
  details?: any
  solde_info?: SoldeInfo
}

export const facturationService = {
  // Créer une facturation (avec vérification automatique du prix total depuis la fiche)
  creerFacturation: async (data: FacturationData): Promise<FacturationCompleteResponse> => {
    const response = await api.post(`/he-facturations`, data)
    return response.data
  },

  // Valider avant création (vérifie solde utilisateur, prix total, etc.)
  validerCreationFacturation: async (ficheId: number, avanceVersee: number): Promise<ValidationResponse> => {
    try {
      // Récupérer la fiche pour obtenir le prix total et l'utilisateur
      const ficheResponse = await api.get(`/fiche-receptions/${ficheId}`)
      const fiche = ficheResponse.data.data
      
      if (!fiche) {
        return {
          valid: false,
          message: 'Fiche de réception non trouvée'
        }
      }

      // Vérifier si la fiche est acceptée
      if (fiche.statut !== 'Accepté') {
        return {
          valid: false,
          message: 'Seules les fiches avec statut "Accepté" peuvent être facturées'
        }
      }

      // Récupérer le prix total depuis la fiche
      const prixTotalFiche = fiche.prix_total || 0
      
      // Vérifier si le prix total existe
      if (prixTotalFiche <= 0) {
        return {
          valid: false,
          message: 'La fiche de réception n\'a pas de prix total défini'
        }
      }

      // Vérifier le solde de l'utilisateur
      const soldeResponse = await api.get(`/soldes-utilisateurs/${fiche.utilisateur_id}`)
      const soldeActuel = soldeResponse.data.success ? soldeResponse.data.data.solde : 0

      // Vérifications
      if (avanceVersee > prixTotalFiche) {
        return {
          valid: false,
          message: `L'avance versée (${avanceVersee.toLocaleString()} Ar) ne peut pas dépasser le prix total (${prixTotalFiche.toLocaleString()} Ar)`
        }
      }

      if (soldeActuel < avanceVersee) {
        return {
          valid: false,
          message: `Solde utilisateur insuffisant. Solde disponible: ${soldeActuel.toLocaleString()} Ar - Avance requise: ${avanceVersee.toLocaleString()} Ar`,
          solde_info: {
            solde_actuel: soldeActuel,
            avance_requise: avanceVersee,
            solde_insuffisant: true
          }
        }
      }

      // Calculer le reste à payer
      const resteAPayer = prixTotalFiche - avanceVersee

      return {
        valid: true,
        message: 'Validation réussie',
        details: {
          prix_total_fiche: prixTotalFiche,
          avance_versee: avanceVersee,
          reste_a_payer: resteAPayer,
          solde_utilisateur: soldeActuel,
          statut_paiement: determineStatutPaiement(avanceVersee, resteAPayer)
        }
      }

    } catch (error: any) {
      console.error('Erreur validation facturation:', error)
      return {
        valid: false,
        message: error.response?.data?.message || 'Erreur lors de la validation'
      }
    }
  },

  // Récupérer une facturation par son ID
  getFacturation: async (id: number): Promise<FacturationResponse> => {
    const response = await api.get(`/he-facturations/${id}`)
    return response.data.data
  },

  // Récupérer la facturation d'une fiche (alias pour compatibilité)
  getFacturationByFiche: async (ficheId: number): Promise<FacturationResponse> => {
    const response = await api.get(`/fiche-receptions/${ficheId}/facturation`)
    return response.data.data
  },

  // Mettre à jour une facturation
  updateFacturation: async (id: number, data: Partial<Omit<FacturationData, 'fiche_reception_id'>>): Promise<FacturationUpdateResponse> => {
    const response = await api.put(`/he-facturations/${id}`, data)
    return response.data
  },

  // Supprimer une facturation
  deleteFacturation: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/he-facturations/${id}`)
    return response.data
  },

  // Récupérer toutes les facturations
  getAll: async (): Promise<FacturationResponse[]> => {
    try {
      const response = await api.get("/he-facturations")
      return response.data.data
    } catch (error: any) {
      console.error('Erreur récupération facturations:', error)
      return []
    }
  },

  // Récupérer les impayés
  getImpayes: async (): Promise<FacturationResponse[]> => {
    try {
      const response = await api.get("/he-facturations/impayes")
      return response.data.data
    } catch (error: any) {
      console.error('Erreur récupération facturations impayées:', error)
      return []
    }
  },

  // Récupérer par statut de paiement
  getByStatutPaiement: async (statut: string): Promise<FacturationResponse[]> => {
    try {
      const response = await api.get(`/he-facturations/statut/${statut}`)
      return response.data.data
    } catch (error: any) {
      console.error('Erreur récupération par statut:', error)
      return []
    }
  },

  // Ajouter un paiement supplémentaire
  ajouterPaiement: async (id: number, montant: number): Promise<FacturationUpdateResponse> => {
    const response = await api.post(`/he-facturations/${id}/paiement`, {
      montant_paiement: montant
    })
    return response.data
  },

  // Récupérer les fiches acceptées sans facturation
  getFichesAccepteesSansFacturation: async (): Promise<any[]> => {
    try {
      const response = await api.get("/fiche-receptions/statut/Accepté")
      const fiches = response.data.data
      
      // Filtrer les fiches sans facturation
      const fichesSansFacturation = await Promise.all(
        fiches.map(async (fiche: any) => {
          try {
            const facturationResponse = await api.get(`/fiche-receptions/${fiche.id}/facturation`)
            // Si on arrive ici, la fiche a une facturation
            return null
          } catch (error: any) {
            // Si erreur 404, pas de facturation
            if (error.response?.status === 404) {
              return fiche
            }
            return null
          }
        })
      )

      return fichesSansFacturation.filter(Boolean)
    } catch (error: any) {
      console.error('Erreur récupération fiches sans facturation:', error)
      return []
    }
  },

  // Récupérer le prix total et informations d'une fiche
  getInfosFichePourFacturation: async (ficheId: number): Promise<{
    prix_total: number
    prix_unitaire?: number
    poids_net?: number
    poids_agreer?: number
    utilisateur_id: number
    fournisseur?: any
    site_collecte?: any
  }> => {
    try {
      const response = await api.get(`/fiche-receptions/${ficheId}`)
      const fiche = response.data.data
      
      return {
        prix_total: fiche.prix_total || 0,
        prix_unitaire: fiche.prix_unitaire,
        poids_net: fiche.poids_net,
        poids_agreer: fiche.poids_agreer,
        utilisateur_id: fiche.utilisateur_id,
        fournisseur: fiche.fournisseur,
        site_collecte: fiche.site_collecte
      }
    } catch (error: any) {
      console.error('Erreur récupération infos fiche:', error)
      throw error
    }
  }
}

// Fonction utilitaire pour déterminer le statut de paiement
const determineStatutPaiement = (avanceVersee: number, resteAPayer: number): string => {
  if (resteAPayer <= 0) {
    return 'payé' // Paiement complet
  } else if (avanceVersee > 0 && resteAPayer > 0) {
    return 'payement incomplète' // Paiement partiel
  } else {
    return 'en attente de paiement' // Aucun paiement
  }
}

// Utilitaires pour les impayés
export const facturationUtils = {
  formaterMontant: (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant) + ' Ar'
  },

  calculerPourcentagePaye: (montantPaye: number, montantTotal: number): number => {
    if (montantTotal <= 0) return 0
    return Math.round((montantPaye / montantTotal) * 100)
  },

  validerPaiement: (montantPaiement: number, resteAPayer: number): string[] => {
    const erreurs: string[] = []

    if (!montantPaiement || montantPaiement <= 0) {
      erreurs.push('Le montant à payer est requis et doit être positif')
    }

    if (montantPaiement > resteAPayer) {
      erreurs.push(`Le montant ne peut pas dépasser ${facturationUtils.formaterMontant(resteAPayer)}`)
    }

    return erreurs
  },

  // Calculer automatiquement l'avance à verser selon des règles métier
  calculerAvanceSuggestion: (montantTotal: number, regle: '50%' | '75%' | '100%' = '50%'): number => {
    switch (regle) {
      case '50%':
        return Math.round(montantTotal * 0.5)
      case '75%':
        return Math.round(montantTotal * 0.75)
      case '100%':
        return montantTotal
      default:
        return Math.round(montantTotal * 0.5)
    }
  },

  // Vérifier si une fiche peut être facturée
  verifierFicheFacturable: (fiche: any): { facturable: boolean; message: string } => {
    if (!fiche) {
      return { facturable: false, message: 'Fiche non trouvée' }
    }

    if (fiche.statut !== 'Accepté') {
      return { facturable: false, message: 'La fiche doit avoir le statut "Accepté"' }
    }

    if (!fiche.prix_total || fiche.prix_total <= 0) {
      return { facturable: false, message: 'Le prix total de la fiche n\'est pas défini' }
    }

    return { facturable: true, message: 'Fiche prête pour la facturation' }
  }
}

// Alias pour compatibilité
export const impayeUtils = facturationUtils