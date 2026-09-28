"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "@/components/dashboard/ChartCard";
import { formatarBRL, formatarMes } from "@/lib/obras/calculos";

// Cores: série 1 (azul) = receita/orçado, série 2 (laranja) = custo/real.
export const COR_RECEITA = "#2a78d6";
export const COR_CUSTO = "#eb6834";
const COR_NEGATIVO = "#d03b3b";
const EIXO = { fontSize: 11, fill: "#898781" };
const GRADE = "#e1e0d9";

const compacto = (v) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(v);

const tooltipBRL = { formatter: (v) => formatarBRL(v), labelFormatter: (l) => (/^\d{4}-\d{2}$/.test(l) ? formatarMes(l) : l) };

export function GraficoAcumulado({ evolucao, altura = 280 }) {
  return (
    <ChartCard titulo="Receita medida × custo real (acumulado)" altura={altura}>
      <ResponsiveContainer>
        <LineChart data={evolucao} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis dataKey="mes" tickFormatter={formatarMes} tick={EIXO} axisLine={{ stroke: "#c3c2b7" }} tickLine={false} />
          <YAxis tickFormatter={compacto} tick={EIXO} axisLine={false} tickLine={false} width={48} />
          <Tooltip {...tooltipBRL} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="receitaAcum" name="Receita medida" stroke={COR_RECEITA} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          <Line type="monotone" dataKey="custoAcum" name="Custo real" stroke={COR_CUSTO} strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GraficoResultadoMensal({ evolucao, altura = 280 }) {
  return (
    <ChartCard titulo="Resultado do mês (medição − gastos)" altura={altura}>
      <ResponsiveContainer>
        <BarChart data={evolucao} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis dataKey="mes" tickFormatter={formatarMes} tick={EIXO} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={compacto} tick={EIXO} axisLine={false} tickLine={false} width={48} />
          <Tooltip {...tooltipBRL} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <ReferenceLine y={0} stroke="#c3c2b7" />
          <Bar dataKey="resultado" name="Resultado" radius={[4, 4, 4, 4]} isAnimationActive={false}>
            {evolucao.map((e) => (
              <Cell key={e.mes} fill={e.resultado < 0 ? COR_NEGATIVO : COR_RECEITA} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GraficoCategorias({ porCategoria, altura = 280 }) {
  return (
    <ChartCard titulo="Custo por categoria: previsto para o que foi medido × gasto real" altura={altura}>
      <ResponsiveContainer>
        <BarChart data={porCategoria} margin={{ top: 8, right: 12, left: 4, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={GRADE} vertical={false} />
          <XAxis dataKey="curto" tick={EIXO} axisLine={false} tickLine={false} interval={0} />
          <YAxis tickFormatter={compacto} tick={EIXO} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={(v) => formatarBRL(v)} labelFormatter={(_, p) => p?.[0]?.payload?.label} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="orcadoProporcional" name="Previsto no orçamento" fill={COR_RECEITA} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="real" name="Gasto real" fill={COR_CUSTO} radius={[4, 4, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function GraficoVariacaoPrecos({ itens, altura = 280 }) {
  const dados = itens
    .filter((i) => i.variacao !== null)
    .sort((a, b) => b.variacao - a.variacao)
    .slice(0, 10)
    .map((i) => ({ nome: i.descricao.length > 28 ? `${i.descricao.slice(0, 27)}…` : i.descricao, variacao: i.variacao * 100 }));
  if (!dados.length) return null;
  return (
    <ChartCard titulo="Variação do preço pago em relação ao orçado (%)" altura={Math.max(altura, dados.length * 34 + 40)}>
      <ResponsiveContainer>
        <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 24, left: 8, bottom: 0 }}>
          <CartesianGrid stroke={GRADE} horizontal={false} />
          <XAxis type="number" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={EIXO} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="nome" width={170} tick={{ ...EIXO, fill: "#52514e" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => `${v.toFixed(1)}%`} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
          <ReferenceLine x={0} stroke="#c3c2b7" />
          <Bar dataKey="variacao" name="Variação" radius={4} isAnimationActive={false}>
            {dados.map((d) => (
              <Cell key={d.nome} fill={d.variacao > 0 ? COR_NEGATIVO : COR_RECEITA} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
