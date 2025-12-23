// app/collecte/page.tsx
"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Wallet, UserPlus, CreditCard, Package, TestTube, Truck, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestHuileEssentielleTab } from "@/components/collecte/test-huile-essentielle-tab";
import TablesFournisseur from "@/components/collecte/tables-fournisseur";
import { PVReceptionProvider } from "@/contexts/pvreception/pvreception-context";
import { MatierePremiereTab } from "@/components/collecte/matiere-premiere-tab";
import { GestionPaiementTab } from "@/components/collecte/paiementEnAvance/gestion-paiement-tab";
import LivreurTable from "@/components/collecte/livreur/pageLivreur";

import { useEffect, useState } from "react";
import { useSolde } from "@/contexts/paimentEnAvance/solde-context";
import { useAuth } from "@/contexts/auth-context";

const formatAriary = (amount: number | string | null | undefined): string => {
  const num = Number(amount) || 0;
  // Use French (Madagascar) number formatting (uses grouping), no decimals,
  // then replace non-breaking spaces with regular spaces for consistent display.
  return new Intl.NumberFormat("fr-MG", { maximumFractionDigits: 0 })
    .format(num)
    .replace(/\u00A0|\u202F/g, " ");
};

// Composant Skeleton pour le header
const HeaderSkeleton = () => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
    <Card className="border-0 shadow-lg w-full sm:min-w-[280px] sm:w-auto bg-gray-200 animate-pulse h-16 rounded-lg"></Card>
  </div>
);

// Composant Skeleton pour les tabs
const TabsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid w-full grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-lg animate-pulse min-h-[44px] flex items-center justify-center gap-2"
        >
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="hidden sm:block h-3 w-16 bg-gray-300 rounded"></div>
          <div className="sm:hidden h-3 w-8 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
    <div className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
  </div>
);

export default function CollectePage() {
  const primaryGreen = "#76bc21";
  const activeGreenClass = "data-[state=active]:bg-[#76bc21] data-[state=active]:text-white";

  const { user, isLoading: authLoading } = useAuth();
  const { soldes, loading: soldeLoading, refreshSoldes } = useSolde();

  const [activeTab, setActiveTab] = useState("fournisseur");
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const validTabs = ["fournisseur", "paiement", "matiere-premiere", "test-huile", "livreur"];

  const tabsConfig = [
    { value: "fournisseur", label: "Fournisseur", shortLabel: "Fourn.", icon: UserPlus, title: "Créer un fournisseur" },
    { value: "paiement", label: "Paiement en avance", shortLabel: "Paiement", icon: CreditCard, title: "Faire un paiement en avance" },
    { value: "matiere-premiere", label: "Matière première", shortLabel: "Matière 1ère", icon: Package, title: "Créer un PV de réception" },
    { value: "test-huile", label: "Test huile", shortLabel: "Test huile", icon: TestTube, title: "Test d'huile essentielle" },
    { value: "livreur", label: "Gestion livreurs", shortLabel: "Livreurs", icon: Truck, title: "Gérer les livreurs" },
  ];

  useEffect(() => {
    setIsClient(true);

    const savedTab = localStorage.getItem("collecte-active-tab");
    if (savedTab && validTabs.includes(savedTab)) {
      setActiveTab(savedTab);
    }

    if (!authLoading) {
      setIsPageLoading(false);
    }
  }, [authLoading]);

  const handleTabChange = (value: string) => {
    if (validTabs.includes(value)) {
      setActiveTab(value);
      localStorage.setItem("collecte-active-tab", value);
    }
  };

  const handleRefreshSolde = async () => {
    await refreshSoldes();
  };

  // Déterminer si l'utilisateur est admin
  const isAdmin = user?.role === "admin";

  if (!isClient || isPageLoading) {
    return (
      <ProtectedLayout allowedRoles={["admin", "collecteur"]}>
        <PVReceptionProvider>
          <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
            <HeaderSkeleton />
            <TabsSkeleton />
          </div>
        </PVReceptionProvider>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={["admin", "collecteur"]}>
      <PVReceptionProvider>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <h1
                  className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent"
                  style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
                >
                  {isAdmin ? "Suivi de collecte" : "Collecte"}
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">
                  {isAdmin
                    ? "Suivi et gestion globale des collectes"
                    : "Gestion des collectes de matières premières"}
                </p>
              </div>
            </div>

            {/* Card des soldes : visible uniquement pour les collecteurs */}
            {!isAdmin && (
              <Card className="border-0 shadow-lg w-full sm:min-w-[280px] sm:w-auto bg-gradient-to-br from-[#76bc21] to-[#5ea11a] hover:shadow-xl transition-all duration-300">
                <div className="rounded-lg px-4 sm:px-5 py-3 flex flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden min-h-[64px]">
                  {/* Effet shine */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent transform -skew-x-12 animate-shine"></div>

                  {/* Icône Wallet */}
                  <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-white/10 relative z-10">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>

                  {/* Liste des soldes */}
                  <div className="relative z-10 flex-1 text-right max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-white/30 pr-1">
                    {soldeLoading ? (
                      <div className="font-bold text-white text-lg animate-pulse">...</div>
                    ) : soldes.length === 0 ? (
                      <div className="font-bold text-white text-lg">Solde actuel : 0 Ar</div>
                    ) : (
                      <div className="space-y-1.5">
                        {soldes.map((item) => (
                          <div
                            key={item.utilisateur_id}
                            className="font-bold text-white text-lg leading-tight"
                          >
                            Solde actuel : {formatAriary(item.solde)} Ar
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Tabs */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
                {tabsConfig.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      title={tab.title}
                      className={`${activeGreenClass} data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 py-2 px-2 sm:py-3 sm:px-3 min-h-[44px] flex items-center justify-center gap-2 group`}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              <TabsContent value="fournisseur" className="mt-6 sm:mt-8">
                <TablesFournisseur />
              </TabsContent>
              <TabsContent value="paiement" className="mt-6 sm:mt-8">
                <GestionPaiementTab onSoldeChange={handleRefreshSolde} />
              </TabsContent>
              <TabsContent value="matiere-premiere" className="mt-6 sm:mt-8">
                <MatierePremiereTab />
              </TabsContent>
              <TabsContent value="test-huile" className="mt-6 sm:mt-8">
                <TestHuileEssentielleTab />
              </TabsContent>
              <TabsContent value="livreur" className="mt-6 sm:mt-8">
                <LivreurTable />
              </TabsContent>
              
            </Tabs>
          </div>
        </div>
      </PVReceptionProvider>
    </ProtectedLayout>
  );
}