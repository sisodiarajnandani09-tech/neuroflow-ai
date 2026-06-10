"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

export default function LoginScreen() {
  const router = useRouter();

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const submit = async () => {
    try {
      setLoading(true);
      setError("");

      if (!email.trim() || !password.trim()) {
        setError("Email and password required");
        return;
      }

      if (isLogin) {
        const response = await API.post("/login", {
          email: email.trim(),
          password,
        });

        localStorage.setItem("token", response.data.access_token);
        router.push("/dashboard");
      } else {
        await API.post("/register", {
          email: email.trim(),
          password,
        });

        setIsLogin(true);
        setPassword("");
        setError("Account created. Please login.");
        passwordRef.current?.focus();
      }
    } catch (err) {
      console.error(err);
      setError(isLogin ? "Login failed" : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center text-white">
      <div className="absolute inset-0 bg-[#3b1f1b]/70"></div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-8 py-7 text-xs font-bold uppercase tracking-wide">
          <div className="flex items-center gap-4">
            <span className="text-3xl">☰</span>
            <span>NeuroFlow AI</span>
          </div>

          <div className="hidden gap-8 md:flex">
            <span>AI Research</span>
            <span>PDF Analysis</span>
            <span>Voice Search</span>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-5">
          <div className="w-full max-w-md text-center">
            <img src="/logo.png"
                  alt="NeuroFlow AI Logo"
                 className="w-60 h-auto mx-auto mb-6"
/>

            <div className="space-y-4">
              <input
                ref={emailRef}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    passwordRef.current?.focus();
                  }
                }}
                placeholder="Email..."
                className="w-full rounded-full bg-white/20 px-7 py-5 text-white placeholder:text-white/80 outline-none backdrop-blur-md"
              />

              <input
                ref={passwordRef}
                value={password}
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    submit();
                  }
                }}
                placeholder="Password..."
                className="w-full rounded-full bg-white/20 px-7 py-5 text-white placeholder:text-white/80 outline-none backdrop-blur-md"
              />

              <button
                onClick={submit}
                disabled={loading}
                className="mt-5 w-full rounded-full bg-[#f06a3d] py-5 text-lg font-semibold text-white shadow-xl transition hover:bg-[#ff7a4f] disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login"
                  : "Create Account"}
              </button>
            </div>

            {error && (
              <p className="mt-5 text-sm font-semibold text-white">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-between px-2 text-xs font-bold uppercase">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setPassword("");
                }}
              >
                {isLogin ? "Create Account" : "Back to Login"}
              </button>

              <button
                onClick={() =>
                  setError("Use your registered email and password")
                }
              >
                Need Help?
              </button>
            </div>
          </div>
        </main>

        <footer className="relative z-10 flex justify-between px-8 py-7 text-xs font-bold uppercase">
          <div className="flex gap-6">
            <span>Research</span>
            <span>PDF Upload</span>
            <span>History</span>
          </div>

          <span className="hidden md:block">Made with NeuroFlow AI</span>
        </footer>
      </div>
    </div>
  );
}