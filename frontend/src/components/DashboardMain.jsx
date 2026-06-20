"use client";

import { useEffect, useState } from "react";

import DashboardSidebar from "./DashboardSidebar";
import DashboardHome from "./DashboardHome";
import AgentBuilder from "./AgentBuilder";
import AgentMarketplace from "./AgentMarketplace";
import SmartTemplates from "./SmartTemplates";
import Recommendations from "./Recommendations";
import SettingsPage from "./SettingsPage";
import HistoryPage from "./HistoryPage";
import ChatPage from "./ChatPage";

export default function DashboardMain() {
  const [activePage, setActivePage] = useState("dashboard");
  const [theme, setTheme] = useState("dark");
  const [accent, setAccent] = useState("pink");

  useEffect(() => {
    const loadSettings = () => {
      setTheme(localStorage.getItem("theme") || "dark");
      setAccent(localStorage.getItem("accent") || "pink");
    };

    loadSettings();

    window.addEventListener("settingsChanged", loadSettings);
    window.addEventListener("storage", loadSettings);

    return () => {
      window.removeEventListener("settingsChanged", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  const isDark = theme === "dark";

  return (
    <div className={isDark ? "dark" : ""}>
      <div
        className={`h-screen overflow-hidden ${
          isDark
            ? "bg-[#070713] text-white"
            : "bg-[#f6f7fb] text-slate-950"
        }`}
      >
        <div className="flex h-full">
          <DashboardSidebar
            activePage={activePage}
            setActivePage={setActivePage}
            theme={theme}
            accent={accent}
          />

          <main
            className={`relative flex-1 overflow-y-auto ${
              isDark ? "bg-[#09091a]" : "bg-[#f6f7fb]"
            }`}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className={`absolute right-20 top-10 h-96 w-96 rounded-full blur-3xl ${
                  isDark ? "bg-pink-600/20" : "bg-pink-300/35"
                }`}
              />

              <div
                className={`absolute bottom-10 left-40 h-96 w-96 rounded-full blur-3xl ${
                  isDark ? "bg-purple-700/20" : "bg-purple-300/30"
                }`}
              />
            </div>

            <div className="relative p-8">
              {activePage === "dashboard" && (
                <DashboardHome theme={theme} accent={accent} />
              )}

              {activePage === "builder" && (
                <AgentBuilder theme={theme} accent={accent} />
              )}

              {activePage === "marketplace" && (
                <AgentMarketplace theme={theme} accent={accent} />
              )}

              {activePage === "templates" && (
                <SmartTemplates theme={theme} accent={accent} />
              )}

              {activePage === "recommendations" && (
                <Recommendations theme={theme} accent={accent} />
              )}

              {activePage === "settings" && (
                <SettingsPage theme={theme} accent={accent} />
              )}

              {activePage === "history" && (
                <HistoryPage theme={theme} accent={accent} />
              )}

              {activePage === "chat" && (
  <ChatPage theme={theme} accent={accent} />
)}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}