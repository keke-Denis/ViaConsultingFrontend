import {
  LayoutDashboard,
  Package,
  Droplet,
  Truck,
  ShoppingCart,
  User,
  UserPlus,
  Box,
  Leaf,
  Scan,
  Wallet,          
} from "lucide-react"
import type { UserRole } from "./auth"
import type { LucideIcon } from "lucide-react"

export interface MenuItem {
  title: string
  icon: LucideIcon
  url: string
  roles: UserRole[]
  items?: {
    title: string
    url: string
  }[]
}

export const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
    roles: ["admin"],
  },
  {
    title: "Solde",
    icon: Wallet,          
    url: "/solde",
    roles: ["admin"],
  },
  {
    title: "Collecte",
    icon: Package,
    url: "/collecte",
    roles: ["admin", "collecteur"],
  },
  {
    title: "Transfert",
    icon: Package,
    url: "/pointsDeCollecte",
    roles: ["admin", "collecteur"],
  },
  {
    title: "Solde",
    icon: Wallet,
    url: "/soldeDistilleur",
    roles: ["admin", "distilleur"],
  },
  {
    title: "Gestion Distillation",
    icon: Droplet,
    url: "/distillation",
    roles: ["admin", "distilleur"],
    items: [
      { title: "Expédition", url: "/distillation/expedition" },
      { title: "Distillation", url: "/distillation/Debutdistillation" },
      { title: "Transport", url: "/distillation/transport" },
    ],
  },
  
  {
    title: "Produit Fini",
    icon: Box,
    url: "/produit-fini",
    roles: ["admin"],
    items: [{ title: "Stock de produit fini", url: "/produit-fini/stock" }],
  },
  {
    title: "Transport",
    icon: Truck,
    url: "/transport",
    roles: ["admin"],
  },
  {
    title: "Gestion Vente",
    icon: ShoppingCart,
    url: "/vente",
    roles: ["admin", "vendeur"],
    items: [
      { title: "Réception", url: "/vente/reception" },
      { title: "Agrégage Provisoire", url: "/vente/agregate-provisoire" },
      { title: "Agrégage Définitif", url: "/vente/agregate-definitif" },
    ],
  },
  {
    title: "Compte Vendeur",
    icon: User,
    url: "/compte-vendeur",
    roles: ["admin"],
    items: [
      { title: "Reception", url: "/vente/reception" },
      { title: "A.Provisoire", url: "/vente/agregate-provisoire" },
      { title: "A.definitif", url: "/vente/agregate-definitif" },
    ],
  },
  {
    title: "Clients",
    icon: UserPlus,
    url: "/clients",
    roles: ["admin", "vendeur"],
  },
  {
    title: "Gestion du Compte",
    icon: User,
    url: "/compte",
    roles: ["admin", "collecteur", "distilleur", "vendeur"],
  },
  {
    title: "Scan",
    icon: Scan,
    url: "/scan",
    roles: ["admin", "collecteur"],
  },
]

export function getMenuItemsForRole(role: UserRole): MenuItem[] {
  const base = menuItems.filter((item) => item.roles.includes(role))

  let workingBase = [...base]
  if (role === "admin") {
    workingBase = workingBase.filter((i) => i.url !== "/vente")
  }
  if (role === "admin") {
    const hasCollecte = workingBase.some((i) => i.url === "/collecte")
    const hasTransfert = workingBase.some((i) => i.url === "/pointsDeCollecte")
    if (hasCollecte || hasTransfert) {
      const collectItems: { title: string; url: string }[] = []
      if (hasCollecte) collectItems.push({ title: "Collecte", url: "/collecte" })
      if (hasTransfert) collectItems.push({ title: "Transfert", url: "/pointsDeCollecte" })

      const indices = base
        .map((i, idx) => ({ url: i.url, idx }))
        .filter((x) => x.url === "/collecte" || x.url === "/pointsDeCollecte")
        .map((x) => x.idx)
      const insertAt = indices.length ? Math.min(...indices) : workingBase.length

      workingBase = workingBase.filter((i) => i.url !== "/collecte" && i.url !== "/pointsDeCollecte")

      const combined: MenuItem = {
        title: "Gestion Collecte",
        icon: Package,
        url: "/collecte",
        roles: ["admin"],
        items: collectItems,
      }
      workingBase.splice(insertAt, 0, combined)
    }
  }

  const result: MenuItem[] = []
  let pendingSoldeForAdmin: { title: string; url: string } | null = null

  for (const item of workingBase) {
    if (item.url === "/soldeDistilleur") {
      if (role === "admin") {
        const soldeSub = { title: "Solde Distilleur", url: item.url }
        const distIndex = result.findIndex((r) => r.url === "/distillation")
        if (distIndex !== -1) {
          const distItem = { ...result[distIndex] }
          distItem.items = distItem.items ? [...distItem.items, soldeSub] : [soldeSub]
          result[distIndex] = distItem
        } else {
          pendingSoldeForAdmin = soldeSub
        }
        continue
      }

      const cloned: MenuItem = { ...item }
      cloned.title = "Solde"
      result.push(cloned)
      continue
    }

    if (item.url === "/distillation" && role === "distilleur") {
      if (item.items && item.items.length > 0) {
        for (const sub of item.items) {
          const iconForSub = sub.url === "/distillation/transport" ? Truck : Droplet
          result.push({
            title: sub.title,
            icon: iconForSub,
            url: sub.url,
            roles: [role],
          })
        }
      }
      continue
    }

    // For vendeur: show vente sub-items as top-level entries (same UX as distilleur)
    if (item.url === "/vente" && role === "vendeur") {
      if (item.items && item.items.length > 0) {
        for (const sub of item.items) {
          result.push({
            title: sub.title,
            icon: ShoppingCart,
            url: sub.url,
            roles: [role],
          })
        }
      }
      continue
    }

    if (item.url === "/distillation" && role === "admin") {
      const cloned = { ...item }
      if (pendingSoldeForAdmin) {
        cloned.items = cloned.items ? [...cloned.items, pendingSoldeForAdmin] : [pendingSoldeForAdmin]
        pendingSoldeForAdmin = null
      }
      result.push(cloned)
      continue
    }

    result.push(item)
  }

  return result
}