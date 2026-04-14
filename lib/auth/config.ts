import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import NextAuth from "next-auth";
import bcrypt from "bcryptjs";

import { baseAuthConfig } from "@/lib/auth/base";
import { prisma } from "@/lib/prisma";
import { log } from "@/lib/logging";

const resendProvider = process.env.RESEND_API_KEY
  ? [Resend({ apiKey: process.env.RESEND_API_KEY, from: process.env.EMAIL_FROM ?? "noreply@raeyl.com" })]
  : [];

export const authConfig = {
  ...baseAuthConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
    ...resendProvider,
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          log("warn", "auth.credentials.invalid", { metadata: { email } });
          return null;
        }

        return user;
      }
    })
  ]
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
