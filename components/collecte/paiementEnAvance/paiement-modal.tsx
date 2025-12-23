// components/collecte/paiement-modal.tsx
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FileText, Clock, ChevronsUpDown, Check, User } from "lucide-react";
import { paiementEnAvanceAPI } from "@/lib/paiementEnAvance/paiementEnAvance-api";
import { cn } from "@/lib/utils";
import { PaiementEnAvance } from "@/lib/paiementEnAvance/paiementEnAvance-types";
import { toast } from 'react-toastify';
import api from "@/api/api";

interface Fournisseur {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
}

interface PaiementModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "view";
  onSuccess: () => void;
  paiement?: PaiementEnAvance | null;
}

export function PaiementModal({
  isOpen,
  onClose,
  mode,
  onSuccess,
  paiement,
}: PaiementModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState({
    fournisseur_id: 0,
    numeroContrat: "",
    date: today,
    delaiMinutes: "",
    montantTotal: "",
    avanceVersee: "",
    resteAPayer: "",
    raison: "",
  });

  const [loading, setLoading] = useState(false);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [searchFournisseur, setSearchFournisseur] = useState("");
  const [openFournisseur, setOpenFournisseur] = useState(false);
  const [loadingFournisseurs, setLoadingFournisseurs] = useState(false);
  const [hasExistingAdvance, setHasExistingAdvance] = useState(false);

  const selectedFournisseur = fournisseurs.find(f => f.id === formData.fournisseur_id);

  const filteredFournisseurs = searchFournisseur
    ? fournisseurs.filter(f =>
        `${f.prenom} ${f.nom} ${f.contact}`
          .toLowerCase()
          .includes(searchFournisseur.toLowerCase())
      )
    : fournisseurs;

  // Vérifier si le fournisseur a déjà une avance en cours
  const checkExistingAdvance = async (fournisseurId: number) => {
    if (fournisseurId === 0) return;
    
    try {
      const response = await paiementEnAvanceAPI.getAll();
      if (response.success && response.data) {
        const existingAdvances = response.data.filter(
          (p: PaiementEnAvance) => 
            p.fournisseur_id === fournisseurId && 
            p.statut === 'en_attente'
        );
        
        if (existingAdvances.length > 0) {
          setHasExistingAdvance(true);
          toast.warning(`Attention : Ce fournisseur a déjà ${existingAdvances.length} avance(s) en attente !`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          setHasExistingAdvance(false);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification des avances:", error);
    }
  };

  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        setLoadingFournisseurs(true);
        const response = await api.get<{ success: boolean; data: Fournisseur[] }>("/pv-receptions/fournisseurs-disponibles");
        
        if (response.data.success && response.data.data) {
          setFournisseurs(response.data.data);
        } else {
          console.error("Erreur lors du chargement des fournisseurs:", response);
          setFournisseurs([]);
          toast.error("Erreur lors du chargement des fournisseurs", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des fournisseurs:", error);
        toast.error("Erreur de connexion lors du chargement des fournisseurs", {
          position: "top-right",
          autoClose: 5000,
        });
        setFournisseurs([]);
      } finally {
        setLoadingFournisseurs(false);
      }
    };

    if (isOpen) {
      fetchFournisseurs();
    }
  }, [isOpen]);

  // Charger les données du paiement en mode édition/visualisation
  useEffect(() => {
    if (isOpen && paiement && (isEditMode || isViewMode)) {
      const numeroContrat = paiement.description?.match(/contrat (.+?) du/)?.at(1) || "";
      
      const montantTotal = paiement.montant || 0;
      const avanceVersee = paiement.montantAvance || 0;
      const resteAPayer = paiement.montantDu || 0;
      
      setFormData({
        fournisseur_id: paiement.fournisseur_id,
        numeroContrat: numeroContrat,
        date: paiement.date.split(' ')[0],
        delaiMinutes: paiement.delaiHeures?.toString() || "",
        montantTotal: montantTotal.toString(),
        avanceVersee: avanceVersee.toString(),
        resteAPayer: resteAPayer.toString(),
        raison: paiement.raison || "",
      });
    }
  }, [isOpen, paiement, isEditMode, isViewMode]);

  // Calcul automatique du reste à payer
  useEffect(() => {
    const montantTotal = parseFloat(formData.montantTotal) || 0;
    const avanceVersee = parseFloat(formData.avanceVersee) || 0;
    const resteAPayer = Math.max(0, montantTotal - avanceVersee);
    
    setFormData((prev) => ({
      ...prev,
      resteAPayer: resteAPayer.toString(),
    }));
  }, [formData.montantTotal, formData.avanceVersee]);

  // Vérifier les avances existantes quand le fournisseur change
  useEffect(() => {
    if (formData.fournisseur_id > 0 && mode === "add") {
      checkExistingAdvance(formData.fournisseur_id);
    }
  }, [formData.fournisseur_id, mode]);

  useEffect(() => {
    if (isOpen && mode === "add") {
      setFormData({
        fournisseur_id: 0,
        numeroContrat: "",
        date: today,
        delaiMinutes: "",
        montantTotal: "",
        avanceVersee: "",
        resteAPayer: "0",
        raison: "",
      });
      setSearchFournisseur("");
      setHasExistingAdvance(false);
    }
  }, [isOpen, mode, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewMode || loading) return;

    setLoading(true);

    const montantTotal = parseFloat(formData.montantTotal) || 0;
    const avanceVersee = parseFloat(formData.avanceVersee) || 0;
    const resteAPayer = parseFloat(formData.resteAPayer) || 0;

    // Validation
    if (avanceVersee > montantTotal) {
      toast.error("Erreur : L'avance ne peut pas être supérieure au montant total du contrat", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
      return;
    }

    if (avanceVersee <= 0) {
      toast.error("Erreur : L'avance doit être supérieure à 0", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
      return;
    }

    if (!formData.delaiMinutes || parseInt(formData.delaiMinutes) <= 0) {
      toast.error("Erreur : Le délai doit être supérieur à 0", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
      return;
    }

    // Vérification supplémentaire : reste à payer doit être égal à 0
    if (resteAPayer !== 0) {
      toast.error("Erreur : La vérification doit être égale à 0 pour pouvoir enregistrer", {
        position: "top-right",
        autoClose: 5000,
      });
      setLoading(false);
      return;
    }

    const payload = {
      fournisseur_id: formData.fournisseur_id,
      montant: montantTotal,
      montantAvance: avanceVersee,
      montantDu: resteAPayer,
      delaiHeures: parseInt(formData.delaiMinutes || "0", 10),
      raison: formData.raison.trim() || undefined,
      methode: "espèces" as const,
      type: "avance" as const,
      description: `Avance sur contrat ${formData.numeroContrat} du ${formData.date}`,
    };

    try {
      let result;
      
      if (isEditMode && paiement) {
        result = await paiementEnAvanceAPI.update(paiement.id, payload);
      } else {
        result = await paiementEnAvanceAPI.create(payload);
      }

      if (result.success && result.data) {
        const paiementResult = result.data;
        
        toast.success(`Paiement ${isEditMode ? 'modifié' : 'enregistré'} avec succès !`, {
          position: "top-right",
          autoClose: 3000,
        });
        
        console.log(`Paiement ${isEditMode ? 'modifié' : 'enregistré'} avec succès !`);
        console.log("Référence :", paiementResult.reference);
        console.log("Montant total :", paiementResult.montant, "Ar");
        console.log("Avance versée :", paiementResult.montantAvance || 0, "Ar");
        console.log("Reste à payer :", paiementResult.montantDu || 0, "Ar");
        console.log("Délai :", paiementResult.delaiHeures, "minutes");
        console.log("Statut :", paiementResult.statut);

        onSuccess();
        onClose();
      } else {
        toast.error(result.message || `Erreur lors de ${isEditMode ? 'la modification' : "l'enregistrement"}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } catch (error: any) {
      console.error(`Erreur lors de la ${isEditMode ? 'modification' : 'création'} :`, error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        `Erreur inconnue lors de ${isEditMode ? 'la modification' : "l'enregistrement"}`;

      if (error?.response?.data?.solde_actuel !== undefined) {
        toast.error(`${message}\nSolde disponible : ${error.response.data.solde_actuel.toLocaleString()} Ar`, {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error(message, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDelai = (minutes: string) => {
    const mins = parseInt(minutes) || 0;
    if (mins === 0) return "0 min";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ""}` : `${mins} min`;
  };

  const formatCurrency = (value: string) => {
    return parseFloat(value || "0").toLocaleString("fr-FR");
  };

  const isFormValid =
    formData.fournisseur_id > 0 &&
    formData.numeroContrat &&
    formData.delaiMinutes &&
    parseInt(formData.delaiMinutes) > 0 &&
    formData.montantTotal &&
    formData.avanceVersee &&
    parseFloat(formData.avanceVersee) <= parseFloat(formData.montantTotal) &&
    parseFloat(formData.avanceVersee) > 0;

  // Vérification que le reste à payer est égal à 0
  const verificationIsZero = parseFloat(formData.resteAPayer) === 0;

  // Le bouton est désactivé si le formulaire n'est pas valide OU si la vérification n'est pas égale à 0
  const isSaveButtonDisabled = !isFormValid || !verificationIsZero || loading;

  const getTitle = () => {
    switch (mode) {
      case "add": return "Nouvelle Avance Fournisseur";
      case "edit": return "Modifier l'Avance Fournisseur";
      case "view": return "Détails de l'Avance Fournisseur";
      default: return "Avance Fournisseur";
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "add": return "Enregistrez une nouvelle avance. Le paiement sera en attente jusqu'à confirmation.";
      case "edit": return "Modifiez les informations de l'avance fournisseur.";
      case "view": return "Consultez les détails de l'avance fournisseur.";
      default: return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-[#72bc21]">
            <FileText className="w-8 h-8" />
            {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-[#72bc21]">Informations du contrat</h3>

            {hasExistingAdvance && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Attention : Ce fournisseur a déjà une ou plusieurs avances en attente</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-lg font-semibold">Fournisseur :</Label>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4 text-[#72bc21]" />
                <span>
                  {loadingFournisseurs ? "Chargement..." : `${fournisseurs.length} fournisseur(s) disponible(s)`}
                </span>
              </div>
              <Popover open={openFournisseur} onOpenChange={setOpenFournisseur}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFournisseur}
                    className="w-full justify-between h-12 pl-10 font-normal text-left"
                    disabled={loadingFournisseurs || loading || isViewMode}
                  >
                    <User className="absolute left-3 h-5 w-5 text-[#72bc21]" />
                    {loadingFournisseurs ? (
                      "Chargement des fournisseurs..."
                    ) : selectedFournisseur ? (
                      `${selectedFournisseur.prenom} ${selectedFournisseur.nom} - ${selectedFournisseur.contact}`
                    ) : (
                      "Rechercher un fournisseur..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Nom, prénom ou téléphone..."
                      value={searchFournisseur}
                      onValueChange={setSearchFournisseur}
                    />
                    <CommandList>
                      <CommandEmpty>Aucun résultat</CommandEmpty>
                      <CommandGroup>
                        {filteredFournisseurs.map(f => (
                          <CommandItem
                            key={f.id}
                            value={`${f.prenom} ${f.nom} ${f.contact} ${f.id}`}
                            onSelect={() => {
                              handleChange("fournisseur_id", formData.fournisseur_id === f.id ? 0 : f.id);
                              setOpenFournisseur(false);
                              setSearchFournisseur("");
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.fournisseur_id === f.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div>
                              <div className="font-medium">
                                {f.prenom} {f.nom}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {f.contact}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>N° de contrat :</Label>
                <Input
                  placeholder="AV-2025-099"
                  value={formData.numeroContrat}
                  onChange={(e) =>
                    setFormData({ ...formData, numeroContrat: e.target.value })
                  }
                  required
                  disabled={loading || isViewMode}
                />
              </div>
              <div className="space-y-2">
                <Label>Date :</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  readOnly
                  disabled={loading || isViewMode}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Délai de livraison (en minutes) :</Label>
              <div className="relative">
                <Input
                  type="number"
                  min="1"
                  placeholder="Ex: 360"
                  value={formData.delaiMinutes}
                  onChange={(e) => setFormData({ ...formData, delaiMinutes: e.target.value })}
                  required
                  disabled={loading || isViewMode}
                  className="pr-36"
                />
                {formData.delaiMinutes && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDelai(formData.delaiMinutes)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Raison :</Label>
              <Textarea
                placeholder="Ex: Matériel urgent, prestation prioritaire..."
                value={formData.raison}
                onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
                className="min-h-24"
                disabled={loading || isViewMode}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Montants</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Montant demandé par fournisseur :</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1000"
                    placeholder="Ex: 2500000"
                    value={formData.montantTotal}
                    onChange={(e) => setFormData({ ...formData, montantTotal: e.target.value })}
                    required
                    disabled={loading || isViewMode}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Ar</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resaisir le montant demandé :</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="1000"
                    placeholder="Ex: 2500000"
                    value={formData.avanceVersee}
                    onChange={(e) => setFormData({ ...formData, avanceVersee: e.target.value })}
                    required
                    disabled={loading || isViewMode}
                    className="pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Ar</span>
                </div>
              </div>
            </div>

            <div className="w-full">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex justify-between text-lg font-medium">
                  <span>Verification :</span>
                  <span className={`font-bold ${verificationIsZero ? 'text-[#72bc21]' : 'text-red-500'}`}>
                    {formatCurrency(formData.resteAPayer)} Ar
                    {!verificationIsZero && " (Doit être égal à 0)"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {!isViewMode && (
            <DialogFooter className="flex gap-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={isSaveButtonDisabled}
                className="bg-[#72bc21] hover:bg-[#5ea11a] text-white"
              >
                {loading 
                  ? isEditMode ? "Modification..." : "Enregistrement..." 
                  : isEditMode ? "Modifier l'avance" : "Enregistrer l'avance"
                }
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}