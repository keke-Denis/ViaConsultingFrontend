// app/distillation/expedition/page.tsx
"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import Expedition from "@/components/distillation/expedition/expedition";
import { useAuth } from "@/contexts/auth-context";

export default function ExpeditionPage() {
  const { user, isLoading } = useAuth();

  const primaryGreen = "#76bc21";
  const isAdmin = user?.role === "admin";

  // Déterminer le titre selon le rôle de l'utilisateur
  const title = isLoading ? "Expédition" : isAdmin ? "Suivi d'expedition" : "Expédition";

  return (
    <ProtectedLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
          >
            {isAdmin ? `Suivi d'expedition` : `Expédition`}
          </h1>
          <p className="text-muted-foreground mt-2">Gestion des expéditions</p>
        </div>

        <div className="mt-6">
          <Expedition />
        </div>
      </div>
    </ProtectedLayout>
  );
}
