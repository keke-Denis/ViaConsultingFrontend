// lib/soldeGenerale/soldeGenerale-type.ts
export type TransactionType = "revenu" | "depense";

export interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  numero: string;
  role: string;
}

export interface Transaction {
  id: number;
  utilisateur_id: number;
  solde: number;
  date: string;
  montant: number;
  type: TransactionType;
  raison: string;
  methode: string;
  reference: string | null;
  created_at: string;
  updated_at: string;
  utilisateur: Utilisateur;
}

export interface CreateTransactionData {
  montant: number;
  type: TransactionType;
  methode: string;
  raison: string;
  reference?: string | null;
  notes?: string | null;
}