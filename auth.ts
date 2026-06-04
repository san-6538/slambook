import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

// Stateless JWT sessions — no database adapter, no users collection. Ownership is
// keyed entirely on the verified email from Google/GitHub. Provider credentials are
// read from env by convention: AUTH_GOOGLE_ID/SECRET, AUTH_GITHUB_ID/SECRET, AUTH_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google, GitHub],
  session: { strategy: 'jwt' },
  trustHost: true, // required behind Vercel's proxy; harmless locally
  callbacks: {
    async jwt({ token, profile }) {
      if (profile?.email) token.email = profile.email;
      return token;
    },
    async session({ session, token }) {
      if (token?.email && session.user) session.user.email = token.email as string;
      return session;
    },
  },
});
