"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { User, Phone, IdCard, Building2 } from "lucide-react"
import { toast } from "react-toastify"

const COLOR = "#76bc21"

interface NouveauClientModalProps {
  onClose: () => void
  onSave: (data: any) => void
}

const NouveauClientModal: React.FC<NouveauClientModalProps> = ({ onClose, onSave }) => {
  const [nom, setNom] = useState("")
  const [contact, setContact] = useState("")
  const [cin, setCin] = useState("")
  const [entreprise, setEntreprise] = useState("")
  const [typeClient, setTypeClient] = useState<"Local" | "Etranger">("Local")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nom.trim()) {
      toast.error("Le nom du client est obligatoire !")
      return
    }

    if (!contact.trim()) {
      toast.error("Le contact du client est obligatoire !")
      return
    }

    onSave({
      nom: nom.trim(),
      contact: contact.trim(),
      cin: cin.trim() || undefined,
      entreprise: entreprise.trim() || undefined,
      typeClient
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#76bc21]">Nouveau client</h3>
              <p className="text-gray-500">Ajouter un nouveau client</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom */}
            <div className="space-y-2">
              <Label htmlFor="nom">Nom complet *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Jean Dupont"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="034 12 345 67 ou +261 34 12 345 67"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {/* CIN */}
            <div className="space-y-2">
              <Label htmlFor="cin">CIN (optionnel)</Label>
              <div className="relative">
                <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="cin"
                  value={cin}
                  onChange={(e) => setCin(e.target.value)}
                  placeholder="101234567890"
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Numéro de carte d'identité nationale</p>
            </div>

            {/* Entreprise */}
            <div className="space-y-2">
              <Label htmlFor="entreprise">Nom de l'entreprise (optionnel)</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="entreprise"
                  value={entreprise}
                  onChange={(e) => setEntreprise(e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type client */}
            <div className="space-y-2">
              <Label>Type de client</Label>
              <Select value={typeClient} onValueChange={(value: any) => setTypeClient(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir le type de client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Local">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      Client local
                    </div>
                  </SelectItem>
                  <SelectItem value="Etranger">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                      Client étranger
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 text-white"
                style={{ backgroundColor: COLOR }}
              >
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NouveauClientModal