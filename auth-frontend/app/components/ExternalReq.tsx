"use client";

import { lucia } from "@/src/auth";
import { AUTH_IDENTIFIER } from "@/src/constant";
import { useEffect, useState } from "react";

export default function ExternalReq() {
  const [Auth_Token, setAuth_Token] = useState<null | string>(null);
  const [response, setResponse] = useState<null | string>(null);

  useEffect(() => {
    const Abort = new AbortController();
    const signal = Abort.signal;

    (async () => {
      try {
        const Auth_Token = localStorage.getItem(AUTH_IDENTIFIER);
        if (Auth_Token) {
          setAuth_Token(Auth_Token);
        }
      } catch (error) {}
    })();

    return () => {
      Abort.abort();
    };
  }, []);

  if (Auth_Token) {
    return (
      <>
        <button
          onClick={async () => {
            try {
              let Data = await fetch("http://localhost:5600", {
                headers: {
                  Authorization: `Bearer ${Auth_Token}`,
                },
              });
              let Res = await Data.text();
              setResponse(Res);
            } catch (e) {
              alert("Unauthorized 401");
            }
          }}
          className="bg-green-400 my-3 py-1 px-2 rounded-sm"
        >
          Send External Request
        </button>
        {response && (
          <div className="my-4">
            Here&apos;s Your Super Secret Data:
            <div className="bg-orange-600 w-fit text-white px-2">
              {response}
            </div>
          </div>
        )}
      </>
    );
  }

  return <div>Loading ...</div>;
}
