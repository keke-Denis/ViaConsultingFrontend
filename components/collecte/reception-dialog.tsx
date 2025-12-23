"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

import {
  Loader2,
  MapPin,
  RefreshCw,
  User,
  Calendar,
  Package,
  DollarSign,
  Scale,
  Percent,
  Box,
  CreditCard,
  ChevronRight,
  ChevronLeft,
  Check,
  ChevronsUpDown,
  Info,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
} from "lucide-react";

import { toast } from "react-toastify";
import { usePVReception } from "@/contexts/pvreception/pvreception-context";
import { useAuth } from "@/contexts/auth-context";
import { ficheService } from "@/lib/TestHuille/fiche-reception-api";
import { paiementEnAvanceAPI } from "@/lib/paiementEnAvance/paiementEnAvance-api";
import type { PVReceptionFormData, TypeEmballage } from "@/lib/pvreception/pvreception-types";
import api from "@/api/api";

interface Provenance {
  id: number;
  Nom: string;
}

interface Fournisseur {
  id: number;
  nom: string;
  prenom: string;
  contact: string;
  adresse?: string;
}

interface ReceptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  isEditMode?: boolean;
}

export function ReceptionDialog({
  open,
  onOpenChange,
  onSuccess,
  isEditMode = false,
}: ReceptionDialogProps) {
  const { user } = useAuth();
  const {
    createPVReception,
    updatePVReception,
    validerDonnees,
    isLoading,
    getPVReceptions,
    currentPVReception,
  } = usePVReception();

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<PVReceptionFormData>({
    type: "FG",
    date_reception: new Date().toISOString().split("T")[0],
    dette_fournisseur: 0,
    utilisateur_id: user?.id || 0,
    fournisseur_id: 0,
    provenance_id: 0,
    poids_brut: 0,
    type_emballage: "sac",
    poids_emballage: 0,
    nombre_colisage: 1,
    prix_unitaire: 0,
    taux_humidite: 0,
    taux_dessiccation: 0,
  });

  const [provenances, setProvenances] = useState<Provenance[]>([]);
  const [isCreatingProvenance, setIsCreatingProvenance] = useState(false);
  const [showProvenanceInput, setShowProvenanceInput] = useState(false);
  const [newProvenanceName, setNewProvenanceName] = useState("");
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [calculs, setCalculs] = useState({ poidsNet: 0, prixTotal: 0 });
  const [infosFournisseur, setInfosFournisseur] = useState<any>(null);
  const [paiementsDetails, setPaiementsDetails] = useState<any[]>([]);
  const [montantAvanceTotal, setMontantAvanceTotal] = useState<number>(0);
  const [montantUtiliseTotal, setMontantUtiliseTotal] = useState<number>(0);
  const [montantRestantTotal, setMontantRestantTotal] = useState<number>(0);
  const [isLoadingInfos, setIsLoadingInfos] = useState(false);
  const [refreshInfos, setRefreshInfos] = useState(0);

  const [openFournisseur, setOpenFournisseur] = useState(false);
  const [searchFournisseur, setSearchFournisseur] = useState("");

  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      
      if (isEditMode && currentPVReception) {
        setFormData({
          type: currentPVReception.type,
          date_reception: new Date(currentPVReception.date_reception).toISOString().split("T")[0],
          dette_fournisseur: currentPVReception.dette_fournisseur || 0,
          utilisateur_id: user?.id || 0,
          fournisseur_id: currentPVReception.fournisseur_id,
          provenance_id: currentPVReception.provenance_id,
          poids_brut: currentPVReception.poids_brut,
          type_emballage: currentPVReception.type_emballage,
          poids_emballage: currentPVReception.poids_emballage,
          nombre_colisage: currentPVReception.nombre_colisage,
          prix_unitaire: currentPVReception.prix_unitaire,
          taux_humidite: currentPVReception.taux_humidite || 0,
          taux_dessiccation: currentPVReception.taux_dessiccation || 0,
        });
        
        const poidsSansEmballage = currentPVReception.poids_brut - currentPVReception.poids_emballage;
        let poidsNet = poidsSansEmballage;
        
        if (currentPVReception.taux_humidite && currentPVReception.taux_dessiccation && 
            currentPVReception.taux_humidite > currentPVReception.taux_dessiccation) {
          const excesHumidite = currentPVReception.taux_humidite - currentPVReception.taux_dessiccation;
          const dessiccation = poidsSansEmballage * (excesHumidite / 100);
          poidsNet = poidsSansEmballage - dessiccation;
        }
        
        const prixTotal = poidsNet * currentPVReception.prix_unitaire;
        
        setCalculs({ 
          poidsNet: Number(poidsNet.toFixed(2)), 
          prixTotal: Number(prixTotal.toFixed(2)) 
        });
      } else {
        setFormData({
          type: "FG",
          date_reception: new Date().toISOString().split("T")[0],
          dette_fournisseur: 0,
          utilisateur_id: user?.id || 0,
          fournisseur_id: 0,
          provenance_id: 0,
          poids_brut: 0,
          type_emballage: "sac",
          poids_emballage: 0,
          nombre_colisage: 1,
          prix_unitaire: 0,
          taux_humidite: 0,
          taux_dessiccation: 0,
        });
        setCalculs({ poidsNet: 0, prixTotal: 0 });
      }
      setSearchFournisseur("");
      setInfosFournisseur(null);
    }
  }, [open, user, isEditMode, currentPVReception]);

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;
      setIsLoadingData(true);

      try {
        const provRes = await api.get<{ success: boolean; data: Provenance[] }>("/provenances");
        setProvenances(provRes.data.success ? provRes.data.data || [] : []);

        const fourRes = await api.get<{ success: boolean; data: Fournisseur[] }>("/pv-receptions/fournisseurs-disponibles");
        if (fourRes.data.success) {
          setFournisseurs(fourRes.data.data || []);
        } else {
          setFournisseurs([]);
          toast.error("Erreur lors du chargement des fournisseurs", {
            position: "top-right",
            autoClose: 5000,
          });
        }
      } catch (err: any) {
        console.error("Erreur chargement données:", err);
        toast.error("Erreur de chargement des données", {
          position: "top-right",
          autoClose: 5000,
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [open]);

  const calculerResultats = useCallback(() => {
    if (formData.poids_brut > 0 && formData.prix_unitaire > 0) {
      const poidsSansEmballage = formData.poids_brut - formData.poids_emballage;
      
      let poidsNet = poidsSansEmballage;
      
      if (formData.taux_humidite !== undefined && 
          formData.taux_humidite !== null &&
          formData.taux_dessiccation !== undefined && 
          formData.taux_dessiccation !== null && 
          formData.taux_humidite > formData.taux_dessiccation) {
        const excesHumidite = formData.taux_humidite - formData.taux_dessiccation;
        const dessiccation = poidsSansEmballage * (excesHumidite / 100);
        poidsNet = poidsSansEmballage - dessiccation;
      }
      
      const prixTotal = poidsNet * formData.prix_unitaire;

      const newPoidsNet = Number(poidsNet.toFixed(2));
      const newPrixTotal = Number(prixTotal.toFixed(2));

      setCalculs({ 
        poidsNet: newPoidsNet, 
        prixTotal: newPrixTotal 
      });
    } else {
      setCalculs({ poidsNet: 0, prixTotal: 0 });
    }
  }, [
    formData.poids_brut,
    formData.poids_emballage,
    formData.prix_unitaire,
    formData.taux_humidite,
    formData.taux_dessiccation,
  ]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculerResultats();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [calculerResultats]);

  const isStep1Valid = useCallback(() => {
    // MODIFICATION PRINCIPALE : Supprimer la vérification des avances disponibles
    return formData.fournisseur_id > 0 &&
           formData.provenance_id > 0 &&
           formData.date_reception &&
           formData.type;
    // SUPPRIMÉ : && hasAvailableAdvances()
  }, [formData]);

  const isStep2Valid = useCallback(() => {
    return isStep1Valid() && formData.poids_brut > 0 && formData.prix_unitaire > 0;
  }, [isStep1Valid, formData.poids_brut, formData.prix_unitaire]);

  const handleNext = () => {
    if (isStep1Valid()) {
      setCurrentStep(2);
    } else {
      if (!formData.fournisseur_id) {
        toast.error("Veuillez sélectionner un fournisseur");
      } else {
        toast.error("Complétez tous les champs obligatoires");
      }
    }
  };

  const handlePrev = () => setCurrentStep(1);

  const handleChange = (field: keyof PVReceptionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const erreurs = validerDonnees(formData);
    if (erreurs.length > 0) {
      erreurs.forEach(erreur => toast.error(erreur));
      return;
    }
    if (formData.poids_emballage >= formData.poids_brut) {
      toast.error("Poids emballage ne peut pas être supérieur ou égal au poids brut");
      return;
    }

    try {
      let res;
      
      if (isEditMode && currentPVReception) {
        const dataAEnvoyer = {
          ...formData,
          id: currentPVReception.id,
          dette_fournisseur: 0
        };

        console.log("Données envoyées pour modification:", dataAEnvoyer);
        res = await updatePVReception(currentPVReception.id, dataAEnvoyer);
        
        if (res.success) {
          toast.success(`PV ${currentPVReception.numero_doc} modifié avec succès!`);
        }
      } else {
        const dataAEnvoyer = {
          ...formData,
          dette_fournisseur: 0
        };

        console.log("Données envoyées pour création:", dataAEnvoyer);
        res = await createPVReception(dataAEnvoyer);
        
        if (res.success) {
          toast.success(`PV créé ! N° ${res.data?.numero_doc}`);
        }
      }

      if (res.success) {
        await getPVReceptions();
        setRefreshInfos(prev => prev + 1);
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(`Échec: ${res.message}`);
      }
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      toast.error("Erreur lors de l'opération");
    }
  };

  const resetCalc = () => {
    setFormData((prev) => ({
      ...prev,
      poids_brut: 0,
      poids_emballage: 0,
      prix_unitaire: 0,
      taux_dessiccation: 0,
      taux_humidite: 0,
      dette_fournisseur: 0,
    }));
    setCalculs({ poidsNet: 0, prixTotal: 0 });
  };

  const filteredFournisseurs = fournisseurs.filter((f) =>
    `${f.prenom} ${f.nom} ${f.contact}`
      .toLowerCase()
      .includes(searchFournisseur.toLowerCase())
  );

  const selectedFournisseur = fournisseurs.find(
    (f) => f.id === formData.fournisseur_id
  );

  useEffect(() => {
    const fetchInfos = async () => {
      if (formData.fournisseur_id > 0) {
        setIsLoadingInfos(true);
        try {
          const res = await ficheService.getInfosFournisseur(formData.fournisseur_id);
          
          if (res.success) {
            setInfosFournisseur(res.data);

            let details: any[] = [
              ...(res.data.paiements_avance?.details_disponibles || []),
              ...(res.data.paiements_avance?.details_en_attente || []),
            ];

            if ((!details || details.length === 0) && formData.fournisseur_id) {
              try {
                const fallback = await paiementEnAvanceAPI.getAll();
                if (fallback && fallback.success && Array.isArray(fallback.data)) {
                  details = fallback.data.filter((p: any) => p.fournisseur_id === formData.fournisseur_id);
                }
              } catch (e) {
                // ignore fallback error
              }
            }

            const remainingDetails = (details || []).filter((p: any) => {
              const montantRestant = Number(p.montant_restant || p.montant_rest || p.montantAvance || p.montant || 0);
              return montantRestant > 0;
            });
            
            setPaiementsDetails(remainingDetails);

            const totalMontant = remainingDetails.reduce((sum: number, p: any) => 
              sum + (Number(p.montant || p.montant_total || p.montantAvance || 0) || 0), 0);
            const totalUtilise = remainingDetails.reduce((sum: number, p: any) => 
              sum + (Number(p.montant_utilise || 0) || 0), 0);
            const totalRestant = remainingDetails.reduce((sum: number, p: any) => 
              sum + (Number(p.montant_restant || 0) || 0), 0);

            setMontantAvanceTotal(totalMontant);
            setMontantUtiliseTotal(totalUtilise);
            setMontantRestantTotal(totalRestant);
          } else {
            setInfosFournisseur(null);
            setPaiementsDetails([]);
            setMontantAvanceTotal(0);
            setMontantUtiliseTotal(0);
            setMontantRestantTotal(0);
          }
        } catch (err) {
          console.error("Erreur chargement infos fournisseur:", err);
          setInfosFournisseur(null);
          setPaiementsDetails([]);
          setMontantAvanceTotal(0);
          setMontantUtiliseTotal(0);
          setMontantRestantTotal(0);
        } finally {
          setIsLoadingInfos(false);
        }
      } else {
        setInfosFournisseur(null);
        setPaiementsDetails([]);
        setMontantAvanceTotal(0);
        setMontantUtiliseTotal(0);
        setMontantRestantTotal(0);
      }
    };

    fetchInfos();
  }, [formData.fournisseur_id, refreshInfos]);

  const typeOptions = [
    { value: "FG", label: "Feuilles (FG)" },
    { value: "CG", label: "Clous (CG)" },
    { value: "GG", label: "Griffes (GG)" },
  ];

  const getCombinedPayments = () => {
    if (paiementsDetails && paiementsDetails.length > 0) {
      return paiementsDetails;
    }
    
    if (infosFournisseur) {
      return [
        ...(infosFournisseur.paiements_avance?.details_disponibles || []),
        ...(infosFournisseur.paiements_avance?.details_en_attente || [])
      ].filter((p: any) => {
        const montantRestant = Number(p.montant_restant || p.montant_rest || p.montantAvance || p.montant || 0);
        return montantRestant > 0;
      });
    }
    
    return [];
  };

  const combinedPayments = getCombinedPayments();
  const hasAvailablePayments = combinedPayments.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-[#76bc21] to-[#5f9a1a] rounded-full flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">
                {isEditMode ? "Modifier le PV de Réception" : "Nouveau PV de Réception"}
              </DialogTitle>
              <DialogDescription>
                Étape {currentStep}/2 — {currentStep === 1 ? "Informations générales" : "Poids & Prix"}
                {isEditMode && currentPVReception && ` - PV: ${currentPVReception.numero_doc}`}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#76bc21]" />
            <p className="mt-4 text-lg">Chargement des données...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Barre de progression */}
            <div className="flex gap-2">
              <div className={`h-2 flex-1 rounded-full ${currentStep >= 1 ? "bg-[#76bc21]" : "bg-gray-300"}`} />
              <div className={`h-2 flex-1 rounded-full ${currentStep >= 2 ? "bg-[#76bc21]" : "bg-gray-300"}`} />
            </div>

            {/* ÉTAPE 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {/* Fournisseur */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Fournisseur *</Label>
                    <Badge variant="outline" className="text-xs border-[#76bc21] text-[#76bc21]">
                      {fournisseurs.length} fournisseurs disponibles
                    </Badge>
                  </div>
                  
                  <Popover open={openFournisseur} onOpenChange={setOpenFournisseur}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between h-12 pl-10 font-normal text-left"
                        disabled={fournisseurs.length === 0}
                      >
                        <User className="absolute left-3 h-5 w-5 text-[#76bc21]" />
                        {selectedFournisseur
                          ? `${selectedFournisseur.prenom} ${selectedFournisseur.nom} - ${selectedFournisseur.contact}`
                          : "Rechercher un fournisseur..."}
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
                                value={`${f.id}`}
                                onSelect={() => {
                                  handleChange("fournisseur_id", formData.fournisseur_id === f.id ? 0 : f.id);
                                  setOpenFournisseur(false);
                                  setSearchFournisseur("");
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", formData.fournisseur_id === f.id ? "opacity-100" : "opacity-0")} />
                                <div>
                                  <div className="font-medium">{f.prenom} {f.nom}</div>
                                  <div className="text-xs text-muted-foreground">{f.contact}</div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Informations du fournisseur */}
                  {isLoadingInfos && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Chargement des informations du fournisseur...
                    </div>
                  )}

                  {infosFournisseur && (
                    <div className="space-y-3">
                      {hasAvailablePayments ? (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                          <Check className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Avances disponibles</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          <AlertTriangle className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Aucune avance disponible</div>
                            <div className="text-xs">Ce fournisseur n'a pas d'avances actives</div>
                          </div>
                        </div>
                      )}

                      {hasAvailablePayments && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Paiements d'avance</span>
                          </div>
                          
                          {combinedPayments.length > 0 && (
                            <>
                              <div className="flex justify-between items-center text-xs text-green-600 mb-2">
                                <span>Reste :</span>
                                <span className="font-medium" style={{ color: "#72bc21" }}>
                                  {montantRestantTotal.toLocaleString()} Ar
                                </span>
                              </div>
                              <div className="space-y-1 max-h-48 overflow-y-auto">
                                {combinedPayments.map((paiement: any) => {
                                  return (
                                    <div key={paiement.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                      <div>
                                        <div className="font-medium">{paiement.reference || 'Sans référence'}</div>
                                        <div className="text-gray-500">{new Date(paiement.date || paiement.date_creation).toLocaleDateString()}</div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium" style={{ color: "#72bc21" }}>
                                          {(Number(paiement.montant_restant || paiement.montant || 0)).toLocaleString()} Ar
                                        </div>
                                        <div className="text-gray-500 capitalize">{paiement.type || 'Paiement'}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Date + Type */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Date de réception (auto):</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="date"
                        value={formData.date_reception}
                        onChange={(e) => handleChange("date_reception", e.target.value)}
                        className="h-12 pl-10"
                        required
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Type de matière *</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Select
                        value={formData.type}
                        onValueChange={(v) => handleChange("type", v)}
                      >
                        <SelectTrigger className="h-12 pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {typeOptions.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Provenance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Provenance *</Label>
                    <button
                      type="button"
                      onClick={() => setShowProvenanceInput(!showProvenanceInput)}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ borderColor: "#76bc21", color: "#76bc21" }}
                    >
                      <Plus className="w-4 h-4" />
                      Nouvelle
                    </button>
                  </div>
                  {showProvenanceInput && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-2">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Nouvelle provenance</label>
                          <input
                            type="text"
                            value={newProvenanceName}
                            onChange={(e) => setNewProvenanceName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                            placeholder="Saisir le nom de la provenance"
                            maxLength={50}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={async () => {
                            if (!newProvenanceName.trim()) {
                              toast.error("Veuillez saisir un nom pour la provenance");
                              return;
                            }
                            setIsCreatingProvenance(true);
                            try {
                              const res = await import("@/lib/provenance/provenance-api").then(m => m.provenanceAPI.create({ Nom: newProvenanceName.trim() }));
                              if (res.success && res.data) {
                                const all = await import("@/lib/provenance/provenance-api").then(m => m.provenanceAPI.getAll());
                                setProvenances(all.data || []);
                                handleChange("provenance_id", res.data.id);
                                setShowProvenanceInput(false);
                                setNewProvenanceName("");
                                toast.success("Provenance créée et sélectionnée");
                              } else {
                                toast.error(res.message || "Erreur lors de la création de la provenance");
                              }
                            } catch (err) {
                              toast.error("Impossible de créer la provenance");
                            } finally {
                              setIsCreatingProvenance(false);
                            }
                          }}
                          disabled={isCreatingProvenance || !newProvenanceName.trim()}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isCreatingProvenance ? "Création..." : "Créer"}
                        </button>
                      </div>
                    </div>
                  )}
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21] z-10" />
                    <Select
                      value={formData.provenance_id.toString()}
                      onValueChange={(v) => handleChange("provenance_id", parseInt(v))}
                    >
                      <SelectTrigger className="h-12 pl-10">
                        <SelectValue placeholder="Choisir une provenance" />
                      </SelectTrigger>
                      <SelectContent>
                        {provenances.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.Nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Poids Brut (kg) *</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.poids_brut || ""}
                        onChange={(e) => handleChange("poids_brut", parseFloat(e.target.value) || 0)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Poids Emballage (kg)</Label>
                    <div className="relative">
                      <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.poids_emballage || ""}
                        onChange={(e) => handleChange("poids_emballage", parseFloat(e.target.value) || 0)}
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Type emballage</Label>
                    <div className="relative">
                      <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Select
                        value={formData.type_emballage}
                        onValueChange={(v) => handleChange("type_emballage", v as TypeEmballage)}
                      >
                        <SelectTrigger className="h-12 pl-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sac">Sac</SelectItem>
                          <SelectItem value="bidon">Bidon</SelectItem>
                          <SelectItem value="fut">Fut</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre de colis</Label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        min="1"
                        value={formData.nombre_colisage || ""}
                        onChange={(e) => handleChange("nombre_colisage", parseInt(e.target.value) || 1)}
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Taux de dessiccation (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.taux_dessiccation || ""}
                        onChange={(e) => handleChange("taux_dessiccation", parseFloat(e.target.value) || 0)}
                        className="h-12 pl-10"
                        placeholder="Taux cible de dessiccation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Taux d'humidité (%)</Label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.taux_humidite || ""}
                        onChange={(e) => handleChange("taux_humidite", parseFloat(e.target.value) || 0)}
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Prix unitaire (Ar/kg) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.prix_unitaire || ""}
                        onChange={(e) => handleChange("prix_unitaire", parseFloat(e.target.value) || 0)}
                        className="h-12 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dette fournisseur (Ar)</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        value={calculs.prixTotal || ""}
                        readOnly
                        className="h-12 pl-10 bg-gray-50 border-gray-300 text-gray-700 font-medium"
                        placeholder="Auto"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t">
              {currentStep === 2 && (
                <Button type="button" onClick={handlePrev} variant="outline">
                  <ChevronLeft className="h-5 w-5 mr-1" /> Précédent
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Annuler
              </Button>

              {currentStep === 1 && (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isStep1Valid()}
                  className="flex-1 bg-[#76bc21] hover:bg-[#5f9a1a]"
                >
                  Suivant <ChevronRight className="h-5 w-5 ml-1" />
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="submit"
                  disabled={isLoading || !isStep2Valid()}
                  className="flex-1 bg-[#76bc21] hover:bg-[#5f9a1a]"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isLoading 
                    ? (isEditMode ? "Modification en cours..." : "Création en cours...") 
                    : (isEditMode ? "Modifier le PV" : "Créer le PV de réception")
                  }
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}