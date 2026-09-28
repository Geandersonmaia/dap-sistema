"use client";

import { useRouter } from "next/navigation";
import ObrasLayout from "@/components/obras/ObrasLayout";
import ContratoForm from "@/components/obras/ContratoForm";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import { botaoSecundario } from "@/components/obras/Campo";
import { chamarAPI, useObra } from "@/hooks/useObra";

export default function ContratoPage({ params }) {
  const router = useRouter();
  const { dados, erro, recarregar } = useObra(params.id);

  async function excluir() {
    if (!confirm(`Excluir a obra "${dados.obra.nome}" e TODOS os lançamentos, medições e orçamento? Não dá para desfazer.`)) return;
    await chamarAPI(`/api/obras/${params.id}`, { method: "DELETE" });
    router.push("/obras");
  }

  return (
    <ObrasLayout titulo="Dados do contrato" obraId={params.id} nomeObra={dados?.obra?.nome}>
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}
      {!dados && !erro && <LoadingState />}
      {dados && (
        <div className="mx-auto max-w-3xl space-y-4">
          <ContratoForm
            inicial={dados.obra}
            onSalvar={async (form) => {
              await chamarAPI(`/api/obras/${params.id}`, { method: "PUT", body: form });
              router.push(`/obras/${params.id}`);
            }}
          />
          <div className="flex justify-end">
            <button onClick={excluir} className={`${botaoSecundario} border-red-200 text-red-700 hover:bg-red-50`}>
              Excluir obra
            </button>
          </div>
        </div>
      )}
    </ObrasLayout>
  );
}
