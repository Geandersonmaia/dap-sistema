"use client";

import { useRouter } from "next/navigation";
import ObrasLayout from "@/components/obras/ObrasLayout";
import ContratoForm from "@/components/obras/ContratoForm";
import { chamarAPI } from "@/hooks/useObra";

export default function NovaObraPage() {
  const router = useRouter();
  return (
    <ObrasLayout titulo="Nova obra">
      <div className="mx-auto max-w-3xl">
        <ContratoForm
          textoBotao="Cadastrar obra"
          onSalvar={async (form) => {
            const obra = await chamarAPI("/api/obras", { method: "POST", body: form });
            router.push(`/obras/${obra.id}/orcamento`);
          }}
        />
      </div>
    </ObrasLayout>
  );
}
