"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getDefaultRoute } from "@/lib/auth"
import {
  User, Phone, CreditCard, MapPin, Lock, AlertCircle,
  UserPlus, Users, Shield, Eye, EyeOff, Building, Key
} from "lucide-react"
import { toast } from 'react-toastify'
import api from "@/api/api"
import Image from "next/image"
import logo from "@/public/logo.png"

interface Localisation {
  id: number
  Nom: string
}

interface SiteCollecte {
  id: number
  Nom: string
}

export default function CreateUserForm() {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    numero: "",
    CIN: "",
    localisation_id: "",
    site_collecte_id: "",
    code_collecteur: "", 
    password: "",
    password_confirmation: "",
    role: "" as "admin" | "collecteur" | "vendeur" | "distilleur",
  })

  const [adminPassword, setAdminPassword] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [localisations, setLocalisations] = useState<Localisation[]>([])
  const [sitesCollecte, setSitesCollecte] = useState<SiteCollecte[]>([])
  const [isLoadingLocalisations, setIsLoadingLocalisations] = useState(true)
  const [isLoadingSitesCollecte, setIsLoadingSitesCollecte] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showAdminPasswordInput, setShowAdminPasswordInput] = useState(false)
  const [showUserPassword, setShowUserPassword] = useState(false)
  const [showUserPasswordConfirmation, setShowUserPasswordConfirmation] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  const { register, isLoading, error, clearError } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchLocalisations = async () => {
      try {
        setIsLoadingLocalisations(true)
        const response = await api.get<{ success: boolean; data: Localisation[] }>('/localisations')
        if (response.data.success) {
          setLocalisations(response.data.data)
        }
      } catch (err: any) {
        console.error('Erreur chargement localisations:', err)
        toast.error("Erreur de chargement - Impossible de charger les localisations")
      } finally {
        setIsLoadingLocalisations(false)
      }
    }

    const fetchSitesCollecte = async () => {
      try {
        setIsLoadingSitesCollecte(true)
        const response = await api.get<{ success: boolean; data: SiteCollecte[] }>('/site-collectes')
        if (response.data.success) {
          setSitesCollecte(response.data.data)
        }
      } catch (err: any) {
        console.error('Erreur chargement sites de collecte:', err)
        toast.error("Erreur de chargement - Impossible de charger les sites de collecte")
      } finally {
        setIsLoadingSitesCollecte(false)
      }
    }

    fetchLocalisations()
    fetchSitesCollecte()
  }, [])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsVerifying(true)

    if (!adminPassword.trim()) {
      toast.error("Veuillez saisir le mot de passe administrateur")
      setIsVerifying(false)
      return
    }

    try {
      const response = await api.post<{ success: boolean; message?: string }>('/verify-admin', {
        password: adminPassword,
      })

      if (response.data.success) {
        setIsVerified(true)
        toast.success("Vérification réussie ! - Vous pouvez maintenant créer l'utilisateur")
      } else {
        toast.error(response.data.message || "Mot de passe administrateur incorrect")
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Une erreur est survenue lors de la vérification")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (formData.password !== formData.password_confirmation) {
      toast.error("Les mots de passe ne correspondent pas")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Minimum 8 caractères requis pour le mot de passe")
      return
    }

    if (!adminPassword) {
      toast.error("Veuillez vous re-vérifier - Session expirée")
      setIsVerified(false)
      return
    }

    if (formData.role === 'distilleur' && !formData.site_collecte_id) {
      toast.error("Veuillez sélectionner un site de collecte pour le distilleur")
      return
    }

    try {
      const userData = {
        ...formData,
        localisation_id: parseInt(formData.localisation_id),
        site_collecte_id: formData.site_collecte_id ? parseInt(formData.site_collecte_id) : null,
        admin_confirmation_password: adminPassword,
        password_confirmation: formData.password_confirmation,
        code_collecteur: formData.role === 'collecteur' ? formData.code_collecteur : null 
      }

      const response = await register(userData)

      if (response.success && response.data) {
        const userData = response.data
        setIsRedirecting(true)

        toast.success(`Utilisateur créé avec succès ! - Bienvenue ${userData.prenom} ${userData.nom} ! Redirection...`)

        setTimeout(() => {
          router.push(getDefaultRoute(userData.role))
        }, 2000)
      }
    } catch (error: any) {
      console.error('Erreur création utilisateur:', error)

      if (error.response?.data?.message === 'Mot de passe administrateur incorrect') {
        toast.error("Mot de passe admin incorrect. Re-vérification requise.")
        setIsVerified(false)
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const firstError = Object.values(errors)[0] as string[]
        toast.error(firstError[0])
      } else {
        toast.error(error.response?.data?.message || "Erreur lors de la création de l'utilisateur")
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (name === 'role') {
      
      if (value !== 'distilleur') {
        setFormData(prev => ({
          ...prev,
          site_collecte_id: ""
        }))
      }
      if (value !== 'collecteur') {
        setFormData(prev => ({
          ...prev,
          code_collecteur: ""
        }))
      }
    }
  }

  const handleAdminPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminPassword(e.target.value)
  }

  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, text: "", color: "" }
    if (password.length < 8) return { strength: 1, text: "Faible", color: "text-red-500" }
    if (password.length < 12) return { strength: 2, text: "Moyen", color: "text-[#72bc21]" }
    return { strength: 3, text: "Fort", color: "text-[#5a9c1a]" }
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const passwordsMatch = formData.password === formData.password_confirmation

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-40 h-40 mb-2 p-4">
                <div className="relative w-full h-full">
                  <Image
                    src={logo}
                    alt="Via Consulting Logo"
                    fill
                    sizes="96px"
                    className="object-contain"
                    priority
                    quality={100}
                  />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-[#72bc21]">Vérification Administrateur</h1>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-pulse">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <label htmlFor="admin_password" className="block text-sm font-semibold text-gray-700">
                  Mot de passe administrateur 
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-[#72bc21]" />
                  </div>
                  <input
                    id="admin_password"
                    type={showAdminPasswordInput ? "text" : "password"}
                    value={adminPassword}
                    onChange={handleAdminPasswordChange}
                    required
                    className="block w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPasswordInput(!showAdminPasswordInput)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#72bc21] hover:text-[#5a9c1a] transition-colors"
                  >
                    {showAdminPasswordInput ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-gradient-to-r from-[#72bc21] to-[#5a9c1a] hover:from-[#5a9c1a] hover:to-[#4a7f15] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {isVerifying ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Vérification en cours...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-6 h-6" />
                    <span>Vérifier et continuer</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-8 border border-gray-100">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-50 h-50 mb-2 p-4">
              <div className="relative w-full h-full">
                <Image
                  src={logo}
                  alt="Via Consulting Logo"
                  fill
                  sizes="96px"
                  className="object-contain"
                  priority
                  quality={100}
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#72bc21]">Création d'utilisateur</h1>
            <p className="text-gray-600 text-lg">Remplissez toutes les informations requises</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#72bc21] border-b-2 border-[#72bc21] pb-2">
                Informations Personnelles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700">Prénom </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                    <input 
                      id="prenom" 
                      name="prenom" 
                      type="text" 
                      value={formData.prenom} 
                      onChange={handleChange} 
                      required 
                      className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                      placeholder="Eric Bertin" 
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="nom" className="block text-sm font-semibold text-gray-700">Nom </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                    <input 
                      id="nom" 
                      name="nom" 
                      type="text" 
                      value={formData.nom} 
                      onChange={handleChange} 
                      required 
                      className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                      placeholder="Rakotomanana" 
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#72bc21] border-b-2 border-[#72bc21] pb-2">
                Informations de Contact
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="numero" className="block text-sm font-semibold text-gray-700">Téléphone </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                    <input 
                      id="numero" 
                      name="numero" 
                      type="text" 
                      value={formData.numero} 
                      onChange={handleChange} 
                      required 
                      className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                      placeholder="034 43 217 41" 
                      autoComplete="off"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label htmlFor="CIN" className="block text-sm font-semibold text-gray-700">CIN </label>
                  <div className="relative">
                    <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                    <input 
                      id="CIN" 
                      name="CIN" 
                      type="text" 
                      value={formData.CIN} 
                      onChange={handleChange} 
                      required 
                      className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                      placeholder="123456789012" 
                      autoComplete="off"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#72bc21] border-b-2 border-[#72bc21] pb-2">
                Affectation
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="localisation_id" className="block text-sm font-semibold text-gray-700">Localisation </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21] z-10" />
                    <select
                      id="localisation_id"
                      name="localisation_id"
                      value={formData.localisation_id}
                      onChange={handleChange}
                      required
                      disabled={isLoadingLocalisations}
                      className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all disabled:bg-gray-100 appearance-none bg-white text-gray-700"
                    >
                      <option value="">Sélectionnez une localisation</option>
                      {localisations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.Nom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700">Rôle </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21] z-10" />
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all appearance-none bg-white text-gray-700"
                    >
                      <option value="">Sélectionnez un rôle</option>
                      <option value="collecteur">Collecteur</option>
                      <option value="vendeur">Vendeur</option>
                      <option value="distilleur">Distilleur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section Code Collecteur - Uniquement visible si rôle = collecteur */}
              {formData.role === 'collecteur' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="code_collecteur" className="block text-sm font-semibold text-gray-700">
                      Code Collecteur 
                    </label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                      <input 
                        id="code_collecteur" 
                        name="code_collecteur" 
                        type="text" 
                        value={formData.code_collecteur} 
                        onChange={handleChange} 
                        className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                        placeholder="Ex: COL001, COLL2024, etc." 
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Code unique pour identifier le collecteur (optionnel)
                    </p>
                  </div>
                </div>
              )}

              {/* Section Site de Collecte - Uniquement visible si rôle = distilleur */}
              {formData.role === 'distilleur' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label htmlFor="site_collecte_id" className="block text-sm font-semibold text-gray-700">Site de collecte </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21] z-10" />
                      <select
                        id="site_collecte_id"
                        name="site_collecte_id"
                        value={formData.site_collecte_id}
                        onChange={handleChange}
                        required
                        disabled={isLoadingSitesCollecte}
                        className="pl-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all disabled:bg-gray-100 appearance-none bg-white text-gray-700"
                      >
                        <option value="">Sélectionnez un site de collecte</option>
                        {sitesCollecte.map(site => (
                          <option key={site.id} value={site.id}>{site.Nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-[#72bc21] border-b-2 border-[#72bc21] pb-2">
                Sécurité
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Mot de passe </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                    <input
                      id="password"
                      name="password"
                      type={showUserPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="pl-12 pr-12 w-full py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowUserPassword(!showUserPassword)} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#72bc21] hover:text-[#5a9c1a] transition-colors"
                    >
                      {showUserPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.strength === 1 ? "bg-red-500 w-1/3" : 
                            passwordStrength.strength === 2 ? "bg-[#72bc21] w-2/3" : 
                            "bg-[#5a9c1a] w-full"
                          }`} />
                        </div>
                        <span className={`text-xs font-medium ${passwordStrength.color}`}>
                          {passwordStrength.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Minimum 8 caractères requis</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700">Confirmation </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#72bc21]" />
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showUserPasswordConfirmation ? "text" : "password"}
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      required
                      className={`pl-12 pr-12 w-full py-4 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#72bc21] focus:border-[#72bc21] transition-all bg-white placeholder-gray-400 text-gray-700 ${
                        formData.password_confirmation ? 
                        (passwordsMatch ? "border-[#72bc21]" : "border-red-500") : 
                        "border-gray-200"
                      }`}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowUserPasswordConfirmation(!showUserPasswordConfirmation)} 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#72bc21] hover:text-[#5a9c1a] transition-colors"
                    >
                      {showUserPasswordConfirmation ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formData.password_confirmation && (
                    <p className={`text-sm font-medium ${passwordsMatch ? "text-[#72bc21]" : "text-red-500"}`}>
                      {passwordsMatch ? "✓ Les mots de passe correspondent" : "✗ Les mots de passe ne correspondent pas"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { setIsVerified(false); setAdminPassword("") }}
                className="w-full text-[#72bc21] hover:text-[#5a9c1a] font-semibold py-4 border-2 border-[#72bc21] rounded-xl hover:bg-[#f8fdf0] transition-all duration-200 flex items-center justify-center gap-2 text-lg"
              >
                <Shield className="w-5 h-5" />
                Nouvelle vérification administrateur
              </button>

              <button
                type="submit"
                disabled={isLoading || isLoadingLocalisations || isLoadingSitesCollecte || isRedirecting || (formData.role === 'distilleur' && !formData.site_collecte_id)}
                className="w-full bg-gradient-to-r from-[#72bc21] to-[#5a9c1a] hover:from-[#5a9c1a] hover:to-[#4a7f15] text-white font-semibold py-5 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
              >
                {isLoading || isRedirecting ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isRedirecting ? "Redirection en cours..." : "Création en cours..."}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-6 h-6" />
                    <span>Créer l'utilisateur</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}