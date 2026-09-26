// Marca provisória do app (asa estilizada). Substituir pelo brasão oficial do GOA quando disponível.
export default function Brasao({ className = "" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#C8102E" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#D4A537" strokeWidth="2" />
      <path d="M10 34 L30 28 L32 22 L34 28 L54 34 L34 34 L32 44 L30 34 Z" fill="#FFFFFF" />
      <path d="M26 46 h12" stroke="#D4A537" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
