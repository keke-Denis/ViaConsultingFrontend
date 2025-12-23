"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { demandeSoldeApi } from "@/lib/demandeSolde/demandeSolde-api"

export interface Notification {
  id: string
  type: "info" | "success" | "warning" | "error"
  title: string
  message: string
  time: string
  read: boolean
  createdAt: Date
  persistentId?: string // ID unique et stable pour chaque notification
  // optional payload with original object (demande, transfert, etc.) so UI can act on it
  payload?: any
}

export function useNotifications(user: any) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)
  const notificationsRef = useRef<Notification[]>([])

  // Générer un ID persistant pour chaque notification
  const generatePersistentId = useCallback((notificationData: any, type: string): string => {
    switch (type) {
      // Use stable identifiers based on the database id only.
      // Avoid using updated_at (or created_at) because those change when the row is updated
      // which would invalidate local persistent IDs and break read-state sync across devices.
      case "admin-pending":
        return `admin-pending-${notificationData.id}`
      case "transfer":
        return `transfer-${notificationData.id}`
      case "demande-approved":
        return `demande-${notificationData.id}-approved`
      case "demande-rejected":
        return `demande-${notificationData.id}-rejected`
      default:
        // If notificationData has an id, prefer a stable id based on it
        if (notificationData && notificationData.id) {
          return `${type}-${notificationData.id}`
        }
        return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }, [])

  // No local persistence: rely only on server-side flags for read state

  // garder une ref à jour des notifications pour l'utilisation dans callbacks async
  useEffect(() => {
    notificationsRef.current = notifications
  }, [notifications])

  // Fonction pour formater le rôle
  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      admin: "Administrateur",
      collecteur: "Collecteur", 
      distilleur: "Distilleur",
      vendeur: "Vendeur",
      utilisateur: "Utilisateur"
    }
    return roleMap[role] || role
  }

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [myDemands, receivedTransfers, pendingDemands] = await Promise.all([
        demandeSoldeApi.getMyDemands(user.id),
        demandeSoldeApi.getReceivedTransfers(user.id),
        user.role === "admin" ? demandeSoldeApi.getPendingDemands() : Promise.resolve([]),
      ])

  // no local readState; read flags come from server
      const now = new Date()
      const notifs: Notification[] = []

      // Demandes en attente (admin uniquement)
      if (user.role === "admin" && Array.isArray(pendingDemands)) {
        pendingDemands.forEach((d: any) => {
          const persistentId = generatePersistentId(d, "admin-pending")
          // Prefer server-side flag if present (lu_par_admin). Accept 0/1 or string values.
          const isRead = !!d.lu_par_admin
          
          // Vérifier si la notification existe déjà (pour éviter les doublons)
          const exists = notifs.some(n => n.persistentId === persistentId)
          if (!exists) {
            const montant = Number(d.montant_demande).toLocaleString("fr-MG")
            const demandeur = `${d.utilisateur.prenom} ${d.utilisateur.nom}`
            const agence = d.utilisateur.localisation?.Nom || "Inconnue"
            const roleUtilisateur = formatRole(d.utilisateur.role)
            const createdAt = new Date(d.created_at)

            notifs.push({
              id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              persistentId,
              type: "warning",
              title: "Nouvelle demande de solde",
              message: `${demandeur} (${agence})\n${roleUtilisateur} • ${d.utilisateur.numero}\n${montant} Ar\n→ ${d.raison}`,
              // expose the original demande object so UI can act on it (double-click etc)
              payload: d,
              time: formatDistanceToNow(createdAt, { addSuffix: true, locale: fr }),
              read: isRead,
              createdAt,
            })
          }
        })
      }

      // Transferts reçus
      if (Array.isArray(receivedTransfers)) {
        receivedTransfers.forEach((t: any) => {
          const persistentId = generatePersistentId(t, "transfer")
          // Transfers don't have server-side read flags; default to unread
          const isRead = false
          
          const exists = notifs.some(n => n.persistentId === persistentId)
          if (!exists) {
            const montant = Number(t.montant).toLocaleString("fr-MG")
            const adminName = t.admin ? `${t.admin.prenom} ${t.admin.nom}` : "l'administrateur"
            const adminRole = t.admin ? formatRole(t.admin.role) : "Administrateur"
            const createdAt = new Date(t.created_at)

            notifs.push({
              id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              persistentId,
              type: "success",
              title: "Transfert reçu",
              message: `Vous avez reçu ${montant} Ar de ${adminName}\n${adminRole} • ${t.admin?.numero || "N/A"}`,
              payload: t,
              time: formatDistanceToNow(createdAt, { addSuffix: true, locale: fr }),
              read: isRead,
              createdAt,
            })
          }
        })
      }

      // Demandes de l'utilisateur (SEULEMENT approuvées et rejetées)
      if (Array.isArray(myDemands)) {
        myDemands.forEach((d: any) => {
          const montant = Number(d.montant_demande).toLocaleString("fr-MG")

          if (d.statut === "approuvee") {
            const persistentId = generatePersistentId(d, "demande-approved")
            // Prefer server-side flag if present (lu_par_utilisateur). Accept 0/1 or string values.
            const isRead = !!d.lu_par_utilisateur
            
            const exists = notifs.some(n => n.persistentId === persistentId)
            if (!exists) {
              const updatedAt = new Date(d.updated_at || d.created_at)
              notifs.push({
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                persistentId,
                type: "success",
                title: "Demande approuvée",
                message: `Votre demande de ${montant} Ar a été approuvée`,
                payload: d,
                time: formatDistanceToNow(updatedAt, { addSuffix: true, locale: fr }),
                read: isRead,
                createdAt: updatedAt,
              })
            }
          }

          if (d.statut === "rejetee") {
            const persistentId = generatePersistentId(d, "demande-rejected")
            // Prefer server-side flag if present (lu_par_utilisateur). Accept 0/1 or string values.
            const isRead = !!d.lu_par_utilisateur
            
            const exists = notifs.some(n => n.persistentId === persistentId)
            if (!exists) {
              const updatedAt = new Date(d.updated_at || d.created_at)
              notifs.push({
                id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                persistentId,
                type: "error",
                title: "Demande rejetée",
                message: d.commentaire_admin
                  ? `Rejetée : ${d.commentaire_admin}`
                  : "Votre demande a été refusée",
                payload: d,
                time: formatDistanceToNow(updatedAt, { addSuffix: true, locale: fr }),
                read: isRead,
                createdAt: updatedAt,
              })
            }
          }
        })
      }

      // Tri par date (plus récent en premier)
      notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

      // À la première connexion, ne pas réinitialiser les états de lecture
      if (isInitialLoad.current) {
        setNotifications(notifs)
        isInitialLoad.current = false
      } else {
        // Pour les rechargements suivants, préserver l'état de lecture
        setNotifications(prev => {
          const updated = notifs.map(newNotif => {
            // Trouver la notification précédente avec le même persistentId
            const prevNotif = prev.find(p => p.persistentId === newNotif.persistentId)
            // Conserver l'état de lecture si la notification existait déjà
            return prevNotif 
              ? { ...newNotif, read: prevNotif.read || newNotif.read }
              : newNotif
          })
          return updated
        })
      }

  // No local persistence; server state is authoritative

    } catch (err) {
      console.error("Erreur chargement notifications:", err)
      // En cas d'erreur, conserver les notifications existantes
      if (notifications.length === 0) {
        setNotifications([])
      }
    } finally {
      setLoading(false)
    }
  }, [user?.id, user?.role, generatePersistentId])

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update local
    const current = notificationsRef.current ?? notifications
    const target = current ? current.find(n => n.id === id) : undefined

    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))

    // If this notification is backed by a Demande de solde on the backend, notify the server
    try {
      if (target && target.payload && (target.payload.montant_demande !== undefined || target.payload.statut !== undefined || target.payload.utilisateur_id !== undefined)) {
        const demandeId = target.payload.id
        if (demandeId) {
          if (user?.role === 'admin') {
            await demandeSoldeApi.markAsReadByAdmin(demandeId)
          } else {
            await demandeSoldeApi.markAsReadByUser(demandeId)
          }

          // Re-sync with server to get authoritative flags
          try {
            await loadNotifications()
          } catch (reloadErr) {
            console.error('Erreur reload notifications après markAsRead:', reloadErr)
          }
        }
      }
    } catch (e) {
      console.error('Erreur lors de lappel markAsRead:', e)
      // In case of error, reload to restore server state
      try {
        await loadNotifications()
      } catch (reloadErr) {
        console.error('Erreur reload notifications après échec markAsRead:', reloadErr)
      }
    }
  }, [user?.role, user?.id, loadNotifications, notifications])

  // Tout marquer comme lu
  const markAllAsRead = useCallback(async () => {
    // Optimistic local update
    const current = notificationsRef.current ?? notifications
    const updated = current.map(n => ({ ...n, read: true }))
    ;(setNotifications as any)(updated)

    // Notify backend to mark demandes as read (single call)
    try {
      if (user?.role === 'admin') {
        await demandeSoldeApi.markAllAsReadByAdmin()
      } else if (user?.id) {
        await demandeSoldeApi.markAllAsReadByUser(user.id)
      }

      // Re-sync from server to get authoritative read flags and fresh timestamps
      try {
        await loadNotifications()
      } catch (reloadErr) {
        console.error('Erreur reload notifications après markAllAsRead:', reloadErr)
      }

      return { success: true }
    } catch (e) {
      console.error('Erreur lors du marquage de toutes les demandes comme lues:', e)
      // Re-sync to get server state
      try {
        await loadNotifications()
      } catch (reloadErr) {
        console.error('Erreur reload notifications après échec markAllAsRead:', reloadErr)
      }
      return { success: false, error: e }
    }
  }, [user?.role, user?.id, notifications, loadNotifications])

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [loadNotifications])

  return {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: loadNotifications
  }
}