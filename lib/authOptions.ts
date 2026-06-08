// lib/authOptions.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isPasswordValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id ?? token.sub;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const email = session.user.email ?? token.email;

        let resolvedId = ((token.id as string) ?? token.sub ?? "") as string;

        // If DB was reset or token became stale, resolve the latest user id by email.
        if (email) {
          const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          });

          if (existingUser?.id) {
            resolvedId = existingUser.id;
            token.id = existingUser.id;
          }
        }

        (session.user as typeof session.user & { id: string }).id = resolvedId;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};
