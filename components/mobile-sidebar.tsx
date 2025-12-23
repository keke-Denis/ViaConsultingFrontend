"use client"

import { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Menu, X, ChevronDown, LogOut, User, Bell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getMenuItemsForRole } from "@/lib/menu-config"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NotificationsModal } from "@/components/notification/notifications-modal"
import { useNotifications } from "@/hooks/useNotifications"
import { useTransferPrefill } from '@/contexts/transferPrefill/transferPrefill-context'
import Image from "next/image"
import logo from "@/public/logo.png"

export function MobileSidebar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  // Nouveau state pour gérer manuellement l'ouverture
  const [manuallyToggled, setManuallyToggled] = useState<string | null>(null)
  
  const { notifications, loading: loadingNotifs, markAsRead, markAllAsRead } = useNotifications(user)
  const { setPrefill } = useTransferPrefill()

  if (!user) return null

  const menuItems = getMenuItemsForRole(user.role || "utilisateur")

  const filteredMenuItems = menuItems.filter(
    (item) => item.title !== "Produit Fini" && !(item.title === "Transport" && item.url === "/transport")
  )

  const unreadCount = notifications.filter(n => !n.read).length

  const pathname = usePathname()
  
  // Réf pour suivre si c'est un changement manuel
  const userInteractionRef = useRef(false)
  
  useEffect(() => {
    // Si l'utilisateur n'a pas interagi manuellement, on ouvre automatiquement
    if (!userInteractionRef.current) {
      const active = menuItems.find((item) => 
        pathname === item.url || 
        item.items?.some((i: any) => pathname === i.url)
      )
      setOpenSubmenu(active ? active.title : null)
    }
    
    // Reset le flag d'interaction quand la sidebar se ferme
    if (!isOpen) {
      userInteractionRef.current = false
    }
  }, [pathname, menuItems, isOpen])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const toggleSubmenu = (title: string) => {
    userInteractionRef.current = true
    setOpenSubmenu(prev => prev === title ? null : title)
    setManuallyToggled(title)
  }

  const getInitials = () => (user.prenom?.[0] || "") + (user.nom?.[0] || "U")
  const getDisplayName = () => user.prenom && user.nom ? `${user.prenom} ${user.nom}` : user.nom || "Utilisateur"
  const getRoleLabel = () => {
    const map: Record<string, string> = { admin: "Administrateur", collecteur: "Collecteur", distilleur: "Distilleur", vendeur: "Vendeur" }
    return map[user.role] || user.role || "Utilisateur"
  }

  return (
    <>
      {/* Header mobile */}
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-md md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsOpen(false)}>
            <div className="flex items-center justify-center">
              <Image 
                src={logo} 
                alt="Via Consulting Logo" 
                width={60} 
                height={35}
                className="object-contain h-auto"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-gray-600 text-sm">Via Consulting</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(true)} className="relative">
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              {isOpen ? <X className="w-6 h-6 text-[#72bc21]" /> : <Menu className="w-6 h-6 text-[#72bc21]" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed left-0 top-16 bottom-0 w-80 bg-white shadow-2xl z-50 overflow-y-auto">

            {/* Profil */}
            <div className="p-6 bg-linear-to-br from-gray-50 to-white border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-[#72bc21] to-[#5ea61a] text-white flex items-center justify-center font-bold text-xl shadow-lg">
                  {getInitials()}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 truncate">{getDisplayName()}</p>
                  <p className="text-sm text-[#72bc21] font-medium capitalize mt-1">{getRoleLabel()}</p>
                  <p className="text-xs text-gray-500 mt-1">{user.numero}</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="px-4 pt-4">
              <button
                onClick={() => { setNotificationsOpen(true); setIsOpen(false) }}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-5 h-5 text-[#72bc21]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">Notifications</span>
                </div>
                <span className="text-sm text-gray-500">{unreadCount > 0 ? `${unreadCount} non lues` : "À jour"}</span>
              </button>
            </div>

            {/* Menu */}
            <div className="px-4 py-2 space-y-1">
              {filteredMenuItems.map((item) => (
                <div key={item.title}>
                  {item.items?.length ? (
                    <>
                      <button 
                        onClick={() => toggleSubmenu(item.title)} 
                        className="w-full flex items-center justify-between px-4 py-4 rounded-xl text-gray-700 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-[#72bc21]" />
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 ${
                            openSubmenu === item.title ? "rotate-180" : ""
                          }`} 
                        />
                      </button>
                      {openSubmenu === item.title && (
                        <div className="ml-8 mt-1 space-y-1 border-l-2 border-[#72bc21]/30 pl-4 animate-in slide-in-from-top-2 duration-200">
                          {item.items.map((sub: any) => (
                            <Link 
                              key={sub.title} 
                              href={sub.url} 
                              onClick={() => {
                                setIsOpen(false)
                                // Reset l'interaction manuelle quand on clique sur un lien
                                userInteractionRef.current = false
                              }} 
                              className="block py-2 text-gray-600 hover:text-[#72bc21] transition-colors"
                            >
                              {sub.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link 
                      href={item.url} 
                      onClick={() => {
                        setIsOpen(false)
                        userInteractionRef.current = false
                      }} 
                      className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-[#72bc21] transition-colors"
                    >
                      <item.icon className="w-5 h-5 text-[#72bc21]" />
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 my-4" />

            {/* Actions */}
            <div className="px-4 pb-4 space-y-3">
              <Link 
                href="/compte" 
                onClick={() => {
                  setIsOpen(false)
                  userInteractionRef.current = false
                }} 
                className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-700 hover:bg-gray-100"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-[#72bc21]" />
                </div>
                <div>
                  <div className="font-medium">Mon profil</div>
                  <div className="text-sm text-gray-500">Informations personnelles</div>
                </div>
              </Link>
              <button 
                onClick={() => { 
                  handleLogout(); 
                  setIsOpen(false);
                  userInteractionRef.current = false;
                }} 
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl text-red-600 hover:bg-red-50"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="font-medium">Déconnexion</div>
                  <div className="text-sm text-gray-500">Quitter la session</div>
                </div>
              </button>
            </div>

            <div className="p-4 border-t border-gray-200 text-center text-xs text-gray-500">
              Via Consulting • {new Date().getFullYear()}
            </div>
          </div>
        </>
      )}

      {/* Modal avec gestion du "lu" */}
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={notifications}
        loading={loadingNotifs}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onUseNotification={(payload) => {
          if (!payload) return
          const montant = Number(payload.montant_demande ?? payload.montant ?? 0)
          const raison = payload.raison ?? payload.commentaire_admin ?? ""

          if (payload.utilisateur) {
            const u = payload.utilisateur
            setPrefill({
              destinataire_id: u.id,
              destinataire: { id: u.id, prenom: u.prenom, nom: u.nom, numero: u.numero },
              montant,
              raison,
            })
          } else {
            setPrefill({ montant, raison })
          }
        }}
      />
    </>
  )
}