"use client";

import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

export default function HistoryPage({ theme = "dark", accent = "pink" }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [pinned, setPinned] = useState([]);

  const isDark = theme === "dark";

  const accentMap = {
    purple: "from-purple-600 to-fuchsia-600",
    pink: "from-pink-600 to-rose-600",
    blue: "from-blue-500 to-indigo-600",
    cyan: "from-cyan-500 to-blue-500",
    green: "from-green-500 to-emerald-600",
    orange: "from-orange-500 to-pink-600",
  };

  const accentButton = accentMap[accent] || accentMap.pink;

  useEffect(() => {
    loadHistory();

    const savedPinned = localStorage.getItem("pinned_history");

    if (savedPinned) {
      try {
        setPinned(JSON.parse(savedPinned));
      } catch {
        setPinned([]);
      }
    }
  }, []);

  const loadHistory = async () => {
    try {
      const response = await API.get("/history");
      const backendHistory = response.data || [];

      const fullChats = JSON.parse(
        localStorage.getItem("neuroflow_full_chats") || "[]"
      );

      const formattedFullChats = fullChats.map((chat, index) => ({
        id: `local-chat-${chat.id || index}`,
        originalId: chat.id,
        source: "local-chat",
        topic: chat.title || "Full Chat",
        report: (chat.messages || [])
          .map(
            (msg) =>
              `${msg.role === "user" ? "USER" : "NEUROFLOW AI"}:\n${
                msg.content
              }`
          )
          .join("\n\n-------------------------\n\n"),
        messages: chat.messages || [],
      }));

      const formattedBackendHistory = backendHistory.map((item, index) => ({
        ...item,
        id: `backend-${item.id || index}`,
        originalId: item.id,
        source: "backend",
      }));

      setHistory([...formattedFullChats, ...formattedBackendHistory]);
    } catch (error) {
      console.error("History load failed:", error);
    }
  };

  const togglePin = (id) => {
    let updated;

    if (pinned.includes(id)) {
      updated = pinned.filter((item) => item !== id);
    } else {
      updated = [...pinned, id];
    }

    setPinned(updated);
    localStorage.setItem("pinned_history", JSON.stringify(updated));
  };

  const deleteHistory = async (item) => {
    const confirmDelete = confirm("Delete this history item?");
    if (!confirmDelete) return;

    try {
      if (item.source === "local-chat") {
        const fullChats = JSON.parse(
          localStorage.getItem("neuroflow_full_chats") || "[]"
        );

        const updatedChats = fullChats.filter(
          (chat) => chat.id !== item.originalId
        );

        localStorage.setItem(
          "neuroflow_full_chats",
          JSON.stringify(updatedChats)
        );

        setHistory((prev) => prev.filter((h) => h.id !== item.id));
        return;
      }

      await API.delete(`/history/${item.originalId}`);
      setHistory((prev) => prev.filter((h) => h.id !== item.id));
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  const downloadFile = async (item, type) => {
    const endpoint = type === "pdf" ? "/download-pdf" : "/download-docx";

    const content = `
TOPIC:
${item.topic}

REPORT:
${item.report}
`;

    try {
      const response = await API.post(
        endpoint,
        { report: content },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      const safeName = (item.topic || "history")
        .replace(/[\\/:*?"<>|]/g, "_")
        .slice(0, 60);

      link.href = url;
      link.download =
        type === "pdf" ? `${safeName}.pdf` : `${safeName}.docx`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Download failed.");
    }
  };

  const filteredHistory = useMemo(() => {
    const unique = [];

    const seen = new Set();

    for (const item of history) {
      const key = `${item.source}-${item.originalId || item.id}`;

      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique
      .filter((item) =>
        (item.topic || "").toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        const aPinned = pinned.includes(a.id);
        const bPinned = pinned.includes(b.id);
        return Number(bPinned) - Number(aPinned);
      });
  }, [history, search, pinned]);

  return (
    <div
      className={
        isDark ? "min-h-screen text-white" : "min-h-screen text-slate-950"
      }
    >
      <div className="mb-7">
        <h2 className="text-3xl font-bold">📚 Research History</h2>

        <p className={isDark ? "mt-1 text-slate-400" : "mt-1 text-slate-600"}>
          View, pin, delete and download your saved research and full chats.
        </p>
      </div>

      <div
        className={`mb-6 rounded-3xl border p-5 shadow-sm ${
          isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
        }`}
      >
        <input
  id="history-search"
  name="history-search"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder="Search history..."
  autoComplete="off"
  className={`w-full rounded-2xl border px-5 py-4 text-sm outline-none ${
    isDark
      ? "border-white/10 bg-[#111124] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
  }`}
/>
      </div>

      {filteredHistory.length === 0 ? (
        <div
          className={`rounded-3xl border p-8 text-center shadow-sm ${
            isDark
              ? "border-white/10 bg-white/5 text-slate-400"
              : "border-slate-200 bg-white text-slate-600"
          }`}
        >
          No history found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredHistory.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className={`rounded-3xl border p-6 shadow-xl ${
                isDark
                  ? "border-white/10 bg-white/5 text-white"
                  : "border-slate-200 bg-white text-slate-950"
              }`}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">
                    {pinned.includes(item.id) ? "📌 " : "🧠 "}
                    {item.topic || "Untitled Research"}
                  </h3>

                  <p
                    className={
                      isDark
                        ? "mt-1 text-xs text-slate-400"
                        : "mt-1 text-xs text-slate-500"
                    }
                  >
                    {item.source === "local-chat" ? "Full Chat" : "Research"} •
                    ID: {item.originalId || item.id}
                  </p>
                </div>

                <button
                  onClick={() => togglePin(item.id)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                    pinned.includes(item.id)
                      ? `bg-linear-to-r ${accentButton} text-white`
                      : isDark
                      ? "bg-white/10 text-slate-200 hover:bg-white/15"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {pinned.includes(item.id) ? "Unpin" : "Pin"}
                </button>
              </div>

              <p
                className={`line-clamp-6 whitespace-pre-wrap text-sm leading-7 ${
                  isDark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                {item.report || "No report available."}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => downloadFile(item, "pdf")}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  PDF
                </button>

                <button
                  onClick={() => downloadFile(item, "docx")}
                  className={`rounded-xl bg-linear-to-r ${accentButton} px-4 py-2 text-sm font-semibold text-white`}
                >
                  DOCX
                </button>

                <button
                  onClick={() => deleteHistory(item)}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}