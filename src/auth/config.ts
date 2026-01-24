import { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";

export const authConfig: NextAuthConfig = {
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = profile.id ?? undefined;
        token.accessToken = account.access_token ?? undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.discordId = token.discordId as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      // Discord サーバーのメンバーかどうかを確認することも可能
      // ここではシンプルにDiscordアカウントであれば許可
      if (account?.provider === "discord" && profile) {
        return true;
      }
      return false;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
};
