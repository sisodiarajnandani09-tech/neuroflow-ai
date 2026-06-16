"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

export default function SettingsPage() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("Settings ready.");

  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const savedNotify = localStorage.getItem("notifications");

    setDarkMode(savedTheme === "dark");
    setNotifications(savedNotify !== "off");
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);

    localStorage.setItem("theme", next ? "dark" : "light");

    setMessage(
      next
        ? "Dark mode enabled successfully."
        : "Light mode enabled successfully."
    );
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);

    localStorage.setItem("notifications", next ? "on" : "off");

    setMessage(
      next
        ? "Notifications enabled."
        : "Notifications disabled."
    );
  };

  const changePassword = async () => {
    try {
      if (!oldPassword || !newPassword) {
        setMessage("Both old and new password are required.");
        return;
      }

      await API.post("/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setShowPasswordBox(false);
      setMessage("Password changed successfully.");
    } catch (err) {
      console.error(err);

      const detail = err?.response?.data?.detail;
      setMessage(detail || "Password change failed.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        darkMode
          ? "bg-[#07111f] text-white"
          : "bg-linear-to-br from-cyan-100 via-white to-pink-100 text-slate-900"
      }`}
    >
      <div
        className={`mx-auto flex min-h-[86vh] max-w-6xl overflow-hidden rounded-[34px] shadow-2xl ${
          darkMode
            ? "bg-[#0f172a]"
            : "bg-white/70 backdrop-blur-xl"
        }`}
      >
        <aside
          className={`w-64 border-r p-6 ${
            darkMode
              ? "border-white/10 bg-[#111827]"
              : "border-white/60 bg-white/70"
          }`}
        >
          <img
            src="/logo.png"
            alt="NeuroFlow AI"
            className="mb-8 w-36 rounded-2xl"
          />

          <button
            onClick={() => router.push("/dashboard")}
            className="mb-4 w-full rounded-2xl bg-linear-to-r from-pink-500 to-purple-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg"
          >
            ← Back to Chat
          </button>

          <button
            onClick={logout}
            className="w-full rounded-2xl bg-red-100 px-4 py-3 text-left text-sm font-semibold text-red-700"
          >
            🚪 Logout
          </button>
        </aside>

        <main className="flex-1 p-8">
          <h1 className="mb-2 text-4xl font-bold">
            Settings
          </h1>

          <p className="mb-8 text-sm opacity-70">
            Manage appearance, notifications, security and app information.
          </p>

          <div className="grid grid-cols-2 gap-6">
            <SettingCard
              icon="🔔"
              title="Notifications"
              desc={
                notifications
                  ? "Notifications are currently enabled."
                  : "Notifications are currently disabled."
              }
              button={notifications ? "Disable" : "Enable"}
              onClick={toggleNotifications}
              darkMode={darkMode}
            />

            <SettingCard
              icon={darkMode ? "🌙" : "☀️"}
              title="Appearance"
              desc={
                darkMode
                  ? "Dark mode is active."
                  : "Light theme is active."
              }
              button={darkMode ? "Switch Light" : "Switch Dark"}
              onClick={toggleDarkMode}
              darkMode={darkMode}
            />

            <SettingCard
              icon="🔒"
              title="Security"
              desc="Change your account password securely."
              button="Change Password"
              onClick={() => setShowPasswordBox(!showPasswordBox)}
              darkMode={darkMode}
            />

            <SettingCard
              icon="ℹ️"
              title="App Info"
              desc="NeuroFlow AI uses FastAPI, Next.js, SQLite, Gemini, Groq, Ollama and Tavily."
              button="View"
              onClick={() =>
                setMessage(
                  "NeuroFlow AI is a Multi-Agent Autonomous Research Assistant with chat, PDF analysis, voice input and report export."
                )
              }
              darkMode={darkMode}
            />
          </div>

          {showPasswordBox && (
            <div
              className={`mt-6 rounded-3xl p-6 shadow-lg ${
                darkMode ? "bg-[#1f2937]" : "bg-white/80"
              }`}
            >
              <h2 className="mb-4 text-xl font-bold">
                Change Password
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Old password"
                  className="rounded-2xl bg-white px-4 py-3 text-black outline-none"
                />

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="rounded-2xl bg-white px-4 py-3 text-black outline-none"
                />
              </div>

              <button
                onClick={changePassword}
                className="mt-4 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-6 py-3 font-semibold text-white"
              >
                Update Password
              </button>
            </div>
          )}

          <div
            className={`mt-6 rounded-3xl p-5 text-sm shadow-inner ${
              darkMode
                ? "bg-[#1f2937] text-blue-100"
                : "bg-white/80 text-slate-700"
            }`}
          >
            {message}
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingCard({
  icon,
  title,
  desc,
  button,
  onClick,
  darkMode,
}) {
  return (
    <div
      className={`rounded-3xl p-6 shadow-lg ${
        darkMode ? "bg-[#1f2937]" : "bg-white/80"
      }`}
    >
      <div className="mb-4 text-3xl">{icon}</div>

      <h2 className="mb-2 text-xl font-bold">
        {title}
      </h2>

      <p className="mb-5 text-sm opacity-70">
        {desc}
      </p>

      <button
        onClick={onClick}
        className="rounded-full bg-linear-to-r from-pink-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white"
      >
        {button}
      </button>
    </div>
  );
}