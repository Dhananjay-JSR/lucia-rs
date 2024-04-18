import { Suspense } from "react";
import Urlhandler from "./AuthHandler";

export default function RedirectPage() {
  return (
    <>
      Redirecting...
      <Urlhandler />
    </>
  );
}
