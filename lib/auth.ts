import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const ALLOWED_EMAILS = new Set([
  "galili@educ.org.il",
  "1002409338@educ.org.il",
  "galili@galili-ks.org.il",
  "adib@galili-ks.org.il",
  "yarin@galili-ks.org.il",
  "hadarm@galili-ks.org.il",
  "hagitf@galili-ks.org.il",
  "shirsig@gmail.com",
  "yaelva@galili-ks.org.il",
  "kohavit@galili-ks.org.il",
  "eyalsh@galili-ks.org.il",
  "diklata@galili-ks.org.il",
  "odedco@galili-ks.org.il",
  "odelyabraun@galili-ks.org.il",
  "anat@galili-ks.org.il",
  "yifatj@galili-ks.org.il",
  "yaelmatalon@educ.org.il",
]);

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://");
const cookiePrefix = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecureCookies },
    },
    callbackUrl: {
      name: `${cookiePrefix}next-auth.callback-url`,
      options: { sameSite: "lax", path: "/", secure: useSecureCookies },
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecureCookies },
    },
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecureCookies, maxAge: 900 },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecureCookies, maxAge: 900 },
    },
  },
  callbacks: {
    async signIn({ user }) {
      return ALLOWED_EMAILS.has(user.email ?? "");
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
};
