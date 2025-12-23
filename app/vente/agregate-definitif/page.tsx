"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import { useAuth } from "@/contexts/auth-context";
import AgregageDefinitif from "@/components/vente/agregageDefinitif/agregageDefinitif";

export default function AgregageDefinitifPage() {
  const { user, isLoading } = useAuth();

  const primaryGreen = "#76bc21";
  const isAdmin = user?.role === "admin";
  const isVendeur = user?.role === "vendeur";

  // Déterminer le titre selon le rôle de l'utilisateur
  const title = isLoading
    ? "Agrégage Définitif"
    : isAdmin
    ? "Suivi de décision final et paiement des huiles essentielles"
    : isVendeur
    ? "Gestion de validation et paiement des huiles essentielles"
    : "Agrégage Définitif";

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
            {isAdmin 
              ? "Suivi des décisions finales et paiements des huiles essentielles" 
              : "Gestion de la validation et du paiement des huiles essentielles"}
          </p>
        </div>

        {/* Appel du composant AgregageDefinitif */}
        <div className="mt-6">
          <AgregageDefinitif />
        </div>
      </div>
    </ProtectedLayout>
  );
}