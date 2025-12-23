// lib/historiqueTransaction/historiqueTransaction-api.ts
import api from "@/api/api";
import type { HistoriqueTransaction, ApiResponse } from "./historiqueTransaction-type";

export const fetchHistoriqueTransactions = async (): Promise<HistoriqueTransaction[]> => {
  try {
    // 1. Récupérer les mouvements de caisse (revenus + dépenses)
    const caisseResp = await api.get<ApiResponse<any[]>>("/caissiers");
    const transfertsResp = await api.get<ApiResponse<any[]>>("/transferts");

    const mouvementsCaisse = caisseResp.data.data || [];
    const transferts = transfertsResp.data.data || [];

    const transactions: HistoriqueTransaction[] = [];
    mouvementsCaisse.forEach((item: any) => {
      const utilisateur = item.utilisateur
        ? `${item.utilisateur.prenom} ${item.utilisateur.nom}`
        : "Système";

      transactions.push({
        id: item.id,
        date: item.date || item.created_at,
        type: item.type === "revenu" ? "revenu" : "depense",
        raison: item.raison || (item.type === "revenu" ? "Revenu caisse" : "Dépense caisse"),
        montant: Number(item.montant),
        methode: item.methode || "Inconnu",
        reference: item.reference || `CAISSE-${item.id}`,
        utilisateur,
      });
    });

    // --- Transferts (toujours des dépenses de la caisse) ---
    transferts.forEach((t: any) => {
      const admin = t.admin
        ? `${t.admin.prenom} ${t.admin.nom}`
        : "Admin";
      const destinataire = t.destinataire
        ? `${t.destinataire.prenom} ${t.destinataire.nom}`
        : "Inconnu";

      const methodeMap: Record<string, string> = {
        especes: "Espèces",
        mobile: "Mobile Money",
        virement: "Virement",
      };

      transactions.push({
        id: t.id + 100000,
        date: t.created_at,
        type: "depense",
        raison: t.raison || `Transfert vers ${destinataire}`,
        montant: Number(t.montant),
        methode: methodeMap[t.type_transfert] || t.type_transfert,
        reference: t.reference || `TRF-${t.id}`,
        utilisateur: admin,
        details: `→ ${destinataire}`,
      });
    });

    // Tri par date décroissante
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return transactions;
  } catch (error) {
    console.error("Erreur lors du chargement de l'historique", error);
    return [];
  }
};