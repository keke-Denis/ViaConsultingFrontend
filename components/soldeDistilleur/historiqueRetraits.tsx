"use client";

import { Input } from "@/components/ui/input";
import { Search, ArrowUpRight, ArrowDownRight, Calendar, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import soldeDistilleurApi from "@/lib/soldeDistilleur/soldeDistilleur-api";

const COLOR = "#72bc21";

export default function HistoriqueRetraits() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await soldeDistilleurApi.fetchHistoriqueRetraits();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Erreur fetching historique retraits:", e);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredTransactions = transactions.filter((t) =>
    Object.values(t || {}).some((value) =>
      String(value ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} à ${hours}:${minutes}`;
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return formatDate(dateString);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Chargement de l'historique des retraits...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#72bc21]">
          Historique des retraits
          <br />
          <span className="text-gray-500 text-lg font-normal">Historique des retraits du distillateur</span>
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un retrait..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="divide-x divide-gray-200 border-t border-gray-200" />

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <div className="divide-y divide-gray-200 max-h-[700px] overflow-y-auto">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="mb-4 text-4xl">📋</div>
              Aucune transaction trouvée
            </div>
          ) : (
            filteredTransactions.map((tr, idx) => (
              <div key={tr.id ?? tr.reference ?? `rt-${idx}`} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg text-[#72bc21]">{tr.reference || `RT-${tr.id}`}</span>
                    <span className="text-gray-400">•</span>
                    <span className="flex items-center gap-1 text-gray-700"><Calendar className="h-4 w-4" />{formatDate(tr.date_operation || tr.created_at || tr.date || tr.updated_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-gray-600">
                    {tr.type === "revenu" ? <ArrowDownRight className="h-4 w-4 text-green-600" /> : <ArrowUpRight className="h-4 w-4 text-red-600" />}
                    <span className="text-sm font-medium text-gray-700">{tr.type === "revenu" ? "Revenu" : "Dépense"}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{tr.motif || tr.raison || tr.description || '-'}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Montant</p>
                      <p className={tr.type === "revenu" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{tr.type === "revenu" ? '+' : '-'}{formatCurrency(Number(tr.montant ?? tr.montant_operation ?? 0))}</p>
                    </div>

                    <div className="ml-6">
                      <p className="text-sm font-medium text-gray-700">Référence</p>
                      <p className="font-mono text-sm text-gray-700">{tr.reference || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    <span>Créé le {formatDate(tr.date_operation || tr.created_at || tr.date || tr.updated_at)} • ID: {tr.id}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="text-sm text-gray-500">{filteredTransactions.length} retrait{filteredTransactions.length > 1 ? 's' : ''} trouvé{filteredTransactions.length > 1 ? 's' : ''}</div>
      )}
    </div>
  );
}
