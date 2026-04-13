import NextAuth from "next-auth";

import { baseAuthConfig } from "@/lib/auth/base";

export const { auth: middleware } = NextAuth(baseAuthConfig);

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"]
};
