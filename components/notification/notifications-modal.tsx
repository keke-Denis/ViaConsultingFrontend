"use client"

import { Bell, CheckCircle, AlertCircle, X, MessageSquare, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useTransferPrefill } from '@/contexts/transferPrefill/transferPrefill-context'

interface Notification {
  id: string
  type: "info" | "warning" | "success" | "error"
  title: string
  message: string
  time: string
  read: boolean
  payload?: any
}

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
  loading?: boolean
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onUseNotification?: (payload: any) => void
}

export function NotificationsModal({
  open,
  onOpenChange,
  notifications,
  loading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onUseNotification,
}: NotificationsModalProps) {

  const router = useRouter()
  const { user } = useAuth()
  const { setPrefill } = useTransferPrefill()
  const [markingAll, setMarkingAll] = useState(false)


  const unreadCount = notifications.filter((n) => !n.read).length

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "error":
        return <X className="w-5 h-5 text-red-600" />
      default:
        return <MessageSquare className="w-5 h-5 text-[#72bc21]" />
    }
  }

  const getBgColor = (type: string, read: boolean) => {
    if (read) return "bg-gray-50 border-gray-200"
    switch (type) {
      case "warning":
        return "bg-yellow-50 border-yellow-300"
      case "success":
        return "bg-green-50 border-green-300"
      case "error":
        return "bg-red-50 border-red-300"
      default:
        return "bg-[#72bc21]/10 border-[#72bc21]/40"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[85vh] overflow-hidden">
        <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#72bc21] flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span className="flex items-center justify-center min-w-8 h-8 bg-red-500 text-white text-sm font-bold rounded-full px-2">
                {unreadCount}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] py-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-[#72bc21] border-t-transparent"></div>
              <p className="mt-4 text-gray-500">Chargement...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium">Aucune notification</p>
              <p className="text-gray-400 text-sm mt-1">Vous êtes à jour !</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && onMarkAsRead(notif.id)}
                  onDoubleClick={() => {
                    // mark as read
                    if (!notif.read) onMarkAsRead(notif.id)

                    // Only admins: redirect to the transfer form and prefill it
                    try {
                      if (user?.role === "admin" && notif.payload) {
                        const payload = notif.payload || {}

                        const prefill: any = {}
                        // common fields: montant, raison, reference, destinataire/destinataire_id
                        const rawMontant = payload.montant ?? payload.montant_demande ?? payload.amount ?? payload.monto
                        if (rawMontant !== undefined && rawMontant !== null) {
                          const parsed = Number(rawMontant)
                          prefill.montant = Number.isFinite(parsed) ? parsed : String(rawMontant)
                        }
                        if (payload.raison) prefill.raison = payload.raison
                        if (payload.reference) prefill.reference = payload.reference

                        // destinataire keys may vary between payloads
                        if (payload.destinataire_id) prefill.destinataire_id = payload.destinataire_id
                        if (payload.utilisateur_id) prefill.destinataire_id = payload.utilisateur_id
                        if (payload.utilisateur) prefill.destinataire = payload.utilisateur
                        if (payload.destinataire) prefill.destinataire = payload.destinataire

                        setPrefill(prefill)

                        // ensure Solde page shows the transfert tab
                        try {
                          localStorage.setItem('soldes-active-tab', 'transfert')
                        } catch (e) {
                          // ignore
                        }

                        router.push('/solde')
                        onOpenChange(false)
                        return
                      }
                    } catch (e) {
                      // ignore and fallback to default behavior below
                      console.error('Erreur lors du traitement du double-clic des notifications', e)
                    }

                    // fallback: existing behavior (call provided handler)
                    if (notif.payload && onUseNotification) {
                      onUseNotification(notif.payload)
                      onOpenChange(false)
                    }
                  }}
                  className={`p-5 rounded-xl border-2 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                    notif.read
                      ? "bg-gray-50 border-gray-200 opacity-90"
                      : getBgColor(notif.type, notif.read)
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 mt-1">{getIcon(notif.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-bold text-lg ${
                            notif.read ? "text-gray-600" : "text-gray-900"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {!notif.read && (
                            <div className="w-3 h-3 bg-[#72bc21] rounded-full animate-pulse"></div>
                          )}
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {notif.time}
                          </span>
                        </div>
                      </div>
                      <p className={`text-base leading-relaxed ${notif.read ? "text-gray-500" : "text-gray-700"}`}>
                        {notif.message.split("\n").map((line, i) => (
                          <span key={i}>
                            {line}
                            <br />
                          </span>
                        ))}
                      </p>
                      {!notif.read && (
                        <div className="mt-3 flex items-center gap-2 text-[#72bc21] text-sm font-medium">
                          <Check className="w-4 h-4" />
                          <span>Cliquez pour marquer comme lu</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && !loading && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
            <Button
              onClick={async () => {
                if (unreadCount === 0) return

                setMarkingAll(true)
                try {
                  // call parent handler which now returns a promise (hook will call backend)
                  if (onMarkAllAsRead) {
                    // await result in case caller wants to surface errors
                    await onMarkAllAsRead()
                  }
                } catch (err) {
                  console.error('Erreur lors du marquage de toutes les demandes comme lues (caller):', err)
                } finally {
                  setMarkingAll(false)
                }
              }}
              disabled={unreadCount === 0 || markingAll}
              className="rounded-xl bg-[#72bc21] hover:bg-[#5ea61a] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Check className="w-4 h-4 mr-2" />
              {markingAll ? 'Marquage...' : 'Tout marquer comme lu'}
            </Button>

            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="text-[#72bc21] hover:bg-[#72bc21]/10 rounded-xl"
            >
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}