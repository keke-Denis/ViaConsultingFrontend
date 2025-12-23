// src/lib/livreur/livreur-types.ts

export interface LivreurFormData {
  nom: string
  prenom: string
  cin: string
  date_naissance: string
  lieu_naissance: string
  date_delivrance_cin: string
  contact_famille: string
  telephone: string
  numero_vehicule: string
  observation: string
  zone_livraison: string
}

export interface Createur {
  id: number
  nom: string
  prenom: string
  role: string
}

export interface LivreurFromAPI {
  id: number
  nom: string
  prenom: string
  cin: string
  date_naissance: string
  lieu_naissance: string
  date_delivrance_cin: string
  contact_famille: string
  telephone: string
  numero_vehicule: string
  observation: string
  zone_livraison: string
  created_at: string
  updated_at: string
  createur: Createur
}

export interface Livreur {
  id: number
  nom: string
  prenom: string
  cin: string
  date_naissance: string
  lieu_naissance: string
  date_delivrance_cin: string
  contact_famille: string
  telephone: string
  numero_vehicule: string
  observation: string
  zone_livraison: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
}