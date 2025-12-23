// components/solde/historique-transactions-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Calendar, User, FileText, CreditCard, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NouvelleTransactionModal from "./nouvelle-transaction-modal";
import { soldeGeneraleApi } from "@/lib/soldeGenerale/soldeGenerale-api";
import type { Transaction } from "@/lib/soldeGenerale/soldeGenerale-type";
import { useSolde } from "@/contexts/solde-context";
import { useStats } from "@/contexts/stats-context";

const COLOR = "#72bc21";

export default function HistoriqueTransactionsTab() {
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refreshSolde } = useSolde();
  const { refreshStats } = useStats();

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await soldeGeneraleApi.getTransactions();
      setTransactions(data);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du chargement des transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((t) =>
    `${t.raison} ${t.methode} ${t.reference} ${t.utilisateur.nom} ${t.utilisateur.prenom}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-MG", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSuccess = () => {
    fetchTransactions();
    toast.success("Transaction ajoutée avec succès !");
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#72bc21]">Historique des transactions</h2>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>

          <Button
            style={{ backgroundColor: COLOR }}
            className="flex items-center gap-2 text-white hover:opacity-90 transition-all hover:scale-[1.02]"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Ajouter une transaction
          </Button>
        </div>
      </div>

      {/* Version Tableau - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Chargement des transactions...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-[#72bc21]/10 via-[#72bc21]/5 to-[#72bc21]/10 border-b-2 border-gray-100">
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Date et heure
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Type
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Montant
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Raison
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Type de paiement
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Référence
                </TableHead>
                <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">
                  Utilisateur
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-4xl mb-2">📄</div>
                      <p className="text-lg font-medium">Aucune transaction trouvée</p>
                      <p className="text-sm text-gray-400">
                        {searchTerm ? "Essayez avec d'autres termes de recherche" : "Commencez par ajouter une transaction"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((t, index) => (
                  <TableRow 
                    key={t.id} 
                    className={`hover:bg-gray-50/80 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                    } border-b border-gray-100 last:border-b-0`}
                  >
                    <TableCell className="py-4">
                      <div className="font-medium text-sm text-gray-900">
                        {formatDate(t.date || t.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          t.type === "revenu"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {t.type === "revenu" ? (
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownCircle className="h-3.5 w-3.5" />
                        )}
                        {t.type === "revenu" ? "Revenu" : "Dépense"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`font-bold text-base ${
                        t.type === "revenu" ? "text-green-600" : "text-red-600"
                      }`}>
                        {t.type === "revenu" ? "+" : "-"} {formatCurrency(t.montant)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 max-w-xs">
                      <div className="text-gray-900">
                        <span className="truncate block" title={t.raison}>
                          {t.raison}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-gray-900 font-medium">
                        {t.methode}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="font-mono text-sm px-3 py-1.5 text-gray-700">
                        {t.reference || "-"}
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="text-sm text-gray-900">
                        {t.utilisateur.prenom} {t.utilisateur.nom}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Version Cartes - Mobile */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
              ))}
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl text-gray-300 mb-2">📄</div>
              <p className="text-lg font-medium text-gray-600">Aucune transaction trouvée</p>
              <p className="text-sm text-gray-400">
                {searchTerm ? "Essayez avec d'autres termes de recherche" : ""}
              </p>
            </div>
          </div>
        ) : (
          filteredTransactions.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:border-gray-300"
            >
              {/* En-tête de la carte */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-lg ${
                      t.type === "revenu" 
                        ? "bg-green-100 border border-green-200" 
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    {t.type === "revenu" ? (
                      <ArrowUpCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <ArrowDownCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        t.type === "revenu"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {t.type === "revenu" ? "Revenu" : "Dépense"}
                    </span>
                    <p className="text-xl font-bold mt-2">
                      <span className={t.type === "revenu" ? "text-green-600" : "text-red-600"}>
                        {t.type === "revenu" ? "+" : "-"} {formatCurrency(t.montant)}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-500 justify-end">
                    <Calendar className="h-4 w-4" />
                    {formatDate(t.date || t.created_at).split(" ")[0]}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(t.date || t.created_at).split(" ")[1]}
                  </div>
                </div>
              </div>

              {/* Détails de la transaction */}
              <div className="space-y-4 border-t pt-4">
                {/* Raison */}
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 mb-1">Raison</p>
                    <p className="text-gray-900 font-medium" title={t.raison}>
                      {t.raison}
                    </p>
                  </div>
                </div>

                {/* Méthode et Référence */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Méthode</p>
                      <p className="text-gray-900 font-medium">{t.methode}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Référence</p>
                    <p className="font-mono text-sm px-3 py-1.5 rounded-md text-gray-700">
                      {t.reference || "-"}
                    </p>
                  </div>
                </div>

                {/* Utilisateur */}
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Utilisateur</p>
                    <p className="text-gray-900 font-medium">
                      {t.utilisateur.prenom} {t.utilisateur.nom}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <NouvelleTransactionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}