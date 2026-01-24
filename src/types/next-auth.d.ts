import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      discordId?: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    id?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    discordId?: string;
    accessToken?: string;
  }
}
