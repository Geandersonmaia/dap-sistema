import GoogleProvider from "next-auth/providers/google";

function emailsAutorizados() {
  return (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      const lista = emailsAutorizados();
      if (!email || !lista.includes(email)) {
        return false; // NextAuth redireciona para /login?error=AccessDenied
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};
