// components/solde/soldeCard.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  FileText,
} from "lucide-react";
import { useSolde } from "@/contexts/solde-context";
import { useStats } from "@/contexts/stats-context";

const COLOR = "#72bc21";
const COLOR_LIGHT = "#ffffff";

export default function SoldeCard() {
  const { soldeActuel, refreshSolde, lastUpdate } = useSolde();
  const { stats, isLoading, refreshStats } = useStats();

  const handleRefresh = async () => {
    await Promise.all([refreshSolde(), refreshStats()]);
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(num);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("fr-MG").format(num);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    isCurrency = true,
  }: any) => (
    <Card
      className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] 
                 flex flex-col h-full"
      style={{
        background: `linear-gradient(to bottom right, ${COLOR_LIGHT}, ${COLOR}10)`,
        borderLeft: `5px solid ${COLOR}`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold uppercase text-black">
          {title}
        </CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
          <Icon className="h-5 w-5" style={{ color: COLOR }} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="text-2xl md:text-3xl font-bold text-black">
          {isLoading ? "..." : isCurrency ? formatCurrency(value) : formatNumber(value)}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-2xl font-bold text-[#72bc21]">
            Gestion du Solde Général
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Données en temps réel depuis la caisse
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="w-full sm:w-auto hover:bg-[#72bc21] hover:text-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="ml-2">Actualiser</span>
        </Button>
      </div>

      {/* Cartes statistiques – grille ultra-responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Solde Total"
          value={soldeActuel}
          icon={DollarSign}
          isCurrency={true}
        />
        <StatCard
          title="Total Revenus"
          value={stats.total_revenus}
          icon={TrendingUp}
          trend="up"
          isCurrency={true}
        />
        <StatCard
          title="Total Dépenses"
          value={stats.total_depenses}
          icon={TrendingDown}
          trend="down"
          isCurrency={true}
        />
        <StatCard
          title="Nombre de Transactions"
          value={stats.nombre_transactions}
          icon={FileText}
          isCurrency={false}
        />
      </div>
    </div>
  );
}