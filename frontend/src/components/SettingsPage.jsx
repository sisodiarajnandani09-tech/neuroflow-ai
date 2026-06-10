"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

export default function SettingsPage() {
  const router = useRouter();

  const [message, setMessage] = useState(
    "Select any setting option to view details."
  );
  const [latestReport, setLatestReport] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [appearance, setAppearance] = useState("Soft Light");

  useEffect(() => {
    loadLatestReport();
  }, []);

  const loadLatestReport = async () => {
    try {
      const response = await API.get("/history");

      if (response.data.length > 0) {
        setLatestReport(response.data[0].report || "");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not load latest report.");
    }
  };

  const downloadFile = async (type) => {
    if (!latestReport) {
      setMessage("No report available to download.");
      return;
    }

    const endpoint = type === "pdf" ? "/download-pdf" : "/download-docx";

    try {
      const response = await API.post(
        endpoint,
        { report: latestReport },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download =
        type === "pdf"
          ? "neuroflow-report.pdf"
          : "neuroflow-report.docx";

      document.body.appendChild(link);
      link.click();
      link.remove();

      setMessage(`${type.toUpperCase()} downloaded successfully.`);
    } catch (error) {
      console.error(error);
      setMessage("Download failed. Please check backend.");
    }
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);

    setMessage(
      next
        ? "Notifications are enabled for research completion alerts."
        : "Notifications are disabled."
    );
  };

  const changeAppearance = () => {
    const next =
      appearance === "Soft Light"
        ? "Pastel Dashboard"
        : "Soft Light";

    setAppearance(next);
    setMessage(`Appearance changed to ${next}.`);
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#dfe5e8] p-8 text-[#102033]">
      <div className="mx-auto grid min-h-[86vh] max-w-7xl grid-cols-[260px_1fr] overflow-hidden rounded-[34px] bg-white shadow-2xl">

        <aside className="bg-[#fbfff8] p-8">
          <img
            src="/logo.png"
            alt="NeuroFlow AI"
            className="mb-10 w-40 rounded-2xl"
          />

          <button
            onClick={() => router.push("/dashboard")}
            className="mb-6 w-full rounded-full bg-linear-to-r from-pink-500 to-orange-500 py-3 font-semibold text-white shadow-lg"
          >
            ← Back to Chat
          </button>

          <div className="space-y-4 text-sm">
            <button
              onClick={() => router.push("/dashboard")}
              className="block w-full rounded-xl px-4 py-3 text-left hover:bg-gray-100"
            >
              💬 Chat Helper
            </button>

            <button
              onClick={() =>
                setMessage("Settings page is active.")
              }
              className="block w-full rounded-xl bg-gray-100 px-4 py-3 text-left font-semibold"
            >
              ⚙️ Settings
            </button>

            <button
              onClick={logout}
              className="block w-full rounded-xl px-4 py-3 text-left hover:bg-gray-100"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        <main className="bg-linear-to-br from-cyan-200 via-yellow-100 to-pink-200 p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold">
                Settings
              </h1>

              <p className="mt-2 text-sm text-gray-600">
                Manage downloads, appearance, privacy and app information.
              </p>
            </div>

            <div className="rounded-full bg-white/70 px-5 py-2 text-sm shadow-sm">
              NeuroFlow AI
            </div>
          </div>

          <div className="grid grid-cols-[1.2fr_0.8fr] gap-6">
            <section className="rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
              <div
                onClick={() =>
                  setMessage("Profile: Rajnandani | NeuroFlow AI user.")
                }
                className="mb-6 flex cursor-pointer items-center justify-between rounded-3xl bg-white p-5 shadow-sm hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-cyan-400 to-purple-500 text-3xl text-white">
                    👤
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      View profile
                    </h2>
                    <p className="text-sm text-blue-600">
                      @neuroflowuser
                    </p>
                  </div>
                </div>

                <span className="text-3xl text-gray-400">›</span>
              </div>

              <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
                App settings
              </p>

              <div className="grid gap-4">
                <SettingCard
                  icon="📄"
                  title="Download Latest PDF"
                  subtitle="Download your latest generated research report as PDF."
                  action="Download"
                  onClick={() => downloadFile("pdf")}
                />

                <SettingCard
                  icon="📝"
                  title="Download Latest DOCX"
                  subtitle="Download your latest generated research report as Word document."
                  action="Download"
                  onClick={() => downloadFile("docx")}
                />

                <SettingCard
                  icon="🔔"
                  title="Notifications"
                  subtitle={
                    notifications
                      ? "Research completion notifications are enabled."
                      : "Notifications are disabled."
                  }
                  action={notifications ? "Disable" : "Enable"}
                  onClick={toggleNotifications}
                />

                <SettingCard
                  icon="☀️"
                  title="App appearance"
                  subtitle={`Current theme: ${appearance}`}
                  action="Switch"
                  onClick={changeAppearance}
                />

                <SettingCard
                  icon="🔒"
                  title="Data & privacy"
                  subtitle="Your history is stored user-wise and protected using JWT authentication."
                  action="View"
                  onClick={() =>
                    setMessage(
                      "Privacy: user data is isolated by email, secured through JWT auth, and stored in backend JSON files."
                    )
                  }
                />

                <SettingCard
                  icon="ℹ️"
                  title="App info"
                  subtitle="FastAPI, Next.js, Groq, Gemini, Ollama, Tavily and multi-agent workflow."
                  action="View"
                  onClick={() =>
                    setMessage(
                      "NeuroFlow AI is a Multi-Agent Autonomous Research Assistant with chat, PDF upload, voice input, history and report export."
                    )
                  }
                />
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <div className="rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
                <h2 className="mb-4 text-2xl font-serif font-bold">
                  Status
                </h2>

                <div className="space-y-4 text-sm">
                  <StatusItem label="Latest Report" value={latestReport ? "Available" : "Not available"} />
                  <StatusItem label="Notifications" value={notifications ? "Enabled" : "Disabled"} />
                  <StatusItem label="Theme" value={appearance} />
                  <StatusItem label="Account" value="Logged in" />
                </div>
              </div>

              <div className="flex-1 rounded-3xl bg-white/70 p-6 shadow-xl backdrop-blur">
                <h2 className="mb-4 text-2xl font-serif font-bold">
                  Details
                </h2>

                <div className="min-h-55 rounded-2xl bg-linear-to-br from-white to-blue-50 p-5 text-sm leading-7 text-gray-700 shadow-inner">
                  {message}
                </div>
              </div>

              <button
                onClick={logout}
                className="rounded-full bg-linear-to-r from-red-500 to-orange-500 py-4 font-semibold text-white shadow-lg"
              >
                Logout
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingCard({
  icon,
  title,
  subtitle,
  action,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-between rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-cyan-100 to-purple-100 text-2xl">
          {icon}
        </div>

        <div>
          <h3 className="font-bold">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {subtitle}
          </p>
        </div>
      </div>

      <span className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
        {action}
      </span>
    </button>
  );
}

function StatusItem({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <span className="text-gray-600">
        {label}
      </span>

      <span className="font-semibold text-blue-600">
        {value}
      </span>
    </div>
  );
}