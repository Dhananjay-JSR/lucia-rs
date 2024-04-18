import { lucia } from "@/src/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return redirect("/login/google");
  }
  const result = await lucia.validateSession(sessionId);
  if (result.session) {
    await lucia.invalidateSession(result.session.id);
    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes
    );
    return redirect("/redirect");
  } else {
    return redirect("/login/google");
  }
}
