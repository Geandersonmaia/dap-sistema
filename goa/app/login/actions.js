"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function entrar(_estado, formData) {
  if (String(formData.get("pin") || "") !== process.env.GOA_PIN) {
    return { erro: "PIN incorreto. Confira e tente de novo." };
  }
  cookies().set("goa_sessao", process.env.GOA_SESSION_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  redirect("/");
}
