// app/transport/page.tsx
"use client";

import { ProtectedLayout } from "@/components/protected-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import TransportTable from "@/components/distillation/transport/transport";
import TransportHistoryTable from "@/components/distillation/transport/transportHistory";
import { Truck, History } from "lucide-react";

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
    <div className="grid w-full grid-cols-2 max-w-2xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
      {Array.from({ length: 2 }).map((_, i) => (
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

export default function TransportPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("transport");
  const [isClient, setIsClient] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const validTabs = ["transport", "historique"];

  const tabsConfig = [
    { 
      value: "transport", 
      label: "Transport", 
      shortLabel: "Transport", 
      icon: Truck, 
      title: "Gestion des transports en cours" 
    },
    { 
      value: "historique", 
      label: "Historique de transport", 
      shortLabel: "Historique", 
      icon: History, 
      title: "Historique des transports terminés" 
    },
  ];

  useEffect(() => {
    setIsClient(true);

    const savedTab = localStorage.getItem("transport-active-tab");
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
      localStorage.setItem("transport-active-tab", value);
    }
  };

  // Déterminer si l'utilisateur est admin
  const isAdmin = user?.role === "admin";
  const isDistilleur = user?.role === "distilleur";

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
  const title = isAdmin ? "Suivi de transport" : "Transport";

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
                  ? "Suivi et gestion globale des transports" 
                  : isDistilleur
                    ? "Gestion des transports de matières premières et huiles essentielles"
                    : "Gestion des transports"}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs avec deux boutons - directement après le header */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-2xl mx-auto h-auto min-h-12 rounded-xl bg-muted/50 p-1 gap-1">
              {tabsConfig.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    title={tab.title}
                    className={`${activeGreenClass} data-[state=active]:shadow-sm rounded-lg text-sm sm:text-base font-medium transition-all duration-300 py-3 px-4 min-h-[44px] flex items-center justify-center gap-2 group hover:bg-gray-100`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Contenu du tab "Transport" */}
            <TabsContent value="transport" className="mt-6 sm:mt-8">
              <TransportTable />
            </TabsContent>

            {/* Contenu du tab "Historique" */}
            <TabsContent value="historique" className="mt-6 sm:mt-8">
              <TransportHistoryTable />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedLayout>
  );
}