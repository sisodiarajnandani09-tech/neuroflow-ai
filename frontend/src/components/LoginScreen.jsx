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
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();

    const savedTheme = localStorage.getItem("theme");
    setDarkMode(savedTheme === "dark");
  }, []);

  const passwordRules =
    "Password must be at least 8 characters and include uppercase, lowercase, number and special character. Example: NeuroFlow@123";

  const getErrorMessage = (err) => {
    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    if (typeof detail === "string") {
      if (detail.toLowerCase().includes("invalid")) {
        return "Invalid email or password.";
      }

      return detail;
    }

    return isLogin
      ? "Login failed. Please check email and password."
      : "Registration failed. Please follow password rules.";
  };

  const submit = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!email.trim() || !password.trim()) {
        setMessage("Email and password required.");
        return;
      }

      if (!email.trim().endsWith("@gmail.com")) {
        setMessage("Only Gmail accounts are allowed.");
        return;
      }

      if (!isLogin && !isStrongPassword(password)) {
        setMessage(passwordRules);
        return;
      }

      if (isLogin) {
        const response = await API.post("/login", {
          email: email.trim(),
          password,
        });

        localStorage.setItem(
          "token",
          response.data.access_token
        );

        router.push("/dashboard");
      } else {
        await API.post("/register", {
          email: email.trim(),
          password,
        });

        const loginResponse = await API.post("/login", {
          email: email.trim(),
          password,
        });

        localStorage.setItem(
          "token",
          loginResponse.data.access_token
        );

        router.push("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const isStrongPassword = (value) => {
    return (
      value.length >= 8 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /\d/.test(value) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(value)
    );
  };

  const showHelp = () => {
    setMessage(
      isLogin
        ? "Use your registered Gmail and password to login. If password is wrong, login will fail."
        : passwordRules
    );
  };

  const loginWithGmail = () => {
    window.location.href = "http://127.0.0.1:8000/auth/google/login";
  };

  return (
    <div
      className={`h-screen overflow-hidden bg-cover bg-center text-white ${
        darkMode
          ? "bg-[#07111f]"
          : "bg-[url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80')]"
      }`}
    >
      <div
        className={`flex h-full items-center justify-center px-5 ${
          darkMode
            ? "bg-[#07111f]"
            : "bg-[#3b1f1b]/70"
        }`}
      >
        <div
          className={`w-full max-w-md rounded-4xl p-8 text-center shadow-2xl backdrop-blur-md ${
            darkMode
              ? "bg-white/10 border border-white/10"
              : "bg-white/10"
          }`}
        >
          <img
            src="/logo.png"
            alt="NeuroFlow AI Logo"
            className="mx-auto mb-5 w-40"
          />

          <h1 className="mb-2 text-3xl font-bold">
            NeuroFlow AI
          </h1>

          <p className="mb-7 text-sm text-white/80">
            Multi-Agent Autonomous Research Assistant
          </p>

          <div className="space-y-4">
            <button
              onClick={loginWithGmail}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-semibold text-slate-800 shadow-lg hover:bg-slate-100"
            >
              <span className="text-lg">G</span>
              Continue with Gmail
            </button>

            <div className="flex items-center gap-3 text-xs text-white/70">
              <span className="h-px flex-1 bg-white/30"></span>
              <span>OR</span>
              <span className="h-px flex-1 bg-white/30"></span>
            </div>

            <input
              ref={emailRef}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  passwordRef.current?.focus();
                }
              }}
              placeholder="Gmail address"
              className="w-full rounded-full bg-white/25 px-6 py-4 text-white placeholder:text-white/80 outline-none backdrop-blur-md"
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
              placeholder="Password"
              className="w-full rounded-full bg-white/25 px-6 py-4 text-white placeholder:text-white/80 outline-none backdrop-blur-md"
            />

            {!isLogin && (
              <div className="rounded-2xl bg-black/20 px-4 py-3 text-left text-xs leading-5 text-white/90">
                <p className="font-bold">Password Rules:</p>
                <p>• Minimum 8 characters</p>
                <p>• One uppercase letter</p>
                <p>• One lowercase letter</p>
                <p>• One number</p>
                <p>• One special character</p>
              </div>
            )}

            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-full bg-[#f06a3d] py-4 text-base font-semibold text-white shadow-xl transition hover:bg-[#ff7a4f] disabled:opacity-60"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </div>

          {message && (
            <p className="mt-5 rounded-xl bg-black/25 px-4 py-3 text-sm font-semibold text-white">
              {message}
            </p>
          )}

          <div className="mt-6 flex items-center justify-between px-2">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setMessage("");
                setPassword("");
                setTimeout(() => {
                  emailRef.current?.focus();
                }, 50);
              }}
              className="text-xs font-bold uppercase tracking-wide text-white/90 hover:text-white"
            >
              {isLogin ? "Create Account" : "Back to Login"}
            </button>

            <button
              onClick={showHelp}
              className="text-xs font-bold uppercase tracking-wide text-white/80 hover:text-white"
            >
              Need Help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}