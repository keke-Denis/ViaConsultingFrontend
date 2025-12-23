"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Package, Truck, History, Archive } from "lucide-react";
import Transfert from "@/components/pointsDeCollecte/transfert/transfert";
import HistoriqueDeTransfert from "@/components/pointsDeCollecte/historiqueDeTransfert/historiqueDeTransfert";
import PointsDeCollecteCardComponent from "@/components/pointsDeCollecte/pointsDeCollecteCard";
import PointsDeCollecteHeCard from "@/components/pointsDeCollecte/pointsDeCollecteHeCard";
import TransfertHE from "@/components/pointsDeCollecte/transfert/transfertHE";

const primaryGreen = "#76bc21";
const activeGreenClass = "data-[state=active]:bg-[#76bc21] data-[state=active]:text-white";

// Composant Skeleton pour le header
const HeaderSkeleton = () => (
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-6">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
  </div>
);

// Composant Skeleton pour les tabs
const TabsSkeleton = () => (
  <div className="space-y-6">
    <div className="grid w-full grid-cols-3 max-w-3xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
      {Array.from({ length: 3 }).map((_, i) => (
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

export default function PointsDeCollectePage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("transfert");
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const validTabs = ["transfert", "transfert-he", "historique"];

  const tabsConfig = [
    { 
      value: "transfert", 
      label: "Transfert MP", 
      shortLabel: "MP", 
      icon: Truck, 
      title: "Création de nouveaux transferts MP" 
    },
    { 
      value: "transfert-he", 
      label: "Transfert HE", 
      shortLabel: "HE", 
      icon: Archive, 
      title: "Création de nouveaux transferts HE" 
    },
    { 
      value: "historique", 
      label: "Historique", 
      shortLabel: "Historique", 
      icon: History, 
      title: "Historique des transferts effectués" 
    },
  ];

  useEffect(() => {
    setIsClient(true);

    // Récupérer l'onglet actif depuis le localStorage
    const savedTab = localStorage.getItem("points-collecte-active-tab");
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
      // Sauvegarder dans le localStorage pour la persistance
      localStorage.setItem("points-collecte-active-tab", value);
    }
  };

  const isAdmin = user?.role === "admin";
  const isCollecteur = user?.role === "collecteur";

  if (!isClient || isPageLoading) {
    return (
      <ProtectedLayout>
        <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
          <HeaderSkeleton />
          <TabsSkeleton />
        </div>
      </ProtectedLayout>
    );
  }

  // Déterminer le titre selon le rôle de l'utilisateur
  const title = authLoading 
    ? "Suivi de transfert de la matière première" 
    : isAdmin 
      ? "Suivi de point de tous les transferts" 
      : isCollecteur 
        ? "Transfert de matière première par collecteur" 
        : "Tous les transferts de matière première";

  return (
    <ProtectedLayout>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-8 pt-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1
                className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(to right, ${primaryGreen}, #5ea11a)` }}
              >
                {title}
              </h1>
              <p className="text-muted-foreground text-sm md:text-base mt-2">
                {isAdmin 
                  ? "Suivi de tous les points de collecte" 
                  : isCollecteur 
                    ? "Gestion des points de collecte par site" 
                    : "Gestion des points de collecte"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs avec trois boutons - directement après le header */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-3xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
              {tabsConfig.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    title={tab.title}
                    className={`${activeGreenClass} data-[state=active]:shadow-sm rounded-lg text-sm sm:text-base font-medium transition-all duration-300 py-3 px-4 min-h-[44px] flex items-center justify-center gap-2 group hover:bg-gray-100`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Contenu du tab "Transfert MP" */}
            <TabsContent value="transfert" className="mt-6 sm:mt-8">
              <PointsDeCollecteCardComponent />
              <Transfert  />
            </TabsContent>

            {/* Contenu du tab "Transfert HE" */}
            <TabsContent value="transfert-he" className="mt-6 sm:mt-8">
              <PointsDeCollecteHeCard />
              <TransfertHE />
            </TabsContent>

            {/* Contenu du tab "Historique" */}
            <TabsContent value="historique" className="mt-6 sm:mt-8">
              <HistoriqueDeTransfert />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  );
}