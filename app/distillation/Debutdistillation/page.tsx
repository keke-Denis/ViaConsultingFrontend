// app/distillation/page.tsx
"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import Distillation from "@/components/distillation/debutdistillation/debutdistiation";
import { useAuth } from "@/contexts/auth-context";

export default function DistillationPage() {
  const { user, isLoading } = useAuth();

  const primaryGreen = "#76bc21";
  const isAdmin = user?.role === "admin";
  const isDistilleur = user?.role === "distilleur";

  // Déterminer le titre selon le rôle de l'utilisateur
  const title = isLoading 
    ? "Distillation" 
    : isAdmin 
      ? "Suivi de la distillation" 
      : isDistilleur 
        ? "Distillation" 
        : "Debut de la distillation";

  return (
    <ProtectedLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold tracking-tight bg-linear-to-r bg-clip-text text-transparent"
            style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
          >
            {title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin ? "Suivi de toutes les distillations" : "Gestion des distillations"}
          </p>
        </div>

        <div className="mt-6">
          <Distillation />
        </div>
      </div>
    </ProtectedLayout>
  );
}