import Image from "next/image";
import ExternalReq from "./components/ExternalReq";
import { cookies } from "next/headers";
import { lucia } from "@/src/auth";

export default async function Home() {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
  if (!sessionId) {
    return <LoginPanel />;
  }
  const result = await lucia.validateSession(sessionId);
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}
  if (result.session && result.user) {
    return (
      <>
        <div>Welcome {result.user.name}</div>
        <div>
          {/*eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={result.user.picture}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full"
            alt="Profile Picture"
          />
        </div>
        <ExternalReq />
        <div>
          <fieldset>
            <a
              href="/logout"
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Logout ?
            </a>
          </fieldset>
        </div>
      </>
    );
  }
  return <LoginPanel />;
}

function LoginPanel() {
  return (
    <>
      <div>
        <div>You are not Logged In</div>
        <fieldset>
          <a
            href="/login/google"
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Login Here
          </a>
        </fieldset>
      </div>
    </>
  );
}
