"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import RefreshButton from "@/components/dashboard/RefreshButton";

const CORES_PIZZA = ["#1e3a6e", "#2f6fdb", "#3fa34d", "#f2c230", "#dc2626", "#9333ea", "#0891b2"];

export default function PainelGeralPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/bi/overview");
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setDados(json);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [carregar]);

  return (
    <DashboardLayout titulo="Painel Geral">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={dados?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !dados && <LoadingState texto="Carregando painel..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {dados && !erro && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard titulo="Atas Ativas" valor={dados.kpis.ativas} cor="verde" icone="🟢" />
            <StatCard titulo="Atas Vencidas" valor={dados.kpis.vencidas} cor="vermelho" icone="🔴" />
            <StatCard titulo="Atas com Saldo Baixo" valor={dados.kpis.saldoBaixo} cor="amarelo" icone="🟡" />
            <StatCard
              titulo="Reimplantação Urgente"
              valor={dados.kpis.reimplantacaoUrgente}
              cor="amarelo"
              icone="🟠"
            />
            <StatCard titulo="Liquidações Vencidas" valor={dados.kpis.vencidasLiquidacao} cor="vermelho" icone="🔴" />
            <StatCard titulo="Vencendo em Breve" valor={dados.kpis.vencendoEmBreve} cor="amarelo" icone="🟠" />
            <StatCard titulo="Pendentes de Recebimento" valor={dados.kpis.pendentesRecebimento} cor="azul" icone="📦" />
            <StatCard
              titulo="Valor Pendente de Liquidação"
              valor={new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                dados.kpis.valorTotalPendente || 0
              )}
              cor="azul"
              icone="💰"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard titulo="Status de Liquidação">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dados.graficos.statusLiquidacao}
                    dataKey="total"
                    nameKey="status"
                    outerRadius={90}
                    label={({ status, total }) => `${status} (${total})`}
                  >
                    {dados.graficos.statusLiquidacao.map((_, i) => (
                      <Cell key={i} fill={CORES_PIZZA[i % CORES_PIZZA.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
