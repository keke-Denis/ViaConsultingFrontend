// lib/TestHuille/fiche-livraison-types.ts  (renomme ou remplace le fichier)

export interface CreateFicheLivraisonPayload {
  fiche_reception_id: number
  date_heure_livraison: string
  livreur_id: number
  destinateur_id: number
  fonction_destinataire: string  // ← Obligatoire côté Laravel
  lieu_depart: string
  destination: string
  type_produit: string
  poids_net: number
  ristourne_regionale?: number | null
  ristourne_communale?: number | null
}

export interface HEFicheLivraison {
  id: number
  fiche_reception_id: number
  date_heure_livraison: string
  lieu_depart: string
  destination: string
  type_produit: string
  poids_net: number
  fonction_destinataire: string
  ristourne_regionale?: number | null
  ristourne_communale?: number | null
  created_at?: string
  updated_at?: string

  livreur?: {
    id: number
    prenom: string
    nom: string
    telephone: string
    numero_vehicule?: string
  }
  destinateur?: {
    id: number
    nom_prenom: string
    contact: string
    nom_entreprise?: string
    fonction?: string
  }
  ficheReception?: any
}

export interface FicheLivraisonApiResponse {
  success: boolean
  message: string
  livraison?: HEFicheLivraison
  nouveau_statut?: string
}