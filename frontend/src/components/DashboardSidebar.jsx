"use client";

import { useRouter } from "next/navigation";

export default function DashboardSidebar({
  activePage,
  setActivePage,
  theme = "dark",
  accent = "pink",
}) {
  const router = useRouter();

  const isDark = theme === "dark";

  const menus = [
    ["dashboard", "🏠", "Dashboard"],
    ["builder", "🧠", "Agent Builder"],
    ["marketplace", "🛒", "Marketplace"],
    ["templates", "📄", "Templates"],
    ["recommendations", "✨", "Recommendations"],
    ["settings", "⚙️", "Settings"],
    ["history", "📚", "History"],
    ["chat", "💬", "Chat"],
  ];

  const accentMap = {
    purple: "from-purple-600 to-fuchsia-600",
    pink: "from-pink-600 to-rose-600",
    blue: "from-blue-500 to-indigo-600",
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-pink-600",
  };

  const accentButton = accentMap[accent] || accentMap.pink;

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <aside
      className={`flex w-72 flex-col border-r p-5 ${
        isDark
          ? "border-white/10 bg-[#0d0d1f]/95 text-white"
          : "border-slate-200 bg-white text-slate-950"
      }`}
    >
      <div className="mb-8 flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br ${accentButton} text-white shadow-lg`}
        >
          ✨
        </div>

        <div>
          <h1 className="text-lg font-bold">
            Neuro
            <span className={isDark ? "text-pink-400" : "text-pink-600"}>
              Flow AI
            </span>
          </h1>

          <p className={isDark ? "text-xs text-slate-400" : "text-xs text-slate-500"}>
            Agent Platform
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {menus.map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setActivePage(key)}
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition ${
              activePage === key
                ? `bg-linear-to-r ${accentButton} text-white shadow-lg`
                : isDark
                ? "text-slate-300 hover:bg-white/10"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setActivePage("builder")}
        className={`mt-8 rounded-2xl bg-linear-to-r ${accentButton} px-4 py-3 text-left font-semibold text-white shadow-lg`}
      >
        + Build New Agent
      </button>

      <button
        onClick={logout}
        className="mt-auto rounded-2xl bg-linear-to-r from-red-500 to-pink-600 px-4 py-3 text-left font-semibold text-white shadow-lg"
      >
        Logout
      </button>
    </aside>
  );
}