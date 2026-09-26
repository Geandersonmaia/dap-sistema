import { NextResponse } from "next/server";

export function middleware(request) {
  const sessao = request.cookies.get("goa_sessao")?.value;
  if (sessao && sessao === process.env.GOA_SESSION_TOKEN) return NextResponse.next();
  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!login|_next|manifest.json|icon.svg|favicon.ico).*)"],
};
