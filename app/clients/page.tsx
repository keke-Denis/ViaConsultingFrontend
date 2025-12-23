// app/ventes/page.tsx
"use client";

import React from 'react';
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Users, FileText, History, Wallet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ClientsPage from "@/components/clients/clients";
import ExportationPage from "@/components/clients/exportation";
import HistoriquePage from "@/components/clients/historiqueExportation";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";

const formatAriary = (amount: number | string | null | undefined): string => {
  const num = Number(amount) || 0;
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
    <div className="grid w-full grid-cols-3 max-w-4xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 rounded-lg animate-pulse min-h-[44px] flex items-center justify-center gap-2"
        >
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <div className="h-3 w-16 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
    <div className="bg-gray-100 rounded-lg h-64 animate-pulse"></div>
  </div>
);

export default function VentesPage() {
  const primaryGreen = "#76bc21";
  const activeGreenClass = "data-[state=active]:bg-[#76bc21] data-[state=active]:text-white";

  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("clients");
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const validTabs = ["clients", "exportation", "historique"];

  const tabsConfig = [
    { value: "exportation", label: "Exportation", shortLabel: "Export.", icon: FileText, title: "Exportation des données" },
    
    { value: "clients", label: "Clients", shortLabel: "Clients", icon: Users, title: "Gestion des clients" },
    
    { value: "historique", label: "Historique", shortLabel: "Hist.", icon: History, title: "Historique des exportations" },
  ];

  useEffect(() => {
    setIsClient(true);

    const savedTab = localStorage.getItem("ventes-active-tab");
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
      localStorage.setItem("ventes-active-tab", value);
    }
  };

  // Déterminer si l'utilisateur est admin
  const isAdmin = user?.role === "admin";

  // Solde statique
  const soldeStatique = 2500000; 

  if (!isClient || isPageLoading) {
    return (
      <ProtectedLayout allowedRoles={["admin", "vendeur"]}>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <HeaderSkeleton />
          <TabsSkeleton />
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout allowedRoles={["admin", "vendeur"]}>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
              >
                {isAdmin ? "Gestion des Ventes" : "Ventes"}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base">
                {isAdmin
                  ? "Gestion complète des ventes et clients"
                  : "Gestion des clients et exportations"}
              </p>
            </div>
          </div>

          {/* Card des soldes : visible pour admin et vendeur */}
          <Card className="border-0 shadow-lg w-full sm:min-w-[280px] sm:w-auto bg-gradient-to-br from-[#76bc21] to-[#5ea11a] hover:shadow-xl transition-all duration-300">
            <div className="rounded-lg px-4 sm:px-5 py-3 flex flex-row items-center justify-between gap-3 sm:gap-4 relative overflow-hidden min-h-[64px]">
              {/* Effet shine */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent transform -skew-x-12 animate-shine"></div>

              {/* Icône Wallet */}
              <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg backdrop-blur-sm border border-white/10 relative z-10">
                <Wallet className="w-5 h-5 text-white" />
              </div>

              {/* Solde statique */}
              <div className="relative z-10 flex-1 text-right">
                <div className="font-bold text-white text-lg leading-tight">
                  Solde actuel : {formatAriary(soldeStatique)} Ar
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-4xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
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
            <TabsContent value="exportation" className="mt-6 sm:mt-8">
              <ExportationPage />
            </TabsContent>
            
            <TabsContent value="clients" className="mt-6 sm:mt-8">
              <ClientsPage />
            </TabsContent>
            
            <TabsContent value="historique" className="mt-6 sm:mt-8">
              <HistoriquePage />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  );
}