// Types pour les réceptions (frontend)

export type ReceptionStatut = 'en attente' | 'receptionne' | 'annule' | string

export interface ReceptionSourceFiche {
	type: 'fiche_livraison'
	nom: string
	id: number | string
	quantite_totale?: number
	livreur?: string
	date_livraison?: string
	destination?: string
	type_produit?: string
}

export interface ReceptionSourceTransport {
	type: 'transport'
	nom: string
	id: number | string
	quantite_totale?: number
	livreur?: string
	date_livraison?: string
	destination?: string
	type_matiere?: string
	distillation_id?: number | null
}

export type ReceptionSource = ReceptionSourceFiche | ReceptionSourceTransport | { type: 'inconnu'; nom: string }

export interface Reception {
	id: number
	fiche_livraison_id?: number | null
	transport_id?: number | null
	vendeur_id?: number | null
	date_reception?: string | null
	heure_reception?: string | null
	statut?: ReceptionStatut
	observations?: string | null
	quantite_recue?: number | null
	lieu_reception?: string | null
	type_livraison?: string | null
	signataire?: string | null
	date_receptionne?: string | null
	// champs auxiliaires ajoutés par le backend
	informations_source?: ReceptionSource | null
	peut_marquer_receptionne?: boolean
	// relations éventuelles
	ficheLivraison?: any
	transport?: any
	vendeur?: any
	created_at?: string
	updated_at?: string
}

export interface ApiResponse<T = any> {
	success: boolean
	message?: string
	data?: T
	stats?: any
	count?: number
	errors?: any
}

export interface ListReceptionsParams {
	page?: number
	per_page?: number
	statut?: string
	vendeur_id?: number
}
