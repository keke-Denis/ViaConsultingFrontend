"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Navbar } from "@/components/navbar"
import { MobileSidebar } from "@/components/mobile-sidebar"
import type { UserRole } from "@/lib/auth"

interface ProtectedLayoutProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export function ProtectedLayout({ children, allowedRoles }: ProtectedLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }

    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized")
    }
  }, [user, isLoading, router, allowedRoles])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Navbar />
      <MobileSidebar />
      <main className="flex-1 p-4 md:p-6">{children}</main>
    </div>
  )
}
