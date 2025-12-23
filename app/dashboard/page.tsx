"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Package, FileText, Droplets, ShoppingCart, Loader2 } from "lucide-react"
import { Suspense, lazy, useState } from "react"

// Importez vos composants avec lazy loading pour de meilleures performances
const PointCollecte = lazy(() => import("@/components/dashboard/pointCollecte/collectePoint"))
const RapportCollecteur = lazy(() => import("@/components/dashboard/rapportCollecteur/rapportCollecteur"))
const InfosDistillation = lazy(() => import("@/components/dashboard/infosDistillaton/infosDistillation"))
const ResumerVente = lazy(() => import("@/components/dashboard/resumerVente/resumerVente"))

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const [activeSection, setActiveSection] = useState<string>("collecte")

  const primaryGreen = "#72bc21"
  const isAdmin = user?.role === "admin"

  // Définition des sections
  const sections = [
    {
      id: "collecte",
      title: "Collecte",
      description: "Gestion des points de collecte",
      icon: Package,
      color: "from-[#72bc21] to-[#5aa017]",
      component: PointCollecte
    },
    {
      id: "rapport-collecteur",
      title: "Rapport collecteur",
      description: "Rapports des collecteurs",
      icon: FileText,
      color: "from-[#72bc21] to-[#4a9014]",
      component: RapportCollecteur
    },
    {
      id: "distillation",
      title: "Distillation",
      description: "Informations de distillation",
      icon: Droplets,
      color: "from-[#72bc21] to-[#3a8011]",
      component: InfosDistillation
    },
    {
      id: "vente",
      title: "Vente",
      description: "Résumé des ventes",
      icon: ShoppingCart,
      color: "from-[#72bc21] to-[#2a700e]",
      component: ResumerVente
    }
  ]

  // Fonction pour gérer le clic sur un bouton
  const handleButtonClick = (sectionId: string) => {
    setActiveSection(sectionId)
  }

  // Déterminer le titre selon le rôle de l'utilisateur
  const title = isLoading 
    ? "Dashboard" 
    : isAdmin 
      ? "Dashboard" 
      : "Tableau de bord"

  // Récupérer la section active
  const activeSectionData = sections.find(s => s.id === activeSection)

  // Récupérer le composant actif
  const ActiveComponent = activeSectionData?.component

  return (
    <ProtectedLayout allowedRoles={["admin"]}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* En-tête */}
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5aa017)` }}
          >
            {title}
          </h1>
        </div>

        {/* Grille des boutons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {sections.map((section) => {
            const IconComponent = section.icon
            const isActive = activeSection === section.id
            
            return (
              <Card
                key={section.id}
                className={`border ${isActive ? 'border-[#72bc21] shadow-lg' : 'border-gray-200'} shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-gray-50`}
                onClick={() => handleButtonClick(section.id)}
              >
                <div className="p-6">
                  {/* Icône avec dégradé #72bc21 */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center mb-4 ${isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform duration-300`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>

                  {/* Titre seulement */}
                  <h3 className={`text-lg font-bold mb-2 transition-colors ${isActive ? 'text-[#72bc21]' : 'text-gray-900 hover:text-[#72bc21]'}`}>
                    {section.title}
                  </h3>

                  {/* Indicateur d'état */}
                  <div className={`flex items-center text-sm transition-colors ${isActive ? 'text-[#72bc21]' : 'text-gray-500 hover:text-[#72bc21]'}`}>
                    <span>{isActive ? '✓ Actif' : 'Sélectionner'}</span>
                    {isActive && (
                      <svg 
                        className="w-4 h-4 ml-2" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Barre colorée en bas */}
                <div className={`h-1 bg-gradient-to-r ${section.color} rounded-b-lg transition-all duration-300 ${isActive ? 'h-2' : 'group-hover:h-1.5'}`} />
              </Card>
            )
          })}
        </div>

        {/* Section pour afficher le composant actif */}
        <div className="mt-8">
          {/* Composant actif avec Suspense pour le loading */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <Suspense fallback={
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#72bc21] animate-spin mr-3" />
                <span className="text-gray-600">Chargement du composant...</span>
              </div>
            }>
              {ActiveComponent ? <ActiveComponent /> : (
                <div className="p-6 text-center text-gray-500">
                  Composant non disponible
                </div>
              )}
            </Suspense>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}