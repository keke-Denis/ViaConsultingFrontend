// components/solde/transfert-solde-tab.tsx
import React, { useState, useEffect } from 'react'
import { ChevronsUpDown, Check, User } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { toast } from 'react-toastify'
import { useSolde } from '@/contexts/solde-context'
import { useSoldeGlobal } from '@/contexts/transfertSolde/transfertSolde'
import { useTransferPrefill } from '@/contexts/transferPrefill/transferPrefill-context'
import { fetchUtilisateurs, createTransfert } from '@/lib/transferSolde/transferSolde-api'
import type { Utilisateur } from '@/lib/transferSolde/transferSolde-type'

type Destinateur = Utilisateur

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

const TransfertSoldeTab = () => {
  const { soldeActuel, refreshSolde } = useSolde()
  const { soldeGlobal, setSoldeGlobal } = useSoldeGlobal()

  const [openDestinateur, setOpenDestinateur] = useState(false)
  const [selectedDestinateur, setSelectedDestinateur] = useState<Destinateur | null>(null)
  const [searchDestinateur, setSearchDestinateur] = useState('')
  const [utilisateurs, setUtilisateurs] = useState<Destinateur[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    montant: '',
    type_transfert: '',
    reference: '',
    raison: ''
  })

  const [displayMontant, setDisplayMontant] = useState('')

  useEffect(() => {
    setSoldeGlobal(soldeActuel)
  }, [soldeActuel, setSoldeGlobal])

  useEffect(() => {
    const loadUtilisateurs = async () => {
      try {
        const users = await fetchUtilisateurs()
        setUtilisateurs(users)
      } catch (err) {
        toast.error('Impossible de charger la liste des utilisateurs')
      } finally {
        setLoading(false)
      }
    }
    loadUtilisateurs()
  }, [])

  const { prefill, clearPrefill } = useTransferPrefill()

  // Apply prefill when utilisateurs list is loaded or when prefill changes
  useEffect(() => {
    if (!prefill) return

    // If destinataire_id provided try to find the user in utilisateurs
    if (prefill.destinataire_id && utilisateurs.length > 0) {
      const found = utilisateurs.find(u => Number(u.id) === Number(prefill.destinataire_id))
      if (found) setSelectedDestinateur(found)
      else if (prefill.destinataire) setSelectedDestinateur(prefill.destinataire as Destinateur)
    } else if (prefill.destinataire) {
      setSelectedDestinateur(prefill.destinataire as Destinateur)
    }

    if (prefill.montant !== undefined && prefill.montant !== null) {
      const montoStr = String(prefill.montant)
      setFormData(prev => ({ ...prev, montant: montoStr }))
      setDisplayMontant(formatMontantDisplay(montoStr))
    }

    if (prefill.raison) {
      setFormData(prev => ({ ...prev, raison: prefill.raison || '' }))
    }

    if (prefill.reference) {
      setFormData(prev => ({ ...prev, reference: prefill.reference || '' }))
    }

    // clear once applied
    clearPrefill()
  // run when utilisateurs or prefill changes
  }, [prefill, utilisateurs, clearPrefill])

  useEffect(() => {
    setDisplayMontant(formatMontantDisplay(formData.montant))
  }, [formData.montant])

  const filteredDestinateurs = utilisateurs.filter((user) =>
    `${user.prenom} ${user.nom} ${user.numero}`
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .includes(
        searchDestinateur.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
  )

  const handleMontantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const numericValue = value.replace(/[^0-9.]/g, '')
    
    setFormData(prev => ({
      ...prev,
      montant: numericValue
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDestinateur) {
      toast.warn('Veuillez sélectionner un destinataire')
      return
    }

    const montant = parseFloat(parseMontantValue(formData.montant))
    if (!montant || montant <= 0) {
      toast.warn('Veuillez entrer un montant valide')
      return
    }

    if (montant > soldeGlobal) {
      toast.warn(`Solde insuffisant ! Vous avez seulement ${soldeGlobal.toLocaleString('fr-FR')} Ar`)
      return
    }

    if (!formData.type_transfert) {
      toast.warn('Veuillez choisir un type de transfert')
      return
    }

    setSubmitting(true)

    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
      if (!currentUser?.id) {
        toast.error('Utilisateur non connecté')
        return
      }

      const payload = {
        admin_id: currentUser.id,
        destinataire_id: selectedDestinateur.id,
        montant,
        type_transfert: formData.type_transfert as 'especes' | 'mobile' | 'virement',
        reference: formData.reference || undefined,
        raison: formData.raison || undefined
      }

      const response = await createTransfert(payload)

      if (response.success) {
        toast.success(response.message || 'Transfert effectué avec succès !', {
          autoClose: 5000,
        })

        if (response.solde_actuel !== undefined) {
          setSoldeGlobal(response.solde_actuel)
        } else {
          setSoldeGlobal(soldeGlobal - montant)
        }

        setTimeout(() => refreshSolde(), 600)

        setSelectedDestinateur(null)
        setFormData({
          montant: '',
          type_transfert: '',
          reference: '',
          raison: ''
        })
        setDisplayMontant('')
        setSearchDestinateur('')
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Une erreur est survenue lors du transfert'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-[#72bc21] mb-2">Transfert de solde</h2>
        <p className="text-lg text-black mb-6">
          Solde disponible :{' '}
          <span className="font-semibold text-lg text-[#72bc21]">
            {soldeGlobal.toLocaleString('fr-FR')} Ar
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Destinataire :</Label>
            <Popover open={openDestinateur} onOpenChange={setOpenDestinateur}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openDestinateur}
                  className="w-full justify-between h-12 pl-10 font-normal text-left"
                  disabled={loading}
                >
                  {selectedDestinateur
                    ? `${selectedDestinateur.prenom} ${selectedDestinateur.nom} - ${selectedDestinateur.numero}`
                    : 'Rechercher un destinataire...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Nom, prénom ou téléphone..."
                    value={searchDestinateur}
                    onValueChange={setSearchDestinateur}
                  />
                  <CommandList>
                    {loading ? (
                      <CommandEmpty>Chargement des utilisateurs...</CommandEmpty>
                    ) : filteredDestinateurs.length === 0 ? (
                      <CommandEmpty>Aucun résultat</CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {filteredDestinateurs.map((user) => (
                          <CommandItem
                            key={user.id}
                            value={`${user.id}`}
                            onSelect={() => {
                              setSelectedDestinateur(
                                selectedDestinateur?.id === user.id ? null : user
                              )
                              setOpenDestinateur(false)
                              setSearchDestinateur('')
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                selectedDestinateur?.id === user.id ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div>
                              <div className="font-medium">
                                {user.prenom} {user.nom}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {user.numero} • {user.role}
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Montant :</Label>
            <Input
              type="text"
              placeholder="20000"
              value={displayMontant}
              onChange={handleMontantChange}
              required
              min="1"
              max={soldeGlobal}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Type de transfert :</Label>
            <select
              className="w-full px-4 py-3 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-[#72bc21] text-sm bg-background"
              value={formData.type_transfert}
              onChange={(e) => setFormData({ ...formData, type_transfert: e.target.value })}
              required
            >
              <option value="">Choisir un type</option>
              <option value="especes">Espèces</option>
              <option value="mobile">Mobile Money</option>
              <option value="virement">Virement bancaire</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Référence :</Label>
            <Input
              type="text"
              placeholder="Ref:1660257108"
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lg font-semibold">Raison :</Label>
            <Textarea
              placeholder="Raison du transfert..."
              rows={4}
              value={formData.raison}
              onChange={(e) => setFormData({ ...formData, raison: e.target.value })}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#72bc21] hover:bg-[#5ea61a] text-white font-medium cursor-pointer"
            disabled={submitting || !selectedDestinateur || loading}
          >
            {submitting ? 'Transfert en cours...' : 'Transférer le solde'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default TransfertSoldeTab