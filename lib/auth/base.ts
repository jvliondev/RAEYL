import type { NextAuthConfig } from "next-auth";

export const baseAuthConfig: NextAuthConfig = {
  providers: [],
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "database"
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isAppRoute = request.nextUrl.pathname.startsWith("/app");
      const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

      if ((isAppRoute || isAdminRoute) && !isLoggedIn) {
        return false;
      }

      return true;
    }
  },
  trustHost: true
};
