export interface ReceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface Localisation {
  id: number;
  Nom: string;
}

export interface Fournisseur {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
}

export interface PVReceptionFormData {
  type: 'FG' | 'CG' | 'GG';
  date_reception: string;
  utilisateur_id: number;
  fournisseur_id: number;
  localisation_id: number;
  poids_brut: number;
  prix_unitaire: number;
  taux_humidite?: number;
  avance: number;
  notes?: string;
  poids_packaging?: number;
  taux_dessiccation?: number;
}
