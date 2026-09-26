import Icone from "./Icone";

export const SITUACAO = {
  disponivel: { rotulo: "Disponível", cor: "bg-goa-verde", texto: "text-emerald-300" },
  manutencao: { rotulo: "Manutenção", cor: "bg-goa-ambar", texto: "text-goa-ambar" },
  indisponivel: { rotulo: "Indisponível", cor: "bg-goa-vermelho", texto: "text-red-300" },
};

// Gradientes dos ícones: asa fixa em azul, asa rotativa em vermelho (como no brasão)
const GRADIENTE = {
  asa_fixa: "linear-gradient(145deg,#4C86F0 0%,#1F4FA3 100%)",
  asa_rotativa: "linear-gradient(145deg,#F4545A 0%,#B81A20 100%)",
};

export function IconeAeronave({ tipo, className = "h-12 w-12" }) {
  return (
    <span className={`icone-app ${className}`} style={{ background: GRADIENTE[tipo] }}>
      <Icone nome={tipo === "asa_rotativa" ? "helicoptero" : "aviao"} className="h-[55%] w-[55%]" />
    </span>
  );
}
