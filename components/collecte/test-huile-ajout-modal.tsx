"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { 
  Loader2, 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  Scale, 
  Package, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ChevronsUpDown, 
  Plus, 
  AlertTriangle, 
  Info,
  CreditCard,
  Box,
  Weight,
  Package2,
  DollarSign
} from "lucide-react";
import { toast } from "react-toastify";
import { ficheService, ficheReceptionUtils } from "@/lib/TestHuille/fiche-reception-api";
import { siteCollecteApi, siteCollecteUtils } from "@/lib/siteCollecte/site-collecte-api";
import { useSolde } from "@/contexts/paimentEnAvance/solde-context";
import type { CreateFicheReceptionData, Fournisseur, InfosFournisseurResponse } from "@/lib/TestHuille/fiche-reception-types";
import type { SiteCollecte } from "@/lib/siteCollecte/site-collecte-types";

interface TestHuileAjoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TestHuileAjoutModal({ open, onOpenChange, onSuccess }: TestHuileAjoutModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { refreshSoldes } = useSolde();
  const [formData, setFormData] = useState({
    date_reception: new Date().toISOString().split("T")[0],
    heure_reception: new Date().toTimeString().slice(0, 5),
    fournisseur_id: 0,
    site_collecte_id: 0,
    poids_brut: "",
    type_emballage: "",
    poids_emballage: "",
    nombre_colisage: "",
    prix_unitaire: ""
  });

  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [sitesCollecte, setSitesCollecte] = useState<SiteCollecte[]>([]);
  const [infosFournisseur, setInfosFournisseur] = useState<any>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isLoadingInfos, setIsLoadingInfos] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [showSiteInput, setShowSiteInput] = useState(false);
  const [newSiteName, setNewSiteName] = useState("");

  // Combobox fournisseur
  const [openFournisseur, setOpenFournisseur] = useState(false);
  const [searchFournisseur, setSearchFournisseur] = useState("");

  // Charger les données une seule fois au montage du composant
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [fourRes, sitesRes] = await Promise.all([
          ficheService.getFournisseursDisponibles(),
          siteCollecteApi.getAll(),
        ]);

        if (fourRes.success) {
          setFournisseurs(fourRes.data || []);
        } else {
          toast.error(fourRes.message || "Impossible de charger les fournisseurs");
        }

        setSitesCollecte(sitesRes.data || []);
      } catch (err) {
        toast.error("Erreur de chargement des données");
        console.error("Erreur chargement:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []); 

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setFormData({
        date_reception: new Date().toISOString().split("T")[0],
        heure_reception: new Date().toTimeString().slice(0, 5),
        fournisseur_id: 0,
        site_collecte_id: 0,
        poids_brut: "",
        type_emballage: "",
        poids_emballage: "",
        nombre_colisage: "",
        prix_unitaire: ""
      });
      setSearchFournisseur("");
      setShowSiteInput(false);
      setNewSiteName("");
      setInfosFournisseur(null);
    }
  }, [open]);

  // Charger les infos du fournisseur sélectionné
  useEffect(() => {
    const fetchInfosFournisseur = async () => {
      if (formData.fournisseur_id > 0) {
        setIsLoadingInfos(true);
        try {
          const response = await ficheService.getInfosFournisseur(formData.fournisseur_id);
          if (response.success) {
            setInfosFournisseur(response.data);
            
            if (!response.data.resume.peut_creer_pv) {
              toast.warning(response.data.resume.alertes);
            }
          } else {
            toast.error(response.message || "Impossible de charger les informations du fournisseur");
          }
        } catch (err) {
          console.error("Erreur chargement infos fournisseur:", err);
        } finally {
          setIsLoadingInfos(false);
        }
      } else {
        setInfosFournisseur(null);
      }
    };

    fetchInfosFournisseur();
  }, [formData.fournisseur_id]);

  // Fonction pour créer un site manuellement
  const createSiteManually = async () => {
    if (!newSiteName.trim()) {
      toast.error("Veuillez saisir un nom pour le site de collecte");
      return;
    }

    setIsCreatingSite(true);

    try {
      const erreurs = siteCollecteUtils.validerDonnees({ Nom: newSiteName.trim() });
      if (erreurs.length > 0) {
        erreurs.forEach(erreur => toast.error(erreur));
        return;
      }

      const newSite = await siteCollecteApi.create({ Nom: newSiteName.trim() });
      const sitesRes = await siteCollecteApi.getAll();
      setSitesCollecte(sitesRes.data || []);
      
      handleChange("site_collecte_id", newSite.data.id);
      setShowSiteInput(false);
      setNewSiteName("");
      toast.success("Site de collecte créé et sélectionné");
    } catch (error: any) {
      toast.error(error.message || "Impossible de créer le site de collecte");
    } finally {
      setIsCreatingSite(false);
    }
  };

  const filteredFournisseurs = fournisseurs.filter(f =>
    `${f.prenom} ${f.nom} ${f.contact}`.toLowerCase().includes(searchFournisseur.toLowerCase())
  );

  const selectedFournisseur = fournisseurs.find(f => f.id === formData.fournisseur_id);
  const selectedSite = sitesCollecte.find(s => s.id === formData.site_collecte_id);

  const isFournisseurDisponible = infosFournisseur?.resume?.peut_creer_pv;
  const isStep1Valid = formData.fournisseur_id > 0 && formData.site_collecte_id > 0 && 
                      formData.date_reception && formData.heure_reception && 
                      isFournisseurDisponible;
  const isStep2Valid = isStep1Valid && formData.poids_brut && parseFloat(formData.poids_brut) > 0;

  const handleNext = () => {
    if (isStep1Valid) {
      setCurrentStep(2);
    } else {
      if (!formData.fournisseur_id) {
        toast.error("Veuillez sélectionner un fournisseur");
      } else if (!isFournisseurDisponible) {
        toast.error("Fournisseur non disponible - Ce fournisseur a des paiements en attente");
      } else {
        toast.error("Veuillez remplir tous les champs obligatoires");
      }
    }
  };

  const handlePrev = () => setCurrentStep(1);

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Utilisateur non authentifié");
      return;
    }

    const requestData: CreateFicheReceptionData = {
      date_reception: formData.date_reception,
      heure_reception: formData.heure_reception,
      fournisseur_id: formData.fournisseur_id,
      site_collecte_id: formData.site_collecte_id,
      utilisateur_id: user.id,
      poids_brut: parseFloat(formData.poids_brut),
      type_emballage: formData.type_emballage as 'sac' | 'bidon' | 'fut',
      poids_emballage: formData.poids_emballage ? parseFloat(formData.poids_emballage) : undefined,
      nombre_colisage: formData.nombre_colisage ? parseInt(formData.nombre_colisage) : undefined,
      prix_unitaire: formData.prix_unitaire ? parseFloat(formData.prix_unitaire) : undefined
    };

    const erreurs = ficheReceptionUtils.validerDonnees(requestData);
    if (erreurs.length > 0) {
      erreurs.forEach(erreur => toast.error(erreur));
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await ficheService.create(requestData);

      if (response.success) {
        toast.success(`Fiche créée ! N° ${response.data.numero_document}`);

        // Rafraîchir le solde après succès
        await refreshSoldes();
        
        onSuccess?.();
        onOpenChange(false);
      } else {
        throw new Error(response.message || "Erreur lors de la création");
      }
    } catch (err: any) {
      console.error('Erreur création fiche:', err);
      toast.error(err.response?.data?.message || err.message || "Erreur inconnue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white rounded-2xl">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-[#76bc21] to-[#5f9a1a] rounded-full flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold">Nouvelle Fiche de Réception</DialogTitle>
              <DialogDescription>
                Étape {currentStep}/2 — {currentStep === 1 ? "Informations générales" : "Détails et poids"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-[#76bc21]" />
            <p className="mt-4 text-lg">Chargement...</p>
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
                  <Label className="font-semibold">Fournisseur *</Label>
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
                      {!isFournisseurDisponible ? (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          <AlertTriangle className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Fournisseur non disponible</div>
                            <div className="text-xs">{infosFournisseur.resume.alertes}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                          <Check className="h-4 w-4" />
                          <div>
                            <div className="font-medium">Fournisseur disponible</div>
                          </div>
                        </div>
                      )}

                      {(infosFournisseur.paiements_avance.total_disponibles > 0 || infosFournisseur.paiements_avance.total_en_attente > 0) && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex items-center gap-2 mb-3">
                            <CreditCard className="h-4 w-4 text-gray-600" />
                            <span className="text-sm font-medium">Paiements d'avance</span>
                          </div>
                          
                          {infosFournisseur.paiements_avance.total_disponibles > 0 && (
                            <div className="mb-3">
                              <div className="flex justify-between items-center text-xs text-green-600 mb-2">
                                <span>Reste :</span>
                                <span className="font-medium" style={{ color: "#72bc21" }}>
                                  {infosFournisseur.paiements_avance.total_disponibles.toLocaleString()} Ar
                                </span>
                              </div>
                              <div className="space-y-1">
                                {infosFournisseur.paiements_avance.details_disponibles.map((paiement: any) => (
                                  <div key={paiement.id} className="flex justify-between items-center text-xs bg-white p-2 rounded border">
                                    <div>
                                      <div className="font-medium">{paiement.reference}</div>
                                      <div className="text-gray-500">{new Date(paiement.date).toLocaleDateString()}</div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium" style={{ color: "#72bc21" }}>
                                        {paiement.montant.toLocaleString()} Ar
                                      </div>
                                      <div className="text-gray-500 capitalize">{paiement.type}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {infosFournisseur.paiements_avance.total_en_attente > 0 && (
                            <div>
                              <div className="flex justify-between items-center text-xs text-amber-600 mb-2">
                                <span>En attente</span>
                                <span className="font-medium">{infosFournisseur.paiements_avance.total_en_attente.toLocaleString()} Ar</span>
                              </div>
                              <div className="space-y-1">
                                {infosFournisseur.paiements_avance.details_en_attente.map((paiement: any) => (
                                  <div key={paiement.id} className="flex justify-between items-center text-xs bg-amber-50 p-2 rounded border border-amber-200">
                                    <div>
                                      <div className="font-medium">{paiement.reference}</div>
                                      <div className="text-amber-600 text-xs">
                                        {paiement.est_en_retard ? (
                                          <span className="text-red-600">En retard</span>
                                        ) : (
                                          <span>Délai: {paiement.temps_restant}</span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-medium">{paiement.montant.toLocaleString()} Ar</div>
                                      <div className="text-amber-600 capitalize">{paiement.type}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Date + Heure */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Date de réception (auto):</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="date"
                        value={formData.date_reception}
                        onChange={e => handleChange("date_reception", e.target.value)}
                        className="h-12 pl-10"
                        required
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Heure de réception (auto):</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="time"
                        value={formData.heure_reception}
                        onChange={e => handleChange("heure_reception", e.target.value)}
                        className="h-12 pl-10"
                        required
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                {/* Site de collecte */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Site de collecte *</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSiteInput(!showSiteInput)}
                        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        style={{ borderColor: "#76bc21", color: "#76bc21" }}
                      >
                        <Plus className="w-4 h-4" />
                        Nouveau
                      </button>
                    </div>
                  </div>
                  
                  {showSiteInput && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">Nouveau site de collecte</label>
                          <input
                            type="text"
                            value={newSiteName}
                            onChange={(e) => setNewSiteName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                            placeholder="Saisir le nom du site de collecte"
                            maxLength={50}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={createSiteManually}
                          disabled={isCreatingSite || !newSiteName.trim()}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {isCreatingSite ? "Création..." : "Créer"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21] z-10" />
                    <Select
                      value={formData.site_collecte_id.toString()}
                      onValueChange={v => handleChange("site_collecte_id", parseInt(v))}
                    >
                      <SelectTrigger className="h-12 pl-10">
                        <SelectValue placeholder="Choisir un site de collecte existant" />
                      </SelectTrigger>
                      <SelectContent>
                        {sitesCollecte.map(site => (
                          <SelectItem key={site.id} value={site.id.toString()}>
                            {site.Nom}
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
                <div className="space-y-2">
                  <Label>Poids brut (kg) *</Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.poids_brut}
                      onChange={e => handleChange("poids_brut", e.target.value)}
                      className="h-12 pl-10"
                      placeholder="45.50"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Type d'emballage</Label>
                    <div className="relative">
                      <Box className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Select
                        value={formData.type_emballage}
                        onValueChange={v => handleChange("type_emballage", v)}
                      >
                        <SelectTrigger className="h-12 pl-10">
                          <SelectValue placeholder="Choisir le type" />
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
                    <Label>Poids emballage (kg)</Label>
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.poids_emballage}
                        onChange={e => handleChange("poids_emballage", e.target.value)}
                        className="h-12 pl-10"
                        placeholder="2.50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nombre de colisage</Label>
                    <div className="relative">
                      <Package2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        value={formData.nombre_colisage}
                        onChange={e => handleChange("nombre_colisage", e.target.value)}
                        className="h-12 pl-10"
                        placeholder="10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Prix unitaire (Ar/kg)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#76bc21]" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.prix_unitaire}
                        onChange={e => handleChange("prix_unitaire", e.target.value)}
                        className="h-12 pl-10"
                        placeholder="850.00"
                      />
                    </div>
                  </div>
                </div>

                {infosFournisseur?.paiements_avance?.total_disponibles > 0 && (
                  <div className="p-3 rounded-lg border" style={{ 
                    backgroundColor: "rgba(114, 188, 33, 0.1)", 
                    borderColor: "#72bc21" 
                  }}>
                    <div className="flex items-center gap-2" style={{ color: "#72bc21" }}>
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Paiements d'avance restants: {infosFournisseur.paiements_avance.total_disponibles.toLocaleString()} Ar
                      </span>
                    </div>
                  </div>
                )}
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
                  disabled={!isStep1Valid || isLoadingInfos}
                  className="flex-1 bg-[#76bc21] hover:bg-[#5f9a1a]"
                >
                  {isLoadingInfos ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Suivant <ChevronRight className="h-5 w-5 ml-1" />
                    </>
                  )}
                </Button>
              )}

              {currentStep === 2 && (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isStep2Valid}
                  className="flex-1 bg-[#76bc21] hover:bg-[#5f9a1a]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Création en cours...
                    </>
                  ) : (
                    <>Créer la fiche</>
                  )}
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}