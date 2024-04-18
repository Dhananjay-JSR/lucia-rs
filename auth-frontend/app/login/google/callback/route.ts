import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { google, lucia } from "@/src/auth";
import { db } from "@/src/db";
import { userTable } from "@/src/schema";
import { eq } from "drizzle-orm";
import { constrainedMemory } from "process";
import { generateId } from "lucia";
import { NextRequest } from "next/server";
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("state")?.value ?? null;
  const storedCodeVerifier = cookies().get("code_verifier")?.value ?? null;
  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 400,
    });
  }
  try {
    const tokens = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier
    );
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      }
    );
    const user: {
      sub: string;
      name: string;
      picture: string;
    } = await response.json();
    const ExisitingUser = await db
      .select()
      .from(userTable)
      .where(eq(userTable.user_sub, user.sub));
    const isExistingUser = ExisitingUser.length != 0;
    if (isExistingUser) {
      const session = await lucia.createSession(ExisitingUser[0].id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );

      return new Response(null, {
        status: 302,
        headers: {
          Location: "/redirect?value=" + session.id,
        },
      });
    }
    const userId = generateId(15);
    const Inserted = await db.insert(userTable).values({
      id: userId,
      user_name: user.name,
      user_picture: user.picture,
      user_sub: user.sub,
    });
    if (Inserted.rowCount > 0) {
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/redirect?value=" + session.id,
        },
      });
    }
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      const { request, message, description } = e;
      return new Response(null, {
        status: 400,
      });
    }
    return new Response(null, {
      status: 500,
    });
  }
}
