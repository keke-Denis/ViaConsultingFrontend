// app/compte/page.tsx
"use client"

import { ProtectedLayout } from "@/components/protected-layout"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Camera, Phone, DollarSign, Calendar, Building, IdCard, Clock, MapPin, Send } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { useState, useEffect } from "react"
import { demandeSoldeApi } from "@/lib/demandeSolde/demandeSolde-api"
import { gestionCompteApi } from "@/lib/gestionCompte/gestionCompte-api"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const COLOR = "#72bc21"

const formatMontantDisplay = (value: string) => {
  const numericValue = value.replace(/\s/g, '')
  const parts = numericValue.split('.')
  let integerPart = parts[0]
  const decimalPart = parts.length > 1 ? `.${parts[1]}` : ''
  
  if (integerPart) {
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }
  
  return integerPart + decimalPart
}

const parseMontantValue = (value: string) => {
  return value.replace(/\s/g, '')
}

export default function ComptePage() {
  const { user } = useAuth()
  const [montant, setMontant] = useState("")
  const [displayMontant, setDisplayMontant] = useState("")
  const [raison, setRaison] = useState("")
  const [loading, setLoading] = useState(false)
  const [historique, setHistorique] = useState<any[]>([])
  const [loadingHistorique, setLoadingHistorique] = useState(true)

  const currentDateTime = format(new Date(), "dd MMMM yyyy 'à' HH:mm", { locale: fr })

  useEffect(() => {
    if (user?.id) {
      gestionCompteApi.getMesDemandes(user.id)
        .then(setHistorique)
        .catch(() => toast.error("Impossible de charger l'historique"))
        .finally(() => setLoadingHistorique(false))
    }
  }, [user?.id])

  useEffect(() => {
    setDisplayMontant(formatMontantDisplay(montant))
  }, [montant])

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = value.replace(/[^0-9.]/g, '')
    setMontant(numericValue)
  }

  const handleSubmitDemande = async () => {
    const montantNum = Number(parseMontantValue(montant))
    if (montantNum <= 0 || !raison.trim()) {
      toast.error("Veuillez remplir tous les champs correctement")
      return
    }

    setLoading(true)
    try {
      await demandeSoldeApi.create(
        { montant_demande: montantNum, raison: raison.trim() },
        user?.id!
      )
      toast.success("Demande envoyée avec succès !")
      setMontant("")
      setDisplayMontant("")
      setRaison("")
      const nouvellesDemandes = await gestionCompteApi.getMesDemandes(user!.id)
      setHistorique(nouvellesDemandes)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50">
        <div className="max-w-6xl mx-auto px-4 py-12">

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#72bc21] to-[#4ade80] shadow-2xl mb-12">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative p-10 text-white">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="relative group">
                  <Avatar className="h-40 w-40 ring-8 ring-white/40 shadow-2xl transition-transform group-hover:scale-105">
                    <AvatarFallback className="bg-white/20 backdrop-blur text-white text-6xl font-bold">
                      {(user.prenom?.[0] || "") + (user.nom?.[0] || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <Button size="icon" className="absolute bottom-2 right-2 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 border border-white/40">
                    <Camera className="h-5 w-5 text-white" />
                  </Button>
                </div>

                <div className="text-center md:text-left space-y-5">
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    {user.prenom} {user.nom}
                  </h1>
                  <p className="text-2xl opacity-95 flex items-center justify-center md:justify-start gap-3">
                    <Phone className="h-7 w-7" />
                    {user.numero}
                  </p>
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Badge className="px-6 py-3 text-lg font-bold bg-white/25 backdrop-blur border border-white/30">
                      <div className="w-3 h-3 bg-green-300 rounded-full animate-pulse mr-3"></div>
                      {user.role}
                    </Badge>
                    {user.localisation?.Nom && (
                      <Badge variant="secondary" className="px-5 py-3 text-lg bg-white/20 backdrop-blur border border-white/30">
                        <MapPin className="h-5 w-5 mr-2" />
                        {user.localisation.Nom}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            <div className="space-y-6">
              <Card className="overflow-hidden border-0 shadow-xl bg-white/80 backdrop-blur">
                <div className="h-2 bg-gradient-to-r from-[#72bc21] to-[#4ade80]"></div>
                <CardHeader>
                  <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: COLOR }}>
                    <User className="w-8 h-8" />
                    Informations personnelles
                  </h2>
                </CardHeader>
                <CardContent className="space-y-5">
                  {user.CIN && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                      <IdCard className="h-6 w-6 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-500">Numéro CIN</p>
                        <p className="font-mono font-semibold">{user.CIN}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <Building className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Rôle</p>
                      <p className="font-semibold capitalize">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <Calendar className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Dernière activité</p>
                      <p className="font-medium">{currentDateTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="overflow-hidden border-0 shadow-2xl bg-white/80 backdrop-blur-lg">
                <div className="h-2 bg-gradient-to-r from-[#72bc21] to-[#4ade80]"></div>
                <CardHeader>
                  <h2 className="text-3xl font-bold flex items-center gap-3" style={{ color: COLOR }}>
                    <DollarSign className="w-9 h-9" />
                    Nouvelle demande de solde
                  </h2>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                      <p className="text-gray-600 text-sm">Date</p>
                      <p className="font-semibold">{format(new Date(), "dd MMMM yyyy", { locale: fr })}</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl">
                      <p className="text-gray-600 text-sm">Demandeur</p>
                      <p className="font-semibold">{user.prenom} {user.nom}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-green-600" /> Montant (Ariary)
                    </label>
                    <Input
                      type="text"
                      placeholder="250 000"
                      value={displayMontant}
                      onChange={handleMontantChange}
                      className="text-2xl font-bold h-16 border-2 focus:border-[#72bc21] transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-3 block">Raison</label>
                    <Textarea
                      placeholder="Avance salaire, déplacement, achat matériel..."
                      className="min-h-32 text-lg resize-none focus:ring-4 focus:ring-green-100 border-2"
                      value={raison}
                      onChange={(e) => setRaison(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleSubmitDemande}
                    disabled={loading || !montant || !raison.trim()}
                    className="w-full h-16 text-xl font-bold rounded-2xl shadow-xl hover:scale-105 transition-all"
                    style={{
                      background: `linear-gradient(to right, #72bc21, #4ade80)`,
                      boxShadow: "0 10px 30px rgba(114, 188, 33, 0.4)"
                    }}
                  >
                    {loading ? "Envoi en cours..." : (
                      <>
                        <Send className="mr-3 h-6 w-6" />
                        Envoyer la demande
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4" style={{ color: COLOR }}>
              <Clock className="w-10 h-10" />
              Historique de mes demandes
            </h2>

            {loadingHistorique ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-100 rounded-3xl animate-pulse"></div>
                ))}
              </div>
            ) : historique.length === 0 ? (
              <Card className="p-20 text-center bg-gradient-to-br from-gray-50 to-green-50 border-dashed border-2 border-gray-200">
                <div className="text-8xl mb-6">Empty</div>
                <p className="text-2xl text-gray-600 font-medium">Aucune demande pour le moment</p>
                <p className="text-gray-500 mt-2">Elles apparaîtront ici dès que vous en ferez une</p>
              </Card>
            ) : (
              <div className="space-y-5">
                {historique.map((d, i) => (
                  <Card
                    key={d.id}
                    className="overflow-hidden border-0 bg-white/70 backdrop-blur shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-8">
                        <div className="flex-1">
                          <p className="text-3xl font-extrabold mb-3" style={{ color: COLOR }}>
                            {d.montant_demande.toLocaleString("fr-FR")} Ar
                          </p>
                          <p className="text-lg text-gray-800 font-medium leading-relaxed">{d.raison}</p>
                          {d.commentaire_admin && (
                            <p className="text-sm text-gray-600 italic mt-4 border-l-4 border-green-500 pl-4 py-1 bg-green-50/50 rounded-r">
                              {d.commentaire_admin}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-gray-500">
                          <p className="font-medium">{format(new Date(d.date || d.created_at), "dd MMM yyyy", { locale: fr })}</p>
                          <p className="text-sm">{format(new Date(d.date || d.created_at), "HH:mm")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}