"use client";
import { lucia } from "@/src/auth";
import { AUTH_IDENTIFIER } from "@/src/constant";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Urlhandler() {
  const searchParams = useSearchParams();
  const Auth_Value = searchParams.get("value");
  const router = useRouter();

  useEffect(() => {
    if (Auth_Value == null) {
      localStorage.removeItem(AUTH_IDENTIFIER);
      router.push("/");
    } else {
      localStorage.setItem(AUTH_IDENTIFIER, Auth_Value);
      router.push("/");
    }
  }, []);
  return <></>;
}
