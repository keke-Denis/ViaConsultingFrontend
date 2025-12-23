// lib/soldeGenerale/soldeGenerale-api.ts
import api from "@/api/api";
import type { Transaction, CreateTransactionData } from "./soldeGenerale-type";

export const soldeGeneraleApi = {
  // Récupère TOUTES les transactions (on utilise la route existante /caissiers)
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get<{ data: Transaction[] }>("/caissiers");
    return response.data.data;
  },

  // Créer une transaction (inchangé)
  createTransaction: async (data: CreateTransactionData): Promise<Transaction> => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const utilisateur_id = user?.id;

    if (!utilisateur_id) throw new Error("Utilisateur non authentifié");

    const payload = {
      utilisateur_id,
      montant: data.montant,
      type: data.type,
      methode: data.methode,
      raison: data.raison,
      reference: data.reference || null,
    };

    const response = await api.post<{ data: Transaction }>("/caissiers", payload);
    return response.data.data;
  },
};