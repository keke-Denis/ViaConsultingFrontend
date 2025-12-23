// lib/historiqueTransaction/historiqueTransaction-type.ts
export type TransactionType = "revenu" | "depense";

export interface HistoriqueTransaction {
  id: number;
  date: string;                    
  type: TransactionType;
  raison: string;
  montant: number;
  methode: string;                 
  reference: string;
  utilisateur: string;             
  details?: string;                
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}