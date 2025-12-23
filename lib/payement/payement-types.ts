// lib/payement/payement-types.ts
export interface Fournisseur {
  id: string
  nom: string
  soldeDette: number
  statut: "actif" | "inactif"
  telephone?: string
  email?: string
}

export interface Paiement {
  id: string
  fournisseur: Fournisseur
  montant: number
  date: string
  statut: "payé" | "en_attente" | "annulé"
  methode: "espèces" | "virement" | "chèque"
  reference: string
  type: "avance" | "paiement_complet" | "acompte" | "règlement"
  description?: string
  montantDu?: number
  montantAvance?: number
  createdAt: string
  updatedAt: string
}

export interface PaiementStats {
  totalPaiements: number
  totalPayes: number
  totalEnAttente: number
  totalAvances: number
  totalDettes: number
}

export interface CreatePaiementData {
  fournisseurId: string
  montant: number
  type: Paiement["type"]
  methode: Paiement["methode"]
  description?: string
  date: string
}

export interface UpdatePaiementData extends Partial<CreatePaiementData> {
  statut?: Paiement["statut"]
}
