// lib/gestionCompte/solde-user-type.ts

export interface SoldeUser {
  utilisateur_id: number;
  solde: number;
  utilisateur?: {
    id: number;
    nom: string;
    prenom: string;
    numero?: string;
    role?: string;
  } | null;
}

export interface SoldeUserApiResponse {
  success: true;
  data: SoldeUser;
  message: string;
}

export interface SoldesListApiResponse {
  success: true;
  data: SoldeUser[];
  message: string;
}