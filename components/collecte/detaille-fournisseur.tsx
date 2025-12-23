// components/collecte/detaille-fournisseur.tsx
"use client"

import { useState } from "react"
import { Building, MapPin, Phone, User, FileText, Home, Calendar, X } from "lucide-react"
import type { Fournisseur } from "@/lib/fournisseur/fournisseur-types"

const COLOR = "#76bc21"

interface DetailleFournisseurProps {
  fournisseur: Fournisseur
  onClose: () => void
}

export default function DetailleFournisseur({ fournisseur, onClose }: DetailleFournisseurProps) {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => onClose(), 300)
  }

  return (
    <div
      className={`transition-all duration-300 ease-out ${
        isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              className="p-2.5 sm:p-3 md:p-4 rounded-full shadow-lg flex-shrink-0"
              style={{ backgroundColor: COLOR }}
            >
              <Building className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                Détails du Fournisseur
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-0.5">
                Toutes les informations
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 sm:p-3 hover:bg-gray-100 rounded-full transition-all hover:scale-110"
            aria-label="Fermer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
          </button>
        </div>

        {/* Grille responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {/* Colonne gauche */}
          <div className="space-y-4 sm:space-y-5">
            <InfoCard
              icon={<User className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="Nom Complet"
              value={`${fournisseur.prenom} ${fournisseur.nom}`}
            />

            <InfoCard
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="Code fournisseur"
              value={fournisseur.identification_fiscale}
            />

            <InfoCard
              icon={<FileText className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="CIN"
              value={fournisseur.cin || "Non spécifié"}
            />

            <InfoCard
              icon={<Phone className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="Contact"
              value={fournisseur.contact}
            />
          </div>

          {/* Colonne droite */}
          <div className="space-y-4 sm:space-y-5">
            <InfoCard
              icon={<Home className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="Adresse Complète"
              value={fournisseur.adresse}
              multiline
            />

            <InfoCard
              icon={<MapPin className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="Localisation"
              value={fournisseur.localisation?.Nom || "Non spécifiée"}
            />

            <InfoCard
              icon={<Calendar className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: COLOR }} />}
              title="Créé le"
              value={new Date(fournisseur.created_at).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            />
          </div>
        </div>

        {/* Bouton Fermer */}
        <div className="flex justify-end pt-4 sm:pt-6">
          <button
            onClick={handleClose}
            className="px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base text-white font-semibold rounded-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
            style={{
              backgroundColor: COLOR,
              boxShadow: "0 10px 25px rgba(118, 188, 33, 0.3)",
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5f9a1a"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLOR}
          >
            Fermer les détails
          </button>
        </div>
      </div>
    </div>
  )
}

// Composant carte d'info responsive
function InfoCard({
  icon,
  title,
  value,
  multiline = false,
}: {
  icon: React.ReactNode
  title: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="p-2.5 sm:p-3 rounded-full bg-green-100 flex-shrink-0">
        {icon}
      </div>
      <div className={multiline ? "space-y-1 flex-1" : "flex-1"}>
        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{title}</h3>
        <p className={`text-gray-700 text-xs sm:text-sm leading-relaxed ${
          multiline ? "whitespace-pre-wrap break-words" : ""
        }`}>
          {value}
        </p>
      </div>
    </div>
  )
}
