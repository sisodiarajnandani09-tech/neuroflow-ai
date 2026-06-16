"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function OAuthSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      Logging in with Google...
    </div>
  );
}