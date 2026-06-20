"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      router.push("/dashboard");
    } else {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09091a] text-white">
      Logging in with Google...
    </div>
  );
}