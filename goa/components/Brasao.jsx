// Brasão oficial do Grupo de Operações Aéreas do CBMRO
export default function Brasao({ className = "h-10 w-10" }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brasao-goa.png" alt="Brasão do GOA/CBMRO" className={`${className} object-contain`} />;
}
