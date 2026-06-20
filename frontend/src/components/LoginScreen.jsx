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
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    emailRef.current?.focus();

    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const getErrorMessage = (err) => {
    const detail = err?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    if (err?.response?.status === 401) {
      return "Wrong email or password. Please try again.";
    }

    return detail || "Something went wrong. Please try again.";
  };

  const validatePassword = () => {
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password)) return "Password must contain one uppercase letter.";
    if (!/[a-z]/.test(password)) return "Password must contain one lowercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return "Password must contain one special character.";
    }
    return "";
  };

  const submit = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (!email.trim() || !password.trim()) {
        setMessage("Email and password are required.");
        return;
      }

      if (!email.trim().endsWith("@gmail.com")) {
        setMessage("Please use a valid Gmail address.");
        return;
      }

      if (!isLogin) {
        const passwordError = validatePassword();

        if (passwordError) {
          setMessage(passwordError);
          return;
        }

        await API.post("/register", {
          email: email.trim(),
          password,
        });
      }

      const response = await API.post("/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.access_token);

      if (remember) {
        localStorage.setItem("remember_email", email.trim());
      } else {
        localStorage.removeItem("remember_email");
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setMessage(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    window.location.href = "http://127.0.0.1:8000/auth/google/login";
  };

  const showHelp = () => {
    setMessage(
      isLogin
        ? "Use your registered Gmail and password to login."
        : "Password must contain 6 characters, uppercase, lowercase, number and special character. Example: NeuroFlow@123"
    );
  };

  return (
    <div className="h-screen overflow-hidden bg-[#070713] text-white">
      <div className="relative flex h-full items-center justify-center px-6">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-purple-700/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-pink-600/25 blur-3xl" />
          <div className="absolute left-1/3 top-1/4 h-80 w-80 rounded-full border border-pink-500/20" />
          <div className="absolute bottom-0 left-0 h-48 w-full bg-[radial-gradient(circle_at_bottom,#ec489955,transparent_60%)]" />
        </div>

        <div className="relative grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div className="hidden overflow-hidden px-6 text-center lg:block">
            <div className="relative mx-auto">
              <img
                src="/robot.png"
                alt="AI Robot"
                className="mx-auto h-97.5 w-97.5 object-contain drop-shadow-[0_0_45px_rgba(236,72,153,0.45)]"
              />

              <div className="absolute right-8 top-16 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-xl">
                Hi! Welcome to your AI Hub.
              </div>
            </div>

            <h1 className="mt-4 text-5xl font-extrabold">
              Welcome{" "}
              <span className="bg-linear-to-r from-pink-400 to-fuchsia-500 bg-clip-text text-transparent">
                Back
              </span>
            </h1>

            <p className="mt-4 text-lg text-slate-300">
              Login to continue your AI research journey
            </p>
          </div>

          <div className="mx-auto w-full max-w-xl rounded-[36px] border border-pink-500/30 bg-[#0d0d1f]/80 p-7 shadow-2xl backdrop-blur-2xl md:p-10">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-pink-500 to-purple-700 text-3xl shadow-lg">
                ✨
              </div>

              <h2 className="text-4xl font-extrabold">
                NeuroFlow{" "}
                <span className="bg-linear-to-r from-pink-400 to-fuchsia-500 bg-clip-text text-transparent">
                  AI
                </span>
              </h2>

              <p className="mt-2 text-slate-400">
                Your Personal AI Research Assistant
              </p>
            </div>

            <div className="mb-6 text-center">
              <h3 className="text-3xl font-bold">
                {isLogin ? "Login to your account" : "Create your account"}
              </h3>

              <p className="mt-2 text-slate-400">
                {isLogin
                  ? "Enter your credentials to access your workspace"
                  : "Start your intelligent research journey"}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label
  htmlFor="email"
  className="mb-2 block text-sm text-slate-300"
>
  Email Address
</label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 focus-within:border-pink-500/60">
                  <input
  ref={emailRef}
  id="email"
  name="email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") passwordRef.current?.focus();
  }}
  placeholder="youremail@gmail.com"
  autoComplete="email"
  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
/>
                </div>
              </div>

              <div>
                <label
  htmlFor="password"
  className="mb-2 block text-sm text-slate-300"
>
  Password
</label>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 focus-within:border-pink-500/60">
                  <input
  ref={passwordRef}
  id="password"
  name="password"
  value={password}
  type={showPassword ? "text" : "password"}
  onChange={(e) => setPassword(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") submit();
  }}
  placeholder="Enter password"
  autoComplete={isLogin ? "current-password" : "new-password"}
  className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
/>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 px-4 py-3 text-xs text-pink-100">
                  Password must have 6 characters, uppercase, lowercase,
                  number and special character.
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <label
  htmlFor="remember"
  className="flex items-center gap-2 text-slate-300"
>
                  <input
  id="remember"
  name="remember"
  type="checkbox"
  checked={remember}
  onChange={(e) => setRemember(e.target.checked)}
  className="h-4 w-4 accent-pink-500"
/>
                  Remember me
                </label>

                <button
                  type="button"
                  onClick={showHelp}
                  className="text-pink-400 hover:text-pink-300"
                >
                  Need Help?
                </button>
              </div>

              <button
                onClick={submit}
                disabled={loading}
                className="w-full rounded-2xl bg-linear-to-r from-pink-600 via-fuchsia-600 to-pink-500 py-4 text-lg font-bold text-white shadow-[0_0_30px_rgba(236,72,153,0.35)] transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Login →"
                  : "Create Account →"}
              </button>
            </div>

            {message && (
              <div className="mt-4 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm text-pink-100">
                {message}
              </div>
            )}

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-sm text-slate-400">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex justify-center">
             <button
                onClick={loginWithGoogle}
                className="flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4"
              >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-slate-900">
                G
              </span>

              <span>Continue with Google</span>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-slate-400">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage("");
                  setPassword("");
                }}
                className="font-semibold text-pink-400 hover:text-pink-300"
              >
                {isLogin ? "Sign up" : "Login"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}