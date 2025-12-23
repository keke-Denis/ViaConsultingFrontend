// app/destinataires/DestinateurTable.tsx
"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from 'react-toastify'
import { Search, Plus, MoreHorizontal, Eye, Edit, Trash2, FileDown, ChevronRight, Calendar, Building, Download, User, Phone, Clock, MapPin, Info } from "lucide-react"

import DestinataireModal from "./DestinataireModal"
import SupprimerDestinateurModal from "./SupprimerDestinateurModal"
import { destinateurApi } from "@/lib/destinateur/destinateur-api"
import type { Destinateur } from "@/lib/destinateur/destinateur-types"
import { exportDestinateursToPDF, exportDestinateurDetailToPDF } from "./pdf-export"

const COLOR = "#72bc21"

// Composant de chargement moderne
const LoadingSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
      >
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
        </div>
        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
      </motion.div>
    ))}
  </div>
)

// Composant pour les détails expansibles
const DetailRow = ({ destinateur, isOpen }: { destinateur: Destinateur; isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.tr
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gradient-to-r from-green-50/30 to-green-20/30"
      >
        <TableCell colSpan={7} className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Observation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4" style={{ color: COLOR }} />
                <h4 className="font-semibold text-gray-900">Observation</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 text-sm leading-relaxed">
                  {destinateur.observation || (
                    <span className="text-gray-400 italic">Aucune observation</span>
                  )}
                </p>
              </div>
            </div>

            {/* Informations de création */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: COLOR }} />
                <h4 className="font-semibold text-gray-900">Création</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Créé par</p>
                  <p className="text-sm font-medium text-gray-900">
                    {destinateur.createur?.prenom && destinateur.createur?.nom 
                      ? `${destinateur.createur.prenom} ${destinateur.createur.nom}`
                      : "Utilisateur inconnu"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de création</p>
                  <p className="text-sm text-gray-700">
                    {new Date(destinateur.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Dernière modification */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: COLOR }} />
                <h4 className="font-semibold text-gray-900">Dernière modification</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">Modifié le</p>
                  <p className="text-sm text-gray-700">
                    {new Date(destinateur.updated_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </TableCell>
      </motion.tr>
    )}
  </AnimatePresence>
)

// Composant de carte moderne pour la vue mobile
const DestinateurCard = ({ 
  destinateur, 
  onView, 
  onEdit, 
  onDelete,
  onExport 
}: { 
  destinateur: Destinateur
  onView: () => void
  onEdit: () => void
  onDelete: () => void
  onExport: () => void
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center">
              <Building className="h-5 w-5" style={{ color: COLOR }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{destinateur.nom_entreprise}</h3>
              <p className="text-sm text-gray-600">{destinateur.nom_prenom}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span>{destinateur.contact}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(destinateur.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}>
              <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExport}>
              <Download className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Exporter PDF
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1 font-medium">Observation</p>
                <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                  {destinateur.observation || "Aucune observation"}
                </p>
              </div>
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Créé par</p>
                  <p className="text-gray-900">
                    {destinateur.createur?.prenom && destinateur.createur?.nom 
                      ? `${destinateur.createur.prenom} ${destinateur.createur.nom}`
                      : "Utilisateur inconnu"
                    }
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Modifié le</p>
                  <p className="text-gray-900">
                    {new Date(destinateur.updated_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function DestinateurTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openRows, setOpenRows] = useState<Set<number>>(new Set())
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDestinateur, setSelectedDestinateur] = useState<Destinateur | null>(null)
  const [destinateurs, setDestinateurs] = useState<Destinateur[]>([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        // Simuler un délai de chargement pour voir l'animation
        await new Promise(resolve => setTimeout(resolve, 1000))
        const data = await destinateurApi.getAll()
        setDestinateurs(data)
      } catch (err) {
        toast.error("Erreur lors du chargement des destinataires", {
          position: "top-right",
          autoClose: 5000,
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const toggleRow = (id: number) => {
    setOpenRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getCreateurName = (d: Destinateur) => {
    if (d.createur?.prenom && d.createur?.nom) {
      return `${d.createur.prenom} ${d.createur.nom}`
    }
    return "Utilisateur inconnu"
  }

  const openModal = (mode: "add" | "edit" | "view", dest?: Destinateur) => {
    setModalMode(mode)
    setSelectedDestinateur(dest || null)
    setModalOpen(true)
  }

  const handleSuccess = (updated: Destinateur) => {
    if (modalMode === "add") {
      setDestinateurs(prev => [...prev, updated])
    } else {
      setDestinateurs(prev => prev.map(d => d.id === updated.id ? updated : d))
    }
    setModalOpen(false)
  }

  const handleDelete = async (id: number) => {
    try {
      await destinateurApi.delete(id)
      setDestinateurs(prev => prev.filter(d => d.id !== id))
      toast.success("Destinataire supprimé avec succès", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (err) {
      toast.error("Erreur lors de la suppression", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setDeleteModalOpen(false)
    }
  }

  // Fonction d'export de la liste complète
  const handleExportAll = async () => {
    if (filtered.length === 0) {
      toast.warning("Aucun destinataire à exporter", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setExportLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simuler le chargement
      exportDestinateursToPDF(filtered, "Liste des Destinataires")
      toast.success("Export PDF généré avec succès", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      toast.error("Erreur lors de l'export PDF", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setExportLoading(false)
    }
  }

  // Fonction d'export d'un destinataire spécifique
  const handleExportSingle = (destinateur: Destinateur) => {
    try {
      exportDestinateurDetailToPDF(destinateur)
      toast.success("Fiche destinataire exportée avec succès", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      toast.error("Erreur lors de l'export de la fiche", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const filtered = useMemo(() => {
    if (!searchTerm) return destinateurs
    const lower = searchTerm.toLowerCase()
    return destinateurs.filter(d =>
      d.nom_entreprise.toLowerCase().includes(lower) ||
      d.nom_prenom.toLowerCase().includes(lower) ||
      d.contact.includes(lower) ||
      (d.observation?.toLowerCase().includes(lower) ?? false)
    )
  }, [searchTerm, destinateurs])

  return (
    <>
      <div className="space-y-6 p-6">
        {/* En-tête modernisé */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Destinataires</h1>
            <p className="text-gray-600">Gérez vos destinataires et leurs informations</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un destinataire..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 w-full lg:w-80 h-11 rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 h-11 px-4 rounded-xl"
                onClick={handleExportAll}
                disabled={exportLoading || filtered.length === 0}
              >
                {exportLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
                    Génération...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" /> Exporter PDF
                  </>
                )}
              </Button>
              <Button 
                style={{ backgroundColor: COLOR }} 
                onClick={() => openModal("add")}
                className="h-11 px-6 rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4 mr-2" /> Nouveau destinataire
              </Button>
            </div>
          </div>
        </motion.div>

        {/* État de chargement */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
            <LoadingSkeleton />
          </motion.div>
        )}

        {/* État vide */}
        {destinateurs.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building className="h-10 w-10" style={{ color: COLOR }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun destinataire</h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Commencez par ajouter votre premier destinataire pour organiser vos contacts.
            </p>
            <Button 
              style={{ backgroundColor: COLOR }} 
              onClick={() => openModal("add")}
              className="rounded-xl px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" /> Ajouter le premier destinataire
            </Button>
          </motion.div>
        )}

        {/* Vue desktop - Tableau avec détails */}
        {!loading && destinateurs.length > 0 && (
          <>
            <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">
                    {filtered.length} destinataire{filtered.length > 1 ? 's' : ''}
                    {searchTerm && ` trouvé(s) pour "${searchTerm}"`}
                  </h3>
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold text-gray-900">Entreprise</TableHead>
                    <TableHead className="font-semibold text-gray-900">Contact</TableHead>
                    <TableHead className="font-semibold text-gray-900">Téléphone</TableHead>
                    <TableHead className="font-semibold text-gray-900">Créé le</TableHead>
                    <TableHead className="font-semibold text-gray-900">Par</TableHead>
                    <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filtered.map((d, index) => {
                      const isOpen = openRows.has(d.id)
                      return (
                        <React.Fragment key={d.id}>
                          <motion.tr
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                            onClick={() => toggleRow(d.id)}
                          >
                            <TableCell>
                              <motion.div 
                                animate={{ rotate: isOpen ? 90 : 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                              </motion.div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 bg-gradient-to-br from-green-100 to-green-50 rounded-lg flex items-center justify-center"
                                  style={{ 
                                    background: `linear-gradient(135deg, ${COLOR}20, ${COLOR}10)` 
                                  }}
                                >
                                  <Building className="h-4 w-4" style={{ color: COLOR }} />
                                </div>
                                <span className="font-semibold text-gray-900">{d.nom_entreprise}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700">{d.nom_prenom}</TableCell>
                            <TableCell className="text-gray-700">{d.contact}</TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {formatDate(d.created_at)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-sm text-gray-600">{getCreateurName(d)}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-lg"
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-xl w-48">
                                  <DropdownMenuItem 
                                    onClick={e => { e.stopPropagation(); openModal("view", d) }}
                                    className="rounded-lg"
                                  >
                                    <Eye className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Voir
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={e => { e.stopPropagation(); openModal("edit", d) }}
                                    className="rounded-lg"
                                  >
                                    <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={e => { e.stopPropagation(); handleExportSingle(d) }}
                                    className="rounded-lg"
                                  >
                                    <Download className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Exporter PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 rounded-lg"
                                    onClick={e => {
                                      e.stopPropagation()
                                      setSelectedDestinateur(d)
                                      setDeleteModalOpen(true)
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                          
                          {/* Ligne de détails */}
                          <DetailRow destinateur={d} isOpen={isOpen} />
                        </React.Fragment>
                      )
                    })}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>

            {/* Vue mobile - Cartes */}
            <div className="lg:hidden space-y-4">
              <AnimatePresence>
                {filtered.map((destinateur, index) => (
                  <motion.div
                    key={destinateur.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <DestinateurCard
                      destinateur={destinateur}
                      onView={() => openModal("view", destinateur)}
                      onEdit={() => openModal("edit", destinateur)}
                      onDelete={() => {
                        setSelectedDestinateur(destinateur)
                        setDeleteModalOpen(true)
                      }}
                      onExport={() => handleExportSingle(destinateur)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <DestinataireModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        destinateur={selectedDestinateur}
        onSuccess={handleSuccess}
      />

      <SupprimerDestinateurModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        destinateur={selectedDestinateur}
      />
    </>
  )
}