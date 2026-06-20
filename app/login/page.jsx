"use client";

import { Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

function CardLogin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const erro = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") || "/painel";

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-4 flex justify-center">
          <Image src="/icon-192.png" alt="DAP" width={72} height={72} className="rounded-full" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900">DAP Sistema</h1>
        <p className="mt-1 text-sm text-gray-500">
          Painel de Gestão do Departamento de Almoxarifado e Patrimônio
        </p>

        {erro === "AccessDenied" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Usuário não autorizado para acessar o sistema.
          </p>
        )}
        {erro && erro !== "AccessDenied" && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Não foi possível entrar. Tente novamente.
          </p>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.13-.85 2.09-1.81 2.73v2.27h2.92c1.71-1.57 2.69-3.88 2.69-6.64z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.27c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.34A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.97 10.7A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.29-1.7V4.96H.96A8.997 8.997 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3.01-2.34z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58A8.62 8.62 0 0 0 9 0 8.997 8.997 0 0 0 .96 4.96l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
            />
          </svg>
          Entrar com Google
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <CardLogin />
    </Suspense>
  );
}
