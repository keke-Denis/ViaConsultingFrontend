// app/soldes/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Wallet, History, ArrowUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SoldeGeneralTab from "@/components/solde/solde-general-tab";
import HistoriqueTransactionsTab from "@/components/solde/historique-transactions-tab";
import TransfertSoldeTab from "@/components/solde/transfert-solde-tab";
import { SoldeProvider, useSolde } from "@/contexts/solde-context";
import { StatsProvider } from "@/contexts/stats-context";
import { SoldeGlobalProvider, useSoldeGlobal } from "@/contexts/transfertSolde/transfertSolde";

// Composant pour l'affichage du solde avec contexte global
function SoldeDisplay() {
  const { soldeGlobal } = useSoldeGlobal();

  return (
    <Card className="border-0 shadow-lg w-full sm:min-w-[280px] sm:w-auto bg-gradient-to-br from-[#76bc21] to-[#5ea11a] hover:shadow-xl transition-all duration-300">
      <div className="rounded-lg px-4 sm:px-5 py-3 flex flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent transform -skew-x-12 animate-shine"></div>
        <div className="flex items-center gap-2 sm:gap-3 relative z-10">
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-white/10">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-white text-sm sm:text-base">Solde actuel</span>
        </div>
        <div className="font-bold text-white text-lg sm:text-2xl bg-white/10 px-3 py-1 rounded border border-white/20">
          {soldeGlobal.toLocaleString("fr-FR")} Ar
        </div>
      </div>
    </Card>
  );
}

// Composant wrapper pour initialiser le solde global
function SoldeInitializer() {
  const { soldeActuel, isLoading } = useSolde();
  const { setSoldeGlobal } = useSoldeGlobal();

  useEffect(() => {
    if (!isLoading) {
      setSoldeGlobal(soldeActuel);
    }
  }, [soldeActuel, isLoading, setSoldeGlobal]);

  return null;
}

// Composant principal de la page
function PageSoldesContent() {
  const primaryGreen = "#76bc21";
  const activeGreenClass = "data-[state=active]:bg-[#76bc21] data-[state=active]:text-white";

  const [activeTab, setActiveTab] = useState("general");
  const [isClient, setIsClient] = useState(false);

  const validTabs = ["general", "historique", "transfert"];

  const tabsConfig = [
    { value: "general", label: "Solde général", shortLabel: "Général", icon: Wallet, title: "Vue d'ensemble du solde" },
    { value: "transfert", label: "Transferts", shortLabel: "Transfert", icon: ArrowUpDown, title: "Transférer vers un compte" },
    { value: "historique", label: "Historique", shortLabel: "Historique", icon: History, title: "Toutes les transactions" },
  ];

  useEffect(() => {
    setIsClient(true);
    const savedTab = localStorage.getItem("soldes-active-tab");
    if (savedTab && validTabs.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  const handleTabChange = (value: string) => {
    if (validTabs.includes(value)) {
      setActiveTab(value);
      localStorage.setItem("soldes-active-tab", value);
    }
  };

  if (!isClient) {
    return (
      <ProtectedLayout allowedRoles={["admin", "collecteur"]}>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div>
                <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-80 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="border-0 shadow-lg min-w-[280px] bg-gray-200 animate-pulse rounded-lg h-16"></div>
          </div>
          <div className="w-full max-w-3xl mx-auto bg-muted/50 p-1 rounded-xl h-12 animate-pulse"></div>
          <div className="mt-8 h-96 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={["admin", "collecteur"]}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
              >
                Gestion de solde
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Suivi et gestion complète des soldes et transactions
              </p>
            </div>
          </div>
          <SoldeDisplay />
        </div>

        {/* Initialiseur du solde global */}
        <SoldeInitializer />

        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
              {tabsConfig.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    title={tab.title}
                    className={`${activeGreenClass} data-[state=active]:shadow-sm rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 py-2 px-3 min-h-[44px] flex flex-col sm:flex-row items-center justify-center gap-1.5 ${activeTab !== tab.value ? "opacity-70 hover:opacity-90" : "opacity-100"}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="general" className="mt-6">
              <SoldeGeneralTab />
            </TabsContent>
            <TabsContent value="historique" className="mt-6">
              <HistoriqueTransactionsTab />
            </TabsContent>
            <TabsContent value="transfert" className="mt-6">
              <TransfertSoldeTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  );
}

// Page principale avec tous les providers
export default function PageSoldes() {
  return (
    <SoldeGlobalProvider>
      <SoldeProvider>
        <StatsProvider>
          <PageSoldesContent />
        </StatsProvider>
      </SoldeProvider>
    </SoldeGlobalProvider>
  );
}