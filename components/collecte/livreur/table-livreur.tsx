"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Trash2, Search, Plus, ChevronRight, Edit, MoreHorizontal, Eye, Download, User, Phone, Clock, MapPin, Car, IdCard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from 'react-toastify'
import AjouterLivreurModal from "./ajouter-livreur-modal"
import ModifierLivreurModal from "./modifier-livreur-modal"
import SupprimerLivreurModal from "./supprimer-livreur-modal"
import { getLivreurs, supprimerLivreur, modifierLivreur } from "@/lib/livreur/livreur-api"
import type { LivreurFromAPI, LivreurFormData } from "@/lib/livreur/livreur-types"
import { exportLivreursToPDF, exportLivreurDetailToPDF } from "./pdf-export-livreurs"

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
const DetailRow = ({ livreur, isOpen }: { livreur: LivreurFromAPI; isOpen: boolean }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.tr
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="bg-gradient-to-r from-green-50/30 to-green-20/30"
      >
        <TableCell colSpan={8} className="p-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Informations personnelles */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" style={{ color: COLOR }} />
                <h4 className="font-semibold text-gray-900">Informations personnelles</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Date de naissance</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(livreur.date_naissance).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Lieu de naissance</p>
                  <p className="text-sm text-gray-700">{livreur.lieu_naissance}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Contact famille</p>
                  <p className="text-sm text-gray-700">{livreur.contact_famille}</p>
                </div>
              </div>
            </div>

            {/* Informations de livraison */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" style={{ color: COLOR }} />
                <h4 className="font-semibold text-gray-900">Livraison</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Véhicule</p>
                  <p className="text-sm font-medium text-gray-900">{livreur.numero_vehicule}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Zone de livraison</p>
                  <p className="text-sm text-gray-700">{livreur.zone_livraison}</p>
                </div>
                {livreur.observation && (
                  <div className="mt-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-xs text-orange-800 font-medium mb-1">Observation</p>
                    <p className="text-sm text-orange-700">{livreur.observation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Informations de création */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" style={{ color: COLOR }} />
                <h4 className="font-semibold text-gray-900">Création</h4>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Créé par</p>
                  <p className="text-sm font-medium text-gray-900">
                    {livreur.createur.prenom} {livreur.createur.nom} ({livreur.createur.role})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de création</p>
                  <p className="text-sm text-gray-700">
                    {new Date(livreur.created_at).toLocaleDateString("fr-FR", {
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
const LivreurCard = ({ 
  livreur, 
  onView, 
  onEdit, 
  onDelete,
  onExport 
}: { 
  livreur: LivreurFromAPI
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
              <User className="h-5 w-5" style={{ color: COLOR }} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{livreur.prenom} {livreur.nom}</h3>
              <p className="text-sm text-gray-600">{livreur.telephone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
            <div className="flex items-center gap-1">
              <IdCard className="h-3 w-3" />
              <span>{livreur.cin}</span>
            </div>
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{livreur.numero_vehicule}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{livreur.zone_livraison}</span>
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
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Date naissance</p>
                  <p className="text-gray-900">{new Date(livreur.date_naissance).toLocaleDateString("fr-FR")}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1 font-medium">Lieu naissance</p>
                  <p className="text-gray-900">{livreur.lieu_naissance}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1 font-medium">Contact famille</p>
                <p className="text-gray-900">{livreur.contact_famille}</p>
              </div>
              {livreur.observation && (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <p className="text-gray-600 mb-1 font-medium">Observation</p>
                  <p className="text-orange-800">{livreur.observation}</p>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <div>
                  <p>Créé par {livreur.createur.prenom} {livreur.createur.nom}</p>
                </div>
                <div>
                  <p>Le {new Date(livreur.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function TableLivreur() {
  const [searchTerm, setSearchTerm] = useState("")
  const [openRows, setOpenRows] = useState<Set<number>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedLivreur, setSelectedLivreur] = useState<LivreurFromAPI | null>(null)
  const [livreurToDelete, setLivreurToDelete] = useState<LivreurFromAPI | null>(null)
  const [livreurs, setLivreurs] = useState<LivreurFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    loadLivreurs()
  }, [])

  const loadLivreurs = async () => {
    try {
      setLoading(true)
      // Simuler un délai de chargement pour voir l'animation
      await new Promise(resolve => setTimeout(resolve, 1000))
      const data = await getLivreurs()
      setLivreurs(data)
    } catch (error) {
      toast.error("Erreur lors du chargement des livreurs", {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (id: number) => {
    setOpenRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("fr-FR", { 
    day: "2-digit", 
    month: "2-digit", 
    year: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  }).replace(",", " à")

  const formatSimpleDate = (d: string) => new Date(d).toLocaleDateString("fr-FR")

  const filtered = useMemo(() => {
    if (!searchTerm) return livreurs
    const term = searchTerm.toLowerCase()
    return livreurs.filter(l =>
      `${l.prenom} ${l.nom}`.toLowerCase().includes(term) ||
      l.cin.includes(term) ||
      l.telephone.includes(term) ||
      l.zone_livraison.toLowerCase().includes(term)
    )
  }, [searchTerm, livreurs])

  const handleAdd = (nouveau: LivreurFromAPI) => {
    setLivreurs(prev => [...prev, nouveau])
    setShowAddModal(false)
    toast.success("Livreur ajouté avec succès", {
      position: "top-right",
      autoClose: 3000,
    })
  }

  const handleEdit = (livreur: LivreurFromAPI) => {
    setSelectedLivreur(livreur)
    setShowEditModal(true)
  }

  const handleUpdate = async (data: LivreurFormData) => {
    if (!selectedLivreur) return
    
    try {
      const updatedLivreur = await modifierLivreur(selectedLivreur.id, data)
      setLivreurs(prev => prev.map(l => l.id === selectedLivreur.id ? updatedLivreur : l))
      setShowEditModal(false)
      setSelectedLivreur(null)
      toast.success("Livreur modifié avec succès", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      toast.error("Erreur lors de la modification du livreur", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const handleDeleteClick = (livreur: LivreurFromAPI) => {
    setLivreurToDelete(livreur)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!livreurToDelete) return
    
    try {
      await supprimerLivreur(livreurToDelete.id)
      setLivreurs(prev => prev.filter(l => l.id !== livreurToDelete.id))
      setShowDeleteModal(false)
      setLivreurToDelete(null)
      toast.success("Livreur supprimé avec succès", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      toast.error("Erreur lors de la suppression du livreur", {
        position: "top-right",
        autoClose: 5000,
      })
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setLivreurToDelete(null)
  }

  // Fonction d'export de la liste complète
  const handleExportAll = async () => {
    if (filtered.length === 0) {
      toast.warning("Aucun livreur à exporter", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setExportLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      exportLivreursToPDF(filtered, "Liste des Livreurs")
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

  // Fonction d'export d'un livreur spécifique
  const handleExportSingle = (livreur: LivreurFromAPI) => {
    try {
      exportLivreurDetailToPDF(livreur)
      toast.success("Fiche livreur exportée avec succès", {
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

  return (
    <div className="space-y-6 p-6">
      {/* En-tête modernisé */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Livreurs</h1>
          <p className="text-gray-600">Gérez vos livreurs et leurs informations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un livreur..."
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
              onClick={() => setShowAddModal(true)}
              className="h-11 px-6 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4 mr-2" /> Nouveau livreur
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
      {livreurs.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-200"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-10 w-10" style={{ color: COLOR }} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun livreur</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Commencez par ajouter votre premier livreur pour organiser votre équipe de livraison.
          </p>
          <Button 
            style={{ backgroundColor: COLOR }} 
            onClick={() => setShowAddModal(true)}
            className="rounded-xl px-8 py-3 font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4 mr-2" /> Ajouter le premier livreur
          </Button>
        </motion.div>
      )}

      {/* Vue desktop - Tableau avec détails */}
      {!loading && livreurs.length > 0 && (
        <>
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-green-20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  {filtered.length} livreur{filtered.length > 1 ? 's' : ''}
                  {searchTerm && ` trouvé(s) pour "${searchTerm}"`}
                </h3>
              </div>
            </div>
            
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/80 hover:bg-gray-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="font-semibold text-gray-900">Nom complet</TableHead>
                  <TableHead className="font-semibold text-gray-900">CIN</TableHead>
                  <TableHead className="font-semibold text-gray-900">Téléphone</TableHead>
                  <TableHead className="font-semibold text-gray-900">Véhicule</TableHead>
                  <TableHead className="font-semibold text-gray-900">Zone</TableHead>
                  <TableHead className="font-semibold text-gray-900">Créé par</TableHead>
                  <TableHead className="text-right font-semibold text-gray-900">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((l, index) => {
                    const isOpen = openRows.has(l.id)
                    return (
                      <React.Fragment key={l.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          onClick={() => toggleRow(l.id)}
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
                                <User className="h-4 w-4" style={{ color: COLOR }} />
                              </div>
                              <span className="font-semibold text-gray-900">{l.prenom} {l.nom}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">{l.cin}</TableCell>
                          <TableCell className="text-gray-700">{l.telephone}</TableCell>
                          <TableCell className="text-gray-700">{l.numero_vehicule}</TableCell>
                          <TableCell className="text-gray-700">{l.zone_livraison}</TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {l.createur.prenom} {l.createur.nom}
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
                                  onClick={e => { e.stopPropagation(); handleEdit(l) }}
                                  className="rounded-lg"
                                >
                                  <Edit className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Modifier
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={e => { e.stopPropagation(); handleExportSingle(l) }}
                                  className="rounded-lg"
                                >
                                  <Download className="mr-2 h-4 w-4" style={{ color: COLOR }} /> Exporter PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 rounded-lg"
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleDeleteClick(l)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                        
                        {/* Ligne de détails */}
                        <DetailRow livreur={l} isOpen={isOpen} />
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
              {filtered.map((livreur, index) => (
                <motion.div
                  key={livreur.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <LivreurCard
                    livreur={livreur}
                    onView={() => handleEdit(livreur)}
                    onEdit={() => handleEdit(livreur)}
                    onDelete={() => handleDeleteClick(livreur)}
                    onExport={() => handleExportSingle(livreur)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Modals */}
      <AjouterLivreurModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={handleAdd} 
      />

      {selectedLivreur && (
        <ModifierLivreurModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedLivreur(null)
          }}
          onSubmit={handleUpdate}
          livreur={selectedLivreur}
        />
      )}

      <SupprimerLivreurModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        livreur={livreurToDelete}
      />
    </div>
  )
}