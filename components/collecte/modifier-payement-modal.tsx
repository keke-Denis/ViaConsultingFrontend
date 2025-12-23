// components/collecte/modifier-payement-modal.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Edit } from "lucide-react";
import { usePaiements } from "@/lib/payement/payement-api";
import { CreatePaiementData, Paiement } from "@/lib/payement/payement-types";

interface ModifierPaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  paiement: Paiement | null;
  onSuccess: () => void;
}

export function ModifierPaiementModal({
  isOpen,
  onClose,
  paiement,
  onSuccess,
}: ModifierPaiementModalProps) {
  const { updatePaiement, loading } = usePaiements();

  const [formData, setFormData] = useState({
    numeroContrat: "",
    date: "",
    delaiHeures: "6",
    montantTotal: "",
    avancePercue: "",
    resteAPayer: "0",
    raison: "",
  });

  // Calcul automatique du reste à payer
  useEffect(() => {
    const total = parseFloat(formData.montantTotal) || 0;
    const avance = parseFloat(formData.avancePercue) || 0;
    const reste = total - avance;
    setFormData(prev => ({
      ...prev,
      resteAPayer: reste >= 0 ? reste.toString() : "0",
    }));
  }, [formData.montantTotal, formData.avancePercue]);

  // Pré-remplissage des données pour la modification
  useEffect(() => {
    if (isOpen && paiement) {
      // Extraction des données depuis la description existante
      const description = paiement.description || "";
      const numeroContratMatch = description.match(/Contrat N° ([^|]+)/);
      const delaiMatch = description.match(/Délai livraison: ([^|]+) heures/);
      const montantTotalMatch = description.match(/Montant total: ([^|]+) Ar/);
      const avancePercueMatch = description.match(/Avance perçue: ([^|]+) Ar/);
      const resteMatch = description.match(/Reste: ([^|]+) Ar/);
      const raisonMatch = description.match(/Raison: (.+)$/);

      setFormData({
        numeroContrat: numeroContratMatch ? numeroContratMatch[1].trim() : paiement.reference,
        date: paiement.date.split('T')[0],
        delaiHeures: delaiMatch ? delaiMatch[1].trim() : ((paiement as any).delaiHeures || "6").toString(),
        montantTotal: montantTotalMatch ? montantTotalMatch[1].replace(/\s/g, '') : (paiement.montant * 2).toString(),
        avancePercue: paiement.montant.toString(),
        resteAPayer: (paiement.montantDu || 0).toString(),
        raison: raisonMatch ? raisonMatch[1].trim() : (paiement as any).raison || "",
      });
    }
  }, [isOpen, paiement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paiement) return;

    const description = `Contrat N° ${formData.numeroContrat} | Date: ${formData.date} | Délai livraison: ${formData.delaiHeures} heures | Montant total: ${parseFloat(formData.montantTotal || "0").toLocaleString()} Ar | Avance perçue: ${parseFloat(formData.avancePercue || "0").toLocaleString()} Ar | Reste: ${parseFloat(formData.resteAPayer).toLocaleString()} Ar${formData.raison ? ` | Raison: ${formData.raison}` : ''}`;

    const data: CreatePaiementData & { delaiHeures?: number; raison?: string } = {
      fournisseurId: paiement.fournisseur.id,
      montant: Number(formData.avancePercue),
      type: "avance",
      methode: "espèces",
      description,
      date: formData.date,
      delaiHeures: parseInt(formData.delaiHeures) || 6,
      raison: formData.raison,
    };

    try {
      await updatePaiement(paiement.id, data);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la modification de l'avance");
    }
  };

  const formatCurrency = (value: string) => {
    return parseFloat(value || "0").toLocaleString("fr-FR");
  };

  // Fonction pour formater l'affichage du délai
  const formatDelaiDisplay = (heures: string) => {
    const heuresNum = parseInt(heures) || 0;
    const jours = Math.floor(heuresNum / 24);
    const heuresRestantes = heuresNum % 24;
    
    if (jours > 0) {
      return `${jours}j ${heuresRestantes}h`;
    }
    return `${heuresRestantes}h`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-white rounded-lg">
        <DialogHeader className="text-left space-y-2 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-[#72bc21]">
            <Edit className="w-5 h-5" />
            Modifier l'Avance Fournisseur
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Modification des informations de l'avance existante
          </DialogDescription>
        </DialogHeader>

        {paiement && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Informations du fournisseur */}
            <div className="bg-[#72bc21] border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-black mb-2">Fournisseur</h4>
              <div className="text-sm text-black space-y-1">
                <div className="font-medium">{paiement.fournisseur.nom}</div>
                {paiement.fournisseur.telephone && (
                  <div>Tél: {paiement.fournisseur.telephone}</div>
                )}
                <div>Référence: {paiement.reference}</div>
              </div>
            </div>

            {/* Informations du contrat */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Informations du contrat</h3>
              
              <div className="space-y-4">
                {/* N° de contrat */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    N° de contrat d'avance fournisseur *
                  </Label>
                  <Input
                    placeholder="Ex: AV-2025-048"
                    value={formData.numeroContrat}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroContrat: e.target.value }))}
                    className="h-10"
                    required
                    autoComplete="off"
                  />
                </div>

                {/* Date et Délai de livraison */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Date de l'avance *
                    </Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="h-10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Délai de livraison (heures) *
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="1"
                        max="720"
                        placeholder="6"
                        value={formData.delaiHeures}
                        onChange={(e) => setFormData(prev => ({ ...prev, delaiHeures: e.target.value }))}
                        className="h-10 pr-16"
                        required
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        {formatDelaiDisplay(formData.delaiHeures)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Raison de l'avance */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Raison de l'avance
                  </Label>
                  <Textarea
                    placeholder="Décrivez la raison de cette avance (optionnel)"
                    value={formData.raison}
                    onChange={(e) => setFormData(prev => ({ ...prev, raison: e.target.value }))}
                    className="min-h-[80px] resize-none"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            {/* Montants financiers */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Montants financiers</h3>

              <div className="space-y-4">
                {/* Montant total du contrat */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Montant total du contrat *
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.montantTotal}
                      onChange={(e) => setFormData(prev => ({ ...prev, montantTotal: e.target.value }))}
                      className="h-10 pr-12"
                      required
                      autoComplete="off"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                      Ar
                    </span>
                  </div>
                </div>

                {/* Avance perçue et Reste à payer */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Avance perçue *
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.avancePercue}
                        onChange={(e) => setFormData(prev => ({ ...prev, avancePercue: e.target.value }))}
                        className="h-10 pr-12"
                        required
                        autoComplete="off"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        Ar
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Reste à payer
                    </Label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={formatCurrency(formData.resteAPayer)}
                        disabled
                        className="h-10 bg-gray-100 pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        Ar
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="h-10 px-6 flex-1 order-2 sm:order-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  loading ||
                  !formData.numeroContrat ||
                  !formData.montantTotal ||
                  !formData.avancePercue ||
                  !formData.delaiHeures ||
                  parseFloat(formData.avancePercue) > parseFloat(formData.montantTotal || "0")
                }
                className="h-10 px-6 bg-[#72bc21] hover:bg-[#5fa11a] text-white flex-1 order-1 sm:order-2"
              >
                {loading ? "Modification..." : "Modifier l'avance"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
