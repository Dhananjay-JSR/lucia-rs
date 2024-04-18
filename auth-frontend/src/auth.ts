import { Lucia } from "lucia";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./db";
import { sessionTable, userTable } from "./schema";
import { Google } from "arctic";
const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);
export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      picture: attributes.user_picture,
      name: attributes.user_name,
    };
  },
});

export const google = new Google(
  process.env.GOOGLE_AUTH_ID!,
  process.env.GOOGLE_AUTH_SECRET!,
  process.env.GOOGLE_AUTH_REDIRECT_URI!
);
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  user_name: string;
  user_picture: string;
}
