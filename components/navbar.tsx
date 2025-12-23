"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { ChevronDown, LogOut, User, Bell } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getMenuItemsForRole } from "@/lib/menu-config"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { NotificationsModal } from "@/components/notification/notifications-modal"
import { useNotifications } from "@/hooks/useNotifications"
import { useTransferPrefill } from '@/contexts/transferPrefill/transferPrefill-context'
import Image from "next/image"
import logo from "@/public/logo.png"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  
  const { notifications, loading, markAsRead, markAllAsRead } = useNotifications(user)

  const { setPrefill } = useTransferPrefill()

  const menuItems = getMenuItemsForRole(user?.role || "utilisateur")
  const filteredMenuItems = menuItems.filter(
    (item) =>
      item.title !== "Produit Fini" && !(item.title === "Transport" && item.url === "/transport")
  )

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const active = menuItems.find((item) => pathname === item.url || item.items?.some((i: any) => pathname === i.url))
    setOpenSubmenu(active ? active.title : null)
  }, [pathname, menuItems])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const getInitials = () => (user?.prenom?.[0] || "") + (user?.nom?.[0] || "U")
  const getDisplayName = () => user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : "Utilisateur"

  if (!user) return null

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm hidden md:block">
        <div className="flex items-center justify-between h-20 px-8">
          {/* Logo avec Image et texte */}
          <Link href="#" className="flex items-center gap-4 mr-12">
            <div className="flex items-center justify-center">
              <Image 
                src={logo} 
                alt="Via Consulting Logo" 
                width={70} 
                height={40}
                className="object-contain h-auto"
                priority
              />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-600">Via Consulting</div>
            </div>
          </Link>

          {/* Menu */}
          <div className="flex-1 flex items-center gap-2 px-6 overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-2">
            {filteredMenuItems.map((item) => {
              const isActive = pathname === item.url || item.items?.some((i: any) => pathname === i.url)
              return item.items ? (
                <DropdownMenu key={item.title} onOpenChange={(o) => setOpenSubmenu(o ? item.title : null)}>
                  <DropdownMenuTrigger asChild>
                    <button className={`shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl font-medium ${isActive ? "bg-[#72bc21] text-white" : "hover:bg-gray-100"}`}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-50 min-w-48">
                    {item.items.map((sub: any) => (
                      <DropdownMenuItem key={sub.title} asChild>
                        <Link href={sub.url}>{sub.title}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.title}
                  href={item.url}
                  className={`shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl font-medium ${isActive ? "bg-[#72bc21] text-white" : "hover:bg-gray-100"}`}>
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              )
            })}
            </div>
          </div>

          {/* Notifications + Profil */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(true)} className="relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-[#72bc21] to-[#5ea61a] text-white flex items-center justify-center font-bold text-lg shadow-lg">
                    {getInitials()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 z-50">
                <div className="p-4 border-b">
                  <p className="font-bold">{getDisplayName()}</p>
                  <p className="text-sm text-[#72bc21] capitalize">{user.role}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/compte" className="cursor-pointer">
                    <User className="mr-3 w-5 h-5" /> Mon profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-3 w-5 h-5" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Modal Notifications */}
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
        notifications={notifications}
        loading={loading}
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
          } else if (payload.admin) {
            setPrefill({ montant, raison })
          } else {
            setPrefill({ montant, raison })
          }
        }}
      />
    </>
  )
}