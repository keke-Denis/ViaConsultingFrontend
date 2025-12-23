"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/auth-context"
import { getDefaultRoute } from "@/lib/auth"
import { Phone, Lock, LogIn, UserPlus, CheckCircle, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import { toast, ToastContainer } from "react-toastify"
import 'react-toastify/dist/ReactToastify.css'
import Image from "next/image"
import logo from "@/public/logo.png"

// === Toasts ===
const SuccessToast = () => (
  <div className="flex items-center gap-3">
    <CheckCircle className="w-6 h-6 text-green-500" />
    <div>
      <p className="font-semibold">Connexion réussie !</p>
      <p className="text-sm text-gray-600">Redirection en cours...</p>
    </div>
  </div>
)

const ErrorToast = ({ title, message }: { title: string; message: string }) => (
  <div className="flex items-center gap-3">
    <XCircle className="w-6 h-6 text-red-500" />
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
)

const LoginFormContent = () => {
  const [numero, setNumero] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{numero?: string, password?: string}>({})
  const { login, isLoading } = useAuth()
  const router = useRouter()

  const clearFieldErrors = () => {
    setFieldErrors({})
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    toast.dismiss()
    clearFieldErrors()

    if (!numero.trim()) {
      setFieldErrors(prev => ({...prev, numero: "Le numéro est requis"}))
      return
    }

    if (!password) {
      setFieldErrors(prev => ({...prev, password: "Le mot de passe est requis"}))
      return
    }

    try {
      const response = await login({ numero, password })

      if (response?.success && response?.data) {
        const userData = response.data
        setIsRedirecting(true)

        toast(<SuccessToast />, {
          type: "success",
          autoClose: 2000,
          position: "top-right",
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
        })

        setTimeout(() => {
          router.push(getDefaultRoute(userData.role))
        }, 2200)
      }
    } catch (err: any) {
      console.error("Erreur complète :", err)

      let errorMessage = "Connexion échouée."
      let errorTitle = "Erreur"
      let errorType: "warning" | "error" = "error"

      if (err?.response?.data) {
        const data = err.response.data
        errorMessage = data.message || data.error || data.detail || "Erreur inconnue"
      } else if (err?.message) {
        errorMessage = err.message
      }

      const msg = errorMessage.toLowerCase()

      if (msg.includes("numéro") || msg.includes("téléphone") || msg.includes("phone") || msg.includes("utilisateur") || msg.includes("user")) {
        errorTitle = "Numéro introuvable"
        errorMessage = "Aucun compte trouvé avec ce numéro. Vérifiez votre numéro ou inscrivez-vous."
        errorType = "warning"
        setFieldErrors(prev => ({...prev, numero: "Numéro introuvable"}))
      }
      else if (msg.includes("mot de passe") || msg.includes("password") || msg.includes("incorrect")) {
        errorTitle = "Mot de passe incorrect"
        errorMessage = "Le mot de passe que vous avez saisi est incorrect. Veuillez réessayer."
        errorType = "error"
        setFieldErrors(prev => ({...prev, password: "Mot de passe incorrect"}))
      }
      else if (msg.includes("credentials") || msg.includes("identifiants") || msg.includes("invalid")) {
        errorTitle = "Identifiants invalides"
        errorMessage = "La combinaison numéro/mot de passe est incorrecte."
        errorType = "error"
        setFieldErrors(prev => ({ 
          numero: "Numéro ou mot de passe incorrect",
          password: "Numéro ou mot de passe incorrect" 
        }))
      }
      else if (msg.includes("compte") || msg.includes("account") || msg.includes("désactivé") || msg.includes("disabled")) {
        errorTitle = "Compte désactivé"
        errorMessage = "Votre compte est temporairement désactivé. Contactez l'administrateur."
        errorType = "error"
      }
      else if (msg.includes("network") || msg.includes("réseau") || msg.includes("connection")) {
        errorTitle = "Problème de connexion"
        errorMessage = "Impossible de se connecter au serveur. Vérifiez votre connexion internet."
        errorType = "error"
      }
      else {
        errorTitle = "Erreur de connexion"
        errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer."
      }

      toast(<ErrorToast title={errorTitle} message={errorMessage} />, {
        type: errorType,
        autoClose: 5000,
        position: "top-right",
      })
    }
  }

  return (
    <>
      <style jsx global>{`
        /* Styles pour mobile/tablette */
        @media (max-width: 1024px) {
          .login-container {
            padding: 1rem;
          }
          
          .mobile-toast {
            width: 90%;
            margin: 0 auto;
            left: 5%;
            right: 5%;
            max-width: 400px;
            font-size: 14px;
          }
          
          .Toastify__toast-container {
            padding: 8px;
            width: 100%;
          }
          
          .Toastify__toast {
            margin-bottom: 8px;
            border-radius: 12px;
            padding: 12px;
          }
          
          /* Optimisation pour le clavier virtuel */
          @media (max-height: 600px) {
            .login-container {
              padding-top: 20px;
              padding-bottom: 20px;
            }
            
            .Toastify__toast-container--top-center {
              top: env(safe-area-inset-top, 0px);
            }
          }
        }
      `}</style>

      <ToastContainer
        position="top-right"
        autoClose={false}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        limit={1}
        style={{ zIndex: 9999 }}
      />

      <div className="w-full min-h-screen flex items-center justify-center p-3 login-container bg-gray-50">
        {/* Conteneur principal responsive */}
        <div className="w-full max-w-[420px] lg:max-w-[480px] xl:max-w-[520px] mx-auto">
          {/* Carte avec ombre restaurée */}
          <div className="bg-white rounded-2xl lg:rounded-3xl shadow-lg lg:shadow-2xl p-5 md:p-6 lg:p-8 xl:p-10 space-y-6 lg:space-y-8 border border-gray-100">
            
            {/* En-tête avec logo agrandi */}
            <div className="text-center space-y-4 lg:space-y-6">
              <div className="flex flex-col items-center">
                {/* Logo grand sans effets */}
                <div className="relative w-32 h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 lg:mb-1">
                  <Image
                    src={logo}
                    alt="Via Consulting Logo"
                    fill
                    sizes="(max-width: 768px) 128px, (max-width: 1024px) 160px, 192px"
                    className="object-contain"
                    priority
                    quality={100}
                  />
                </div>
                
                {/* Texte sous le logo */}
                <div>
                  <p className="text-gray-500 text-sm lg:text-base xl:text-lg">Connectez-vous à votre compte</p>
                </div>
              </div>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5 lg:space-y-6 xl:space-y-8" autoComplete="off">
              {/* Champ numéro avec bordure verte */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="numero" className="block text-sm lg:text-base font-semibold text-gray-700">
                  Numéro de téléphone
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-[#72bc21] transition-colors group-hover:text-[#5a951a]" />
                  </div>
                  <input
                    id="numero"
                    name="numero"
                    type="text"
                    value={numero}
                    onChange={(e) => {
                      setNumero(e.target.value)
                      if (fieldErrors.numero) {
                        clearFieldErrors()
                      }
                    }}
                    required
                    className={`w-full pl-9 lg:pl-12 xl:pl-14 pr-4 py-3 lg:py-4 xl:py-5 text-base lg:text-lg border-2 rounded-lg lg:rounded-xl xl:rounded-2xl focus:outline-none transition-all duration-200 ${
                      fieldErrors.numero 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-[#72bc21]/30 bg-gray-50 focus:border-[#72bc21] focus:ring-2 focus:ring-[#72bc21]/20 focus:bg-white hover:border-[#72bc21]/50'
                    }`}
                    placeholder="034 12 345 67"
                    autoComplete="off"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                </div>
                {fieldErrors.numero && (
                  <p className="text-red-500 text-xs lg:text-sm flex items-center gap-1 lg:gap-2">
                    <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                    <span>{fieldErrors.numero}</span>
                  </p>
                )}
              </div>

              {/* Champ mot de passe avec bordure verte */}
              <div className="space-y-2 lg:space-y-3">
                <label htmlFor="password" className="block text-sm lg:text-base font-semibold text-gray-700">
                  Mot de passe
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 lg:pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-[#72bc21] transition-colors group-hover:text-[#5a951a]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (fieldErrors.password) {
                        clearFieldErrors()
                      }
                    }}
                    required
                    className={`w-full pl-9 lg:pl-12 xl:pl-14 pr-11 lg:pr-12 xl:pr-14 py-3 lg:py-4 xl:py-5 text-base lg:text-lg border-2 rounded-lg lg:rounded-xl xl:rounded-2xl focus:outline-none transition-all duration-200 ${
                      fieldErrors.password 
                        ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-500' 
                        : 'border-[#72bc21]/30 bg-gray-50 focus:border-[#72bc21] focus:ring-2 focus:ring-[#72bc21]/20 focus:bg-white hover:border-[#72bc21]/50'
                    }`}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 lg:right-4 xl:right-5 top-1/2 -translate-y-1/2 p-1 lg:p-1.5 text-gray-400 hover:text-[#72bc21] transition-colors"
                    aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                  >
                    {showPassword ? 
                      <EyeOff className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" /> : 
                      <Eye className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6" />
                    }
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs lg:text-sm flex items-center gap-1 lg:gap-2">
                    <AlertTriangle className="w-3 h-3 lg:w-4 lg:h-4 xl:w-5 xl:h-5 flex-shrink-0" />
                    <span>{fieldErrors.password}</span>
                  </p>
                )}
              </div>

              {/* Bouton de connexion avec ombre */}
              <button
                type="submit"
                disabled={isLoading || isRedirecting}
                className="w-full bg-[#72bc21] hover:bg-[#5a951a] text-white font-semibold py-3.5 lg:py-4 xl:py-5 rounded-lg lg:rounded-xl xl:rounded-2xl shadow-md lg:shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 lg:gap-3 text-base lg:text-lg xl:text-xl"
              >
                {isLoading || isRedirecting ? (
                  <>
                    <div className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isRedirecting ? "Redirection..." : "Connexion..."}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>
            </form>

            {/* Lien d'inscription */}
            <div className="text-center pt-4 lg:pt-6 xl:pt-8 border-t border-gray-100">
              <p className="text-gray-600 text-sm lg:text-base xl:text-lg">
                Pas de compte ?{" "}
                <a 
                  href="/signup" 
                  className="text-[#72bc21] hover:text-[#5a951a] font-semibold transition-colors inline-flex items-center gap-1 lg:gap-2 xl:gap-3"
                >
                  Créer un compte
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LoginFormContent