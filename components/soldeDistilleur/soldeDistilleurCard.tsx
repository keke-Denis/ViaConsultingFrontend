"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, RefreshCw, FileText, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import soldeDistilleurApi from "@/lib/soldeDistilleur/soldeDistilleur-api";

export default function SoldeDistilleurCard() {
  const COLOR = "#72bc21";
  const COLOR_LIGHT = "#ffffff";

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("fr-MG", {
      style: "currency",
      currency: "MGA",
      minimumFractionDigits: 0,
    }).format(num);

  const StatCard = ({ title, value, icon: Icon, isCurrency = true }: any) => (
    <Card
      className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
      style={{
        background: `linear-gradient(to bottom right, ${COLOR_LIGHT}, ${COLOR}10)`,
        borderLeft: `5px solid ${COLOR}`,
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-semibold uppercase text-black">{title}</CardTitle>
        <div className="p-2 rounded-lg" style={{ backgroundColor: COLOR_LIGHT }}>
          <Icon className="h-5 w-5" style={{ color: COLOR }} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-1">
        <div className="text-2xl md:text-3xl font-bold text-black">
          {isCurrency ? formatCurrency(value) : new Intl.NumberFormat("fr-MG").format(value)}
        </div>
      </CardContent>
    </Card>
  );

  // Local state for live values (fetched from API)
  const [solde, setSolde] = useState<number | null>(null);
  const [totalDepenses, setTotalDepenses] = useState<number>(0);
  const [transactionsCount, setTransactionsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch solde and historique to compute totals
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const soldeData = await soldeDistilleurApi.monSolde();
        const hist = await soldeDistilleurApi.fetchHistoriqueRetraits();

        if (!mounted) return;

        const currentSolde = Number(soldeData?.solde?.montant ?? soldeData?.montant ?? 0);
        setSolde(Number.isFinite(currentSolde) ? currentSolde : null);

        if (Array.isArray(hist)) {
          const total = hist.reduce((acc: number, tx: any) => {
            const m = Number(tx.montant ?? 0);
            return acc + (Number.isFinite(m) ? m : 0);
          }, 0);
          setTotalDepenses(total);
          setTransactionsCount(hist.length);
        } else {
          setTotalDepenses(0);
          setTransactionsCount(0);
        }
      } catch (e) {
        console.error("Erreur chargement solde distillateur:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full space-y-6 p-4 sm:p-6 bg-gray-50/50 rounded-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-2xl font-bold text-[#72bc21]">Solde du Distillateur</h2>
        </div>

        <Button variant="outline" size="sm" disabled className="w-full sm:w-auto">
          <RefreshCw className="h-4 w-4" />
          <span className="ml-2">Actualiser</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Solde disponible"
          value={loading ? 0 : solde ?? 0}
          icon={FlaskConical}
          isCurrency={true}
        />
        <StatCard
          title="Total Dépenses"
          value={loading ? 0 : totalDepenses}
          icon={TrendingDown}
          isCurrency={true}
        />
        <StatCard
          title="Nombre Transactions"
          value={loading ? 0 : transactionsCount}
          icon={FileText}
          isCurrency={false}
        />
      </div>
    </div>
  );
}