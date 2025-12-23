// components/collecte/confirmationLivraion-modale.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Truck, CheckCircle2 } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ConfirmationLivraisonModaleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "complete" | "partielle";
  numeroDoc?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function ConfirmationLivraisonModale({
  open,
  onOpenChange,
  type,
  numeroDoc = "ce document",
  onConfirm,
  isLoading = false,
}: ConfirmationLivraisonModaleProps) {
  const isComplete = type === "complete";
  const isMultiple = numeroDoc.includes("document(s)");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isComplete ? "bg-[#72bc21]/10" : "bg-[#72bc21]/10"
            }`}>
              {isComplete ? (
                <Truck className="w-7 h-7 text-[#72bc21]" />
              ) : (
                <Package className="w-7 h-7 text-[#72bc21]" />
              )}
            </div>
            <span>
              Confirmation de {isComplete ? "transfert complet" : "transfert partiel"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="pt-4">
          <div className={`p-5 rounded-lg border ${
            isComplete 
              ? "bg-[#72bc21]/10 border-[#72bc21]/20 text-gray-800" 
              : "bg-[#72bc21]/10 border-[#72bc21]/20 text-gray-800"
          }`}>
            <div className="flex items-start gap-3">
              {isComplete ? (
                <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0 text-[#72bc21]" />
              ) : (
                <AlertTriangle className="h-6 w-6 mt-0.5 flex-shrink-0 text-[#72bc21]" />
              )}
              <div className="space-y-3">
                <p className="font-semibold text-lg">
                  {isMultiple 
                    ? `Confirmer le transfert de ${numeroDoc}`
                    : `Marquer comme ${isComplete ? "Transféré complètement" : "Partiellement transféré"}`
                  }
                </p>

                {!isMultiple && numeroDoc && (
                  <p className="text-sm">
                    Document : <span className="font-mono font-bold text-base">{numeroDoc}</span>
                  </p>
                )}

                <p className="text-sm leading-relaxed">
                  {isMultiple
                    ? `Vous êtes sur le point de confirmer le transfert de ${numeroDoc} vers l'unité de transformation.`
                    : isComplete
                    ? "Toute la marchandise de ce bon a été transférée vers l'unité de transformation."
                    : "Une partie seulement de la marchandise a été transférée. Le reste reste en attente."}
                </p>

                <p className="text-xs italic mt-3 opacity-80">
                  {isMultiple 
                    ? "Cette action mettra à jour le statut de tous les documents sélectionnés."
                    : "Cette action est irréversible."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3 sm:gap-4 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            size="lg"
            className="flex-1"
          >
            Annuler
          </Button>

          <Button
            onClick={onConfirm}
            disabled={isLoading}
            size="lg"
            style={{ backgroundColor: "#72bc21" }}
            className="flex-1 font-medium text-white hover:bg-[#72bc21]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                {isMultiple 
                  ? `Confirmer ${isComplete ? "transfert complet" : "transfert"}`
                  : `Oui, marquer comme ${isComplete ? "transféré" : "partiellement transféré"}`
                }
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}