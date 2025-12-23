"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import { useAuth } from "@/contexts/auth-context";
import AgregageProvisoire from "@/components/vente/agregageProvisoire/agregageProvisoire";

export default function AggregateProvisioirePage() {
  const { user, isLoading } = useAuth();

  const primaryGreen = "#76bc21";
  const isAdmin = user?.role === "admin";
  const isVendeur = user?.role === "vendeur";

  // Déterminer le titre selon le rôle de l'utilisateur
  const title = isLoading
    ? "Test Provisoire"
    : isAdmin
    ? "Suivi du début de test provisoire"
    : isVendeur
    ? "Débuter du test provisoire"
    : "Test Provisoire";

  return (
    <ProtectedLayout allowedRoles={["admin", "vendeur"]}>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
          >
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "Suivi de tous les tests provisoires" : "Gestion des tests provisoires"}
          </p>
        </div>

        {/* Appel du composant AgregageProvisoire */}
        <div className="mt-6">
          <AgregageProvisoire />
        </div>
      </div>
    </ProtectedLayout>
  );
}