"use client";

import { useEffect, useState } from "react";
import soldeDistilleurApi from "@/lib/soldeDistilleur/soldeDistilleur-api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, CreditCard, User, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import NouvelleTransactionModalDistilleur from "@/components/soldeDistilleur/nouvelle-transaction-modal-distilleur";

const initialTransactions: any[] = []

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return d.toLocaleString("fr-MG", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("fr-MG", { style: "currency", currency: "MGA", minimumFractionDigits: 0 }).format(amount);

export default function SoldeDistilleurTable() {
  const [transactions, setTransactions] = useState<any[]>(initialTransactions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [solde, setSolde] = useState<number | null>(null);

  const mapServerTxToClient = (tx: any) => {
    // backend shape: id, reference, type (retrait), montant, solde_avant, solde_apres, motif, date_operation, utilisateur
    return {
      id: tx.id,
      date: tx.date_operation || tx.created_at || tx.date || new Date().toISOString(),
      type: tx.type === 'retrait' ? 'depense' : tx.type || 'depense',
      montant: Number(tx.montant || tx.montant || 0),
      raison: tx.motif || tx.raison || tx.description || '-',
      reference: tx.reference || null,
    }
  }

  const handleSuccess = (tx?: any) => {
    if (tx) {
      const mapped = mapServerTxToClient(tx)
      setTransactions((prev) => [mapped, ...prev])
    }
  };

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const soldeData = await soldeDistilleurApi.monSolde()
        if (!mounted) return
        setSolde(soldeData?.solde?.montant ?? soldeData?.solde?.montant ?? soldeData?.solde?.montant ?? soldeData?.montant ?? null)

        // try to fetch historique (best-effort)
        const hist = await soldeDistilleurApi.fetchHistoriqueRetraits()
        if (!mounted) return
        if (Array.isArray(hist) && hist.length > 0) {
          setTransactions(hist.map(mapServerTxToClient))
        }
      } catch (e) {
        console.error('Erreur fetching solde/historique', e)
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#72bc21]">Historique</h2>
        <div className="ml-4">
          <Button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#72bc21' }} className="text-white">Faire un Retrait</Button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
        <Table>
          <TableHeader>
            <TableRow className="bg-linear-to-r from-[#72bc21]/10 via-[#72bc21]/5 to-[#72bc21]/10 border-b-2 border-gray-100">
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Date et heure</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Type</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Montant</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Raison</TableHead>
              <TableHead className="font-bold text-gray-700 py-4 text-sm uppercase tracking-wider">Référence</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((t: any, index: number) => (
              <TableRow key={t.id} className={`hover:bg-gray-50/80 transition-all duration-200 ${index % 2 === 0 ? "bg-gray-50/30" : "bg-white"} border-b border-gray-100 last:border-b-0`}>
                <TableCell className="py-4">
                  <div className="font-medium text-sm text-gray-900">{formatDate(t.date)}</div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${t.type === "revenu" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {t.type === "revenu" ? <ArrowUpCircle className="h-3.5 w-3.5" /> : <ArrowDownCircle className="h-3.5 w-3.5" />}
                    {t.type === "revenu" ? "Revenu" : "Dépense"}
                  </span>
                </TableCell>
                <TableCell className="py-4">
                  <span className={`font-bold text-base ${t.type === "revenu" ? "text-green-600" : "text-red-600"}`}>{t.type === "revenu" ? "+" : "-"} {formatCurrency(t.montant)}</span>
                </TableCell>
                <TableCell className="py-4 max-w-xs">
                  <div className="text-gray-900"><span className="truncate block" title={t.raison}>{t.raison}</span></div>
                </TableCell>
                <TableCell className="py-4"><div className="font-mono text-sm px-3 py-1.5 text-gray-700">{t.reference || "-"}</div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-4">
  {transactions.map((t: any) => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:border-gray-300">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${t.type === "revenu" ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"}`}>
                  {t.type === "revenu" ? <ArrowUpCircle className="h-5 w-5 text-green-600" /> : <ArrowDownCircle className="h-5 w-5 text-red-600" />}
                </div>
                <div>
            {/* Mobile cards */}
                  <p className="text-xl font-bold mt-2"><span className={t.type === "revenu" ? "text-green-600" : "text-red-600"}>{t.type === "revenu" ? "+" : "-"} {formatCurrency(t.montant)}</span></p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-gray-500 justify-end"><Calendar className="h-4 w-4" />{formatDate(t.date).split(" ")[0]}</div>
                <div className="text-xs text-gray-400 mt-1">{formatDate(t.date).split(" ")[1]}</div>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <div className="flex items-start gap-3"><FileText className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-gray-500 mb-1">Raison</p><p className="text-gray-900 font-medium" title={t.raison}>{t.raison}</p></div></div>

              <div className="grid grid-cols-1 gap-4">
                <div><p className="text-sm font-medium text-gray-500 mb-1">Référence</p><p className="font-mono text-sm px-3 py-1.5 rounded-md text-gray-700">{t.reference || "-"}</p></div>
              </div>

              {/* Utilisateur removed per request */}
            </div>
          </div>
        ))}
      </div>
      
      <NouvelleTransactionModalDistilleur
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}