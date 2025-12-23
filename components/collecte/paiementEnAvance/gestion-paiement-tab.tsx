// components/collecte/gestion-paiement-tab.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Download,
  FileDown,
  CheckCircle,
  XCircle,
  Archive,
} from "lucide-react";
import { toast } from "react-toastify";
import { PaiementModal } from "./paiement-modal";
import { GererPaymentSuppression } from "./gerer-payment-suppression";
import { ConfirmationModal } from "./confirmation-modal";
import { paiementEnAvanceAPI } from "@/lib/paiementEnAvance/paiementEnAvance-api";
import { PaiementEnAvance, StatutPaiement } from "@/lib/paiementEnAvance/paiementEnAvance-types";
import { exportPaiementsToPDF, exportSinglePaiementToPDF } from "./pdf-export";
import { useAuth } from "@/contexts/auth-context";

const COLOR = "#72bc21";

const formatCountdown = (totalSeconds: number) => {
  if (totalSeconds <= 0) return "00:00:00";
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

const CountdownDisplay = ({ paiement, currentTime }: { paiement: PaiementEnAvance; currentTime: Date }) => {
  if (paiement.statut !== "en_attente" || paiement.type !== "avance") {
    return <span className="text-gray-400">—</span>;
  }

  // CORRIGÉ: delaiHeures est en heures, pas en minutes
  const delaiHeures = paiement.delaiHeures || 6; // 6 heures par défaut
  const delaiMinutes = delaiHeures * 60; // Convertir heures en minutes
  const dateLimite = new Date(
    new Date(paiement.created_at || paiement.date).getTime() + delaiMinutes * 60 * 1000
  );
  const diff = dateLimite.getTime() - currentTime.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));

  const isUrgent = totalSeconds < 300; // 5 minutes
  const isWarning = totalSeconds < 1800; // 30 minutes

  if (totalSeconds === 0) {
    return (
      <div className="flex items-center gap-1 text-red-600 font-semibold animate-pulse">
        <AlertTriangle className="w-4 h-4" />
        En retard
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-1 font-mono text-sm font-bold ${
        isUrgent ? "text-red-600 animate-pulse" : isWarning ? "text-orange-600" : "text-green-600"
      }`}
    >
      <Clock className="w-4 h-4" />
      {formatCountdown(totalSeconds)}
    </div>
  );
};

const ActionButtons = ({ paiement, onConfirm, onCancel, loading }: any) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button
          size="sm"
          style={{ backgroundColor: COLOR }}
          className="text-white text-xs"
          onClick={() => onConfirm(paiement.id)}
          disabled={loading || paiement.statut !== "en_attente"}
        >
          {loading ? (
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <CheckCircle className="w-3 h-3 mr-1" />
          )}
          Confirmer
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowCancelConfirm(true)}
          disabled={loading || paiement.statut !== "en_attente"}
        >
          {loading ? (
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <XCircle className="w-3 h-3 mr-1" />
          )}
          Annuler
        </Button>
      </div>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          onCancel(paiement.id);
          setShowCancelConfirm(false);
        }}
        title="Annuler la livraison ?"
        description="Cette action est irréversible."
        confirmText="Oui, annuler"
        cancelText="Non"
        loading={loading}
      />
    </>
  );
};

export function GestionPaiementTab({ onSoldeChange }: { onSoldeChange?: () => Promise<void> }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isCollecteur = user?.role === "collecteur";

  const [searchTerm, setSearchTerm] = useState("");
  const [paiements, setPaiements] = useState<PaiementEnAvance[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showArchives, setShowArchives] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedPaiement, setSelectedPaiement] = useState<PaiementEnAvance | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAnnulerOpen, setIsAnnulerOpen] = useState(false);

  useEffect(() => {
    const fetchPaiements = async () => {
      try {
        const res = await paiementEnAvanceAPI.getAll();
        if (res.success) {
          setPaiements(res.data || []);
        } else {
          toast.error(res.message || "Erreur de chargement");
        }
      } catch (err: any) {
        toast.error("Impossible de charger les paiements");
      }
    };
    fetchPaiements();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refresh = async () => {
    try {
      const res = await paiementEnAvanceAPI.getAll();
      if (res.success) setPaiements(res.data || []);
    } catch {
      toast.error("Échec rafraîchissement");
    }
  };

  const actifs = useMemo(() => paiements.filter((p) => p.statut !== "annulé"), [paiements]);
  const archives = useMemo(() => paiements.filter((p) => p.statut === "annulé"), [paiements]);

  const filtered = useMemo(() => {
    const source = showArchives ? archives : actifs;
    if (!searchTerm) return source;
    const term = searchTerm.toLowerCase();
    return source.filter(
      (p) =>
        p.reference?.toLowerCase().includes(term) ||
        `${p.fournisseur?.prenom || ""} ${p.fournisseur?.nom || ""}`.toLowerCase().includes(term) ||
        p.fournisseur?.contact?.includes(term)
    );
  }, [paiements, searchTerm, showArchives]);

  const handleConfirm = async (id: number) => {
    setActionLoading(true);
    try {
      // CORRIGÉ: Utiliser la méthode API correcte (POST, pas PUT)
      const result = await paiementEnAvanceAPI.confirmer(id);
      
      if (result.success) {
        toast.success("Paiement confirmé avec succès !");
        setPaiements((prev) => prev.map((p) => (p.id === id ? { ...p, statut: "arrivé" } : p)));
        if (onSoldeChange) await onSoldeChange();
      } else {
        toast.error(result.message || "Échec de confirmation");
      }
    } catch (err: any) {
      console.error("Erreur confirmation paiement:", err);
      toast.error(err.response?.data?.message || "Erreur lors de la confirmation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnnuler = async (id: number, raison: string = "Annulation manuelle") => {
    setActionLoading(true);
    try {
      // CORRIGÉ: Utiliser la méthode API correcte (POST, pas PUT)
      const result = await paiementEnAvanceAPI.annuler(id, raison);
      
      if (result.success) {
        toast.success("Paiement annulé avec succès !");
        setPaiements((prev) => prev.map((p) => (p.id === id ? { ...p, statut: "annulé" } : p)));
        if (onSoldeChange) await onSoldeChange();
      } else {
        toast.error(result.message || "Échec d'annulation");
      }
    } catch (err: any) {
      console.error("Erreur annulation paiement:", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(false);
      setIsAnnulerOpen(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPaiement) return;
    
    // Pour supprimer, on annule le paiement
    try {
      const result = await paiementEnAvanceAPI.annuler(selectedPaiement.id, "Suppression définitive");
      
      if (result.success) {
        toast.success("Paiement supprimé (annulé) avec succès");
        setPaiements((prev) =>
          prev.map((p) => (p.id === selectedPaiement.id ? { ...p, statut: "annulé" } : p))
        );
        if (onSoldeChange) await onSoldeChange();
      } else {
        toast.error(result.message || "Erreur lors de la suppression");
      }
    } catch (err: any) {
      console.error("Erreur suppression paiement:", err);
      toast.error(err.response?.data?.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleteOpen(false);
      setSelectedPaiement(null);
    }
  };

  const handleModalSuccess = async () => {
    await refresh();
    if (onSoldeChange) await onSoldeChange();
  };

  const handleExportAll = async () => {
    if (filtered.length === 0) return toast.info("Rien à exporter");
    setExportLoading(true);
    try {
      await exportPaiementsToPDF(filtered, showArchives, searchTerm);
      toast.success("PDF généré avec succès !");
    } catch (err) {
      console.error("Erreur export PDF:", err);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportOne = async (p: PaiementEnAvance) => {
    setExportLoading(true);
    try {
      await exportSinglePaiementToPDF(p);
      toast.success("PDF généré avec succès");
    } catch (err) {
      console.error("Erreur export single PDF:", err);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setExportLoading(false);
    }
  };

  const openModal = (mode: "add" | "edit" | "view", paiement?: PaiementEnAvance) => {
    setModalMode(mode);
    setSelectedPaiement(paiement || null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (paiement: PaiementEnAvance) => {
    setSelectedPaiement(paiement);
    setIsDeleteOpen(true);
  };

  const openAnnulerModal = (paiement: PaiementEnAvance) => {
    setSelectedPaiement(paiement);
    setIsAnnulerOpen(true);
  };

  const getStatusBadge = (statut: StatutPaiement) => {
    const styles: Record<StatutPaiement, string> = {
      arrivé: "text-green-700 bg-green-50 border-green-200",
      annulé: "text-red-700 bg-red-50 border-red-200",
      en_attente: "text-orange-700 bg-orange-50 border-orange-200",
      utilise: "text-blue-700 bg-blue-50 border-blue-200",
    };
    const text = { 
      arrivé: "Arrivé", 
      annulé: "Annulé", 
      en_attente: "En attente", 
      utilise: "Utilisé" 
    }[statut] || statut;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statut]}`}>
        {text}
      </span>
    );
  };

  const isEmpty = paiements.length === 0;
  const hasResults = filtered.length > 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 mx-auto">
      {/* En-tête */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#72bc21]">Gestion des Avances Fournisseurs</h2>
          <p className="text-sm text-gray-600 mt-1">Suivi en temps réel des délais de livraison</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full lg:w-64"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportAll}
              disabled={!hasResults || exportLoading}
              className="bg-[#72bc21] hover:bg-[#5a9e18] text-white"
            >
              {exportLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              PDF
            </Button>

            {/* Bouton "Ajouter une avance" → UNIQUEMENT pour collecteur */}
            {isCollecteur && (
              <Button
                onClick={() => openModal("add")}
                style={{ backgroundColor: COLOR }}
                className="text-white hover:opacity-90 transition-all hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une avance
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bouton Archives */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <Button
          variant={showArchives ? "default" : "outline"}
          onClick={() => setShowArchives(!showArchives)}
          className="bg-[#72bc21] hover:bg-[#5a9e18] text-white"
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchives ? "Actifs" : "Archives"}
        </Button>
        <p className="text-sm text-gray-600">
          {showArchives ? archives.length : actifs.length} paiement(s)
          {searchTerm && ` • ${filtered.length} trouvé(s)`}
        </p>
      </div>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {!hasResults ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">
              {isEmpty ? "Aucune avance enregistrée" : "Aucun résultat"}
            </p>
          </div>
        ) : (
          filtered.map((paiement) => (
            <div key={paiement.id} className="bg-white rounded-xl border p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-lg" style={{ color: COLOR }}>
                    {paiement.reference}
                  </p>
                  <p className="font-medium">{paiement.type.replace("_", " ")}</p>
                </div>
                {getStatusBadge(paiement.statut)}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fournisseur</span>
                  <span>
                    {paiement.fournisseur?.prenom} {paiement.fournisseur?.nom}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact</span>
                  <span>{paiement.fournisseur?.contact}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span>{paiement.montant?.toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Utilisé</span>
                  <span>{(paiement.montant_utilise || 0).toLocaleString()} Ar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Restant</span>
                  <span className="font-medium text-green-600">{(paiement.montant_restant || paiement.montant || 0).toLocaleString()} Ar</span>
                </div>

                {!showArchives && paiement.statut === "en_attente" && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Délai</span>
                      <strong>{paiement.delaiHeures ? `${paiement.delaiHeures} min` : "6h"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Restant</span>
                      <CountdownDisplay paiement={paiement} currentTime={currentTime} />
                    </div>
                  </>
                )}
              </div>

              {/* Actions Mobile */}
              <div className="grid grid-cols-3 gap-2 mt-5">
                <Button size="sm" variant="outline" onClick={() => openModal("view", paiement)}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  style={{ backgroundColor: COLOR }}
                  className="text-white"
                  onClick={() => handleExportOne(paiement)}
                >
                  <Download className="h-4 w-4" />
                </Button>
                {/* SUPPRIMER → UNIQUEMENT admin */}
                {isAdmin && (
                  <Button size="sm" variant="destructive" onClick={() => openDeleteModal(paiement)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {!showArchives && paiement.statut === "en_attente" && (
                <div className="mt-4 pt-4 border-t">
                  {/* CORRIGÉ: Utiliser handleAnnuler au lieu de handleCancel */}
                  <ActionButtons
                    paiement={paiement}
                    onConfirm={handleConfirm}
                    onCancel={() => openAnnulerModal(paiement)}
                    loading={actionLoading}
                  />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden lg:block bg-white rounded-xl border overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-linear-to-r from-[#72bc21]/10 to-[#72bc21]/5">
              <TableHead className="font-bold">Référence</TableHead>
              <TableHead className="font-bold">Fournisseur</TableHead>
              <TableHead className="font-bold">Montants</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="font-bold">Statut</TableHead>
              {!showArchives && (
                <>
                  <TableHead className="font-bold">Délai initial</TableHead>
                  <TableHead className="font-bold">Délai restant</TableHead>
                  <TableHead className="font-bold">Confirmation</TableHead>
                </>
              )}
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!hasResults ? (
              <TableRow>
                <TableCell colSpan={showArchives ? 6 : 9} className="text-center py-12 text-gray-500">
                  {isEmpty ? "Aucune avance enregistrée" : "Aucun résultat"}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((paiement) => (
                <TableRow key={paiement.id} className="hover:bg-gray-50">
                  <TableCell className="font-bold">{paiement.reference}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {paiement.fournisseur?.prenom} {paiement.fournisseur?.nom}
                      </div>
                      <div className="text-sm text-gray-500">{paiement.fournisseur?.contact}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Total : {paiement.montant?.toLocaleString()} Ar</div>
                      <div className="text-gray-600">Utilisé : {(paiement.montant_utilise || 0).toLocaleString()} Ar</div>
                      <div className="font-medium text-green-600">Restant : {(paiement.montant_restant || paiement.montant || 0).toLocaleString()} Ar</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(paiement.date).toLocaleDateString("fr-FR")}{" "}
                    {new Date(paiement.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{getStatusBadge(paiement.statut)}</TableCell>

                  {!showArchives && (
                    <>
                      <TableCell className="font-mono">
                        {paiement.delaiHeures ? `${paiement.delaiHeures} min` : "6h"}
                      </TableCell>
                      <TableCell>
                        <CountdownDisplay paiement={paiement} currentTime={currentTime} />
                      </TableCell>
                      <TableCell>
                        {paiement.statut === "en_attente" && (
                          <ActionButtons
                            paiement={paiement}
                            onConfirm={handleConfirm}
                            onCancel={() => openAnnulerModal(paiement)}
                            loading={actionLoading}
                          />
                        )}
                      </TableCell>
                    </>
                  )}

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openModal("view", paiement)}>
                          <Eye className="mr-2 h-4 w-4" /> Voir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportOne(paiement)}>
                          <Download className="mr-2 h-4 w-4" /> PDF
                        </DropdownMenuItem>
                        {paiement.statut === "en_attente" && (
                          <DropdownMenuItem onClick={() => openModal("edit", paiement)}>
                            <Edit className="mr-2 h-4 w-4" /> Modifier
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        {/* SUPPRIMER → UNIQUEMENT admin */}
                        {isAdmin && (
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => openDeleteModal(paiement)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      <PaiementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPaiement(null);
        }}
        mode={modalMode}
        paiement={selectedPaiement}
        onSuccess={handleModalSuccess}
      />

      {/* Modal de suppression → uniquement pour admin */}
      {isAdmin && (
        <GererPaymentSuppression
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedPaiement(null);
          }}
          onConfirm={handleDelete}
          paiement={selectedPaiement}
        />
      )}

      {/* Modal d'annulation */}
      <ConfirmationModal
        isOpen={isAnnulerOpen}
        onClose={() => {
          setIsAnnulerOpen(false);
          setSelectedPaiement(null);
        }}
        onConfirm={() => {
          if (selectedPaiement) {
            handleAnnuler(selectedPaiement.id, "Annulation manuelle");
          }
        }}
        title="Annuler ce paiement ?"
        description="Le montant sera remboursé et le paiement marqué comme annulé."
        confirmText="Oui, annuler"
        cancelText="Non, garder"
        loading={actionLoading}
      />
    </div>
  );
}