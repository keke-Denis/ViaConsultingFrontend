"use client"

import { BadgeCheck, ChevronsUpDown, LogOut } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"

export function NavUser({ user }: { user: User }) {
  const { isMobile } = useSidebar()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  // Fonction pour obtenir les initiales du nom
  const getInitials = (user: User): string => {
    if (user.prenom && user.nom) {
      return (user.prenom.charAt(0) + user.nom.charAt(0)).toUpperCase()
    }
    
    // Fallback sur le nom seul
    if (user.nom) {
      return user.nom.charAt(0).toUpperCase()
    }
    
    return "U"
  }

  // Fonction pour obtenir le nom d'affichage complet
  const getDisplayName = (user: User): string => {
    if (user.prenom && user.nom) {
      return `${user.prenom} ${user.nom}`
    }
    
    // Fallback sur le nom seul
    if (user.nom) {
      return user.nom
    }
    
    return "Utilisateur"
  }

  // Fonction pour obtenir le rôle en français
  const getRoleDisplayName = (role: string): string => {
    const roleMap: { [key: string]: string } = {
      'admin': 'Administrateur',
      'collecteur': 'Collecteur',
      'distilleur': 'Distilleur',
      'vendeur': 'Vendeur'
    }
    return roleMap[role] || role
  }

  // Fonction pour obtenir la localisation
  const getLocalisationName = (user: User): string => {
    if (user.localisation && user.localisation.Nom) {
      return user.localisation.Nom
    }
    return user.localisation_id ? `Localisation ${user.localisation_id}` : "Non spécifiée"
  }

  const userName = getDisplayName(user)
  const userRole = getRoleDisplayName(user.role)
  const userContact = user.numero || ""
  const userLocalisation = getLocalisationName(user)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                  {getInitials(user)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="truncate text-xs capitalize">{userRole}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 text-white font-bold">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-base">{userName}</span>
                  <span className="truncate text-xs text-gray-500 capitalize">{userRole}</span>
                  <span className="truncate text-xs text-gray-400 mt-1">{userContact}</span>
                  <span className="truncate text-xs text-gray-400">{userLocalisation}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <a href="/compte" className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-green-600" />
                  <div className="flex flex-col">
                    <span className="text-sm">Mon Compte</span>
                    <span className="text-xs text-gray-500">CIN: {user.CIN}</span>
                  </div>
                </a>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
