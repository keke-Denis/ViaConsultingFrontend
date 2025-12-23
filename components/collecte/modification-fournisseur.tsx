// components/collecte/modification-fournisseur.tsx
"use client"

import { useState, useEffect } from "react"
import { useFournisseur } from "@/contexts/fournisseur/fournisseur-context"
import { useLocalisation } from "@/contexts/localisation/localisation-context"
import { Building, MapPin, Phone, User, FileText, Home, X, Navigation, Shield } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#76bc21"
const COLOR_HOVER = "#5f9a1a"

interface ModificationFournisseurProps {
  fournisseur: any
  onSuccess?: () => void
  onCancel?: () => void
  localisations?: any[]
  isLoadingLocalisations?: boolean
}

interface NominatimResponse {
  display_name: string
  address: {
    suburb?: string
    neighbourhood?: string
    quarter?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    state?: string
    country?: string
    [key: string]: string | undefined
  }
}

export default function ModificationFournisseur({
  fournisseur,
  onSuccess,
  onCancel,
  localisations = [],
  isLoadingLocalisations = false,
}: ModificationFournisseurProps) {

  const [formData, setFormData] = useState({
    nom: fournisseur.nom || "",
    prenom: fournisseur.prenom || "",
    adresse: fournisseur.adresse || "",
    identification_fiscale: fournisseur.identification_fiscale || "",
    cin: fournisseur.cin || "",
    localisation_id: fournisseur.localisation_id?.toString() || "",
    contact: fournisseur.contact || ""
  })

  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [currentLocationName, setCurrentLocationName] = useState<string>("")
  const [permissionDenied, setPermissionDenied] = useState(false)
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)
  const [showLocationInput, setShowLocationInput] = useState(false)
  const [newLocationName, setNewLocationName] = useState("")
  const [existingFiscaleIds, setExistingFiscaleIds] = useState<string[]>([])
  const [isFiscaleIdDuplicate, setIsFiscaleIdDuplicate] = useState(false)
  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(false)

  const { updateFournisseur, isLoading, error, clearError, fournisseurs } = useFournisseur()
  const { createLocalisation } = useLocalisation()

  // Récupérer tous les IDs fiscaux existants (sauf celui du fournisseur actuel)
  useEffect(() => {
    const fiscaleIds = fournisseurs
      .filter(f => f.id !== fournisseur.id)
      .map(f => f.identification_fiscale)
    setExistingFiscaleIds(fiscaleIds)
  }, [fournisseurs, fournisseur.id])

  // Vérifier si l'ID fiscal existe déjà
  useEffect(() => {
    if (formData.identification_fiscale.trim()) {
      const isDuplicate = existingFiscaleIds.includes(formData.identification_fiscale.trim())
      setIsFiscaleIdDuplicate(isDuplicate)
      setIsUpdateButtonDisabled(isDuplicate)
      
      if (isDuplicate) {
        toast.warning("L'ID fiscale que vous avez entré existe déjà, veuillez le remplacer")
      }
    } else {
      setIsFiscaleIdDuplicate(false)
      setIsUpdateButtonDisabled(false)
    }
  }, [formData.identification_fiscale, existingFiscaleIds])

  // Fonction pour extraire le suburb/quartier
  const extractSuburb = (data: NominatimResponse): string => {
    const suburb = data.address?.suburb || 
                   data.address?.neighbourhood || 
                   data.address?.quarter ||
                   data.address?.village ||
                   data.address?.town ||
                   data.address?.city;
    
    return suburb || "Quartier non spécifié";
  }

  // Fonction pour détecter la localisation actuelle
  const detectCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée")
      return
    }

    setIsDetectingLocation(true)
    setCurrentLocationName("")
    setPermissionDenied(false)
    setShowLocationInput(false)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (error) => {
            let errorMessage = "Impossible de détecter votre position"
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = "Permission de localisation refusée. Veuillez autoriser l'accès à votre position dans les paramètres de votre navigateur."
                setPermissionDenied(true)
                break
              case error.POSITION_UNAVAILABLE:
                errorMessage = "Position indisponible"
                break
              case error.TIMEOUT:
                errorMessage = "Délai de localisation dépassé"
                break
              default:
                errorMessage = "Erreur inconnue de géolocalisation"
            }
            
            reject(new Error(errorMessage))
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          }
        )
      })

      const lat = position.coords.latitude
      const lon = position.coords.longitude

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&zoom=18`
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'adresse")
      }

      const data: NominatimResponse = await response.json()

      if (data && data.address) {
        const suburb = extractSuburb(data)
        setCurrentLocationName(suburb)
        setNewLocationName(suburb)
        setShowLocationInput(true)
        
        toast.success("Quartier détecté !")

        setFormData(prev => ({
          ...prev,
          adresse: suburb
        }))

      } else {
        throw new Error("Impossible de déterminer la localisation")
      }

    } catch (error: any) {
      console.error("Erreur de géolocalisation:", error.message)
      
      if (!error.message.includes("Permission de localisation refusée")) {
        console.warn("Erreur de géolocalisation:", error.message)
      }
      
      toast.error("Erreur de localisation")
    } finally {
      setIsDetectingLocation(false)
    }
  }

  // Fonction pour utiliser la localisation détectée
  const useDetectedLocation = async () => {
    if (!currentLocationName) return

    setIsCreatingLocation(true)

    try {
      // Vérifier d'abord si la localisation existe déjà
      const existingLocation = localisations.find(
        loc => loc.Nom.toLowerCase() === currentLocationName.toLowerCase()
      )

      if (existingLocation) {
        // Utiliser la localisation existante
        setFormData(prev => ({
          ...prev,
          localisation_id: existingLocation.id.toString()
        }))
        toast.success("Localisation sélectionnée")
        setShowLocationInput(false)
      } else {
        // Créer une nouvelle localisation via le contexte
        const newLocation = await createLocalisation(currentLocationName)
        setFormData(prev => ({
          ...prev,
          localisation_id: newLocation.id.toString()
        }))
        setShowLocationInput(false)
        toast.success("Nouvelle localisation créée et sélectionnée")
      }
    } catch (error: any) {
      toast.error(error.message || "Impossible d'utiliser cette localisation")
    } finally {
      setIsCreatingLocation(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    // Vérifier à nouveau si le code fournisseur existe
    const isDuplicate = existingFiscaleIds.includes(formData.identification_fiscale.trim())
    if (isDuplicate) {
      toast.error("Le code fournisseur existe déjà. Veuillez le modifier avant de mettre à jour le fournisseur.")
      return
    }

    const required = ["nom", "prenom", "identification_fiscale"] as const
    const emptyField = required.find(field => !formData[field].trim())

    if (emptyField) {
      toast.error("Le code fournisseur, prénom et nom sont obligatoires")
      return
    }

    try {
      const result = await updateFournisseur(fournisseur.id, {
        ...formData,
        localisation_id: Number(formData.localisation_id),
      })

      if (result.success) {
        toast.success(`Fournisseur avec le code : ${formData.identification_fiscale} est modifié avec succès`)
        
        // Appeler onSuccess qui va rafraîchir la liste dans le parent
        if (onSuccess) {
          onSuccess()
        }
      } else {
        toast.error(result.message)
      }
    } catch (err: any) {
      toast.error(err.message || "Impossible de modifier le fournisseur")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      {/* Header – Responsive */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR }}>
            <Building className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              Modifier le Fournisseur
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600">
              {fournisseur.prenom} {fournisseur.nom}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Prénom & Nom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Prénom *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
              <input
                name="prenom"
                type="text"
                value={formData.prenom}
                onChange={handleChange}
                required
                autoComplete="off"
                className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                placeholder="Prénom"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Nom *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
              <input
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                required
                autoComplete="off"
                className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                placeholder="Nom de famille"
              />
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Adresse complète</label>
          <div className="relative">
            <Home className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
            <textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              rows={3}
              autoComplete="off"
              className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all resize-none"
              style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
              placeholder="Lot, quartier, commune..."
            />
          </div>
        </div>

        {/* Code Fournisseur & CIN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">Code fournisseur *</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
              <input
                name="identification_fiscale"
                type="text"
                value={formData.identification_fiscale}
                onChange={handleChange}
                readOnly
                required
                autoComplete="off"
                className={`pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all ${
                  isFiscaleIdDuplicate 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-[#76bc21]'
                }`}
                placeholder="Ex: 123456789"
              />
            </div>
            {isFiscaleIdDuplicate && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <Shield className="w-4 h-4" />
                Le code fournisseur que vous avez entré existe déjà, veuillez le remplacer
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">CIN <span className="text-gray-400 font-normal">(optionnel)</span></label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
              <input
                name="cin"
                type="text"
                value={formData.cin}
                onChange={handleChange}
                autoComplete="off"
                className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
                style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
                placeholder="Ex: 123456789AB"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-gray-700">Contact</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
            <input
              name="contact"
              type="text"
              value={formData.contact}
              onChange={handleChange}
              autoComplete="off"
              className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all"
              style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
              placeholder="Téléphone ou email"
            />
          </div>
        </div>

        {/* Localisation */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Localisation</label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5" style={{ color: COLOR }} />
              <select
                name="localisation_id"
                value={formData.localisation_id}
                onChange={handleChange}
                disabled={isLoadingLocalisations}
                className="pl-9 sm:pl-10 w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all appearance-none bg-white"
                style={{ "--tw-ring-color": COLOR } as React.CSSProperties}
              >
                <option value="">Sélectionner une localisation</option>
                {localisations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.Nom}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={detectCurrentLocation}
              disabled={isDetectingLocation || isLoading}
              className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Navigation className={`h-4 w-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
              {isDetectingLocation ? 'Détection...' : 'Détecter'}
            </button>
          </div>

          {permissionDenied && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                Permission refusée. Veuillez autoriser la géolocalisation dans votre navigateur.
              </p>
            </div>
          )}

          {showLocationInput && currentLocationName && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Quartier détecté : <span className="font-bold">{currentLocationName}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    placeholder="Modifier le nom si nécessaire"
                    className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={useDetectedLocation}
                    disabled={isCreatingLocation}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
                    style={{ backgroundColor: COLOR }}
                  >
                    {isCreatingLocation ? 'Création...' : 'Utiliser'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boutons d'actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading || isUpdateButtonDisabled}
            className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
            style={{ backgroundColor: COLOR }}
          >
            {isLoading ? "Modification..." : "Modifier le fournisseur"}
          </button>
        </div>
      </form>
    </div>
  )
}