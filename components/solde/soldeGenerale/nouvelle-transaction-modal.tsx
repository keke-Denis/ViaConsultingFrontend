// components/solde/nouvelle-transaction-modal.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { soldeGeneraleApi } from "@/lib/soldeGenerale/soldeGenerale-api";
import type { TransactionType } from "@/lib/soldeGenerale/soldeGenerale-type";
import { useSolde } from "@/contexts/solde-context";
import { useStats } from "@/contexts/stats-context";

const COLOR = "#72bc21";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function NouvelleTransactionModal({ open, onOpenChange, onSuccess }: Props) {
  const [type, setType] = useState<TransactionType>("revenu");
  const [montant, setMontant] = useState("");
  const [raison, setRaison] = useState("");
  const [methode, setMethode] = useState("");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { refreshSolde } = useSolde();
  const { refreshStats } = useStats();

  const resetAndClose = () => {
    setType("revenu");
    setMontant("");
    setRaison("");
    setMethode("");
    setReference("");
    setNotes("");
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!montant || !raison || !methode) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      await soldeGeneraleApi.createTransaction({
        montant: Number(montant),
        type,
        methode,
        raison,
        reference: reference || null,
        notes: notes || null,
      });

      // Rafraîchir toutes les données
      await Promise.all([
        refreshSolde(),
        refreshStats()
      ]);
      
      onSuccess();
      resetAndClose();
      toast.success("Transaction ajoutée avec succès !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout de la transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            Nouvelle transaction
          </DialogTitle>
          <button onClick={resetAndClose} className="absolute right-4 top-4 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="flex gap-3">
            <Button
              variant={type === "revenu" ? "default" : "outline"}
              style={type === "revenu" ? { backgroundColor: COLOR } : undefined}
              className="flex-1 text-black hover:opacity-90"
              onClick={() => setType("revenu")}
            >
              + Revenu
            </Button>
            <Button
              variant={type === "depense" ? "default" : "outline"}
              style={type === "depense" ? { backgroundColor: COLOR } : undefined}
              className="flex-1 text-black hover:opacity-90"
              onClick={() => setType("depense")}
            >
              - Dépense
            </Button>
          </div>

          <div>
            <Label>Montant (MGA) <span className="text-red-500">*</span></Label>
            <Input type="number" placeholder="0" value={montant} onChange={(e) => setMontant(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Raison <span className="text-red-500">*</span></Label>
            <Input placeholder="Description..." value={raison} onChange={(e) => setRaison(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Méthode de paiement <span className="text-red-500">*</span></Label>
            <Select value={methode} onValueChange={setMethode}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Sélectionner..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile-money">Mobile Money</SelectItem>
                <SelectItem value="virement">Virement bancaire</SelectItem>
                <SelectItem value="especes">Espèces</SelectItem>
                <SelectItem value="cheque">Chèque</SelectItem>
                <SelectItem value="carte">Carte bancaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Référence</Label>
            <Input placeholder="Optionnelle" value={reference} onChange={(e) => setReference(e.target.value)} className="mt-1.5" />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea placeholder="Notes supplémentaires..." value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5 min-h-20" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={resetAndClose} disabled={loading}>
              Annuler
            </Button>
            <Button
              style={{ backgroundColor: COLOR }}
              className="text-white hover:opacity-90"
              onClick={handleSubmit}
              disabled={loading || !montant || !raison || !methode}
            >
              {loading ? "Enregistrement..." : `Ajouter ${type === "revenu" ? "le revenu" : "la dépense"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}