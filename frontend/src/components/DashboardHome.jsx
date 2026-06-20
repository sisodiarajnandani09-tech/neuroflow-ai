"use client";

import { useEffect, useRef, useState } from "react";
import API from "../services/api";

export default function DashboardHome({ theme = "dark", accent = "pink" }) {
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

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

  const [query, setQuery] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [greeting, setGreeting] = useState("Hello 👋 What's on your mind?");

  const [stats, setStats] = useState({
    total_research: 0,
    documents: 0,
    agents_created: 0,
    hours_saved: 0,
    recent_activity: [],
  });

  useEffect(() => {
    loadDashboard();

    if (typeof window !== "undefined") {
      setGreeting(
        localStorage.getItem("ai_greeting") ||
          "Hello 👋 What's on your mind?"
      );
    }
  }, []);

  const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    if (typeof detail === "object" && detail !== null) {
      return JSON.stringify(detail);
    }

    return detail || "Backend error. Please check FastAPI terminal.";
  };

  const loadDashboard = async () => {
    try {
      const res = await API.get("/dashboard-stats");
      setStats(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const selectFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      "pdf",
      "docx",
      "txt",
      "csv",
      "xlsx",
      "xls",
      "pptx",
      "png",
      "jpg",
      "jpeg",
      "json",
    ];

    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      alert(
        "Only PDF, DOCX, TXT, CSV, XLSX, PPTX, PNG, JPG, JPEG, JSON files allowed."
      );
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const sendQuery = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setAnswer("");

      let response;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await API.post("/upload-file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        response = await API.post("/ask-document", {
          document_id: uploadRes.data.document_id,
          question: query.trim(),
        });
      } else {
        response = await API.post("/research", {
          topic: query.trim(),
        });
      }

      setAnswer(response.data.answer || response.data.report || "No response.");
      setQuery("");
      setSelectedFile(null);

      if (fileInputRef.current) fileInputRef.current.value = "";

      loadDashboard();
    } catch (error) {
      console.error(error);
      setAnswer(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (micMuted) {
      alert("Mic is muted. Unmute first.");
      return;
    }

    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome browser for voice input.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognitionRef.current = recognition;
    recognition.start();

    recognition.onresult = (event) => {
      setQuery(event.results[0][0].transcript);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognition.onerror = () => {
      recognitionRef.current = null;
    };
  };

  const toggleMute = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setMicMuted((prev) => !prev);
  };

  return (
    <div className={isDark ? "text-white" : "text-slate-950"}>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">{greeting}</h2>

          <p
            className={`mt-1 ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Search, upload file, or use voice input.
          </p>
        </div>

        <img
          src="/robot.png"
          alt="Robot"
          className="h-32 w-32 object-contain"
        />
      </div>

      <div
        className={`mb-8 rounded-3xl border p-5 shadow-sm ${
          isDark
            ? "border-white/10 bg-white/5"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex gap-3">
          <input
  id="dashboard-query"
  name="dashboard-query"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") sendQuery();
  }}
  placeholder="Ask anything or upload a document..."
  className={`flex-1 rounded-2xl border px-5 py-4 text-sm outline-none ${
    isDark
      ? "border-white/10 bg-[#111124] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
  }`}
/>

          <input
  id="file-upload"
  name="file-upload"
  ref={fileInputRef}
  type="file"
  accept=".pdf,.docx,.txt,.csv,.xlsx,.xls,.pptx,.png,.jpg,.jpeg,.json"
  onChange={selectFile}
  className="hidden"
/>

          <IconButton
            isDark={isDark}
            onClick={() => fileInputRef.current?.click()}
            title="Upload file"
          >
            📎
          </IconButton>

          <IconButton
            isDark={isDark}
            onClick={startVoiceInput}
            disabled={micMuted}
            title="Voice input"
          >
            🎙️
          </IconButton>

          <button
            onClick={toggleMute}
            className={`rounded-2xl px-5 text-xl ${
              micMuted
                ? "bg-red-600 text-white"
                : isDark
                ? "bg-white/10 text-white hover:bg-white/15"
                : "bg-slate-100 text-slate-800 hover:bg-slate-200"
            }`}
            title={micMuted ? "Unmute mic" : "Mute mic"}
          >
            {micMuted ? "🔇" : "🔊"}
          </button>

          <button
            onClick={sendQuery}
            disabled={loading}
            className={`rounded-2xl bg-linear-to-r ${accentButton} px-6 font-bold text-white disabled:opacity-50`}
          >
            {loading ? "..." : "➤"}
          </button>
        </div>

        {selectedFile && (
          <div
            className={`mt-4 flex items-center justify-between rounded-2xl px-4 py-3 text-sm ${
              isDark
                ? "bg-white/10 text-white"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            <span>📄 Selected: {selectedFile.name}</span>

            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="text-red-400"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      {answer && (
        <div
          className={`mb-8 rounded-3xl border p-6 shadow-sm ${
            isDark
              ? "border-white/10 bg-white/5"
              : "border-slate-200 bg-white"
          }`}
        >
          <h3
            className={`mb-3 font-bold ${
              isDark ? "text-pink-300" : "text-pink-600"
            }`}
          >
            NeuroFlow Response
          </h3>

          <pre
            className={`whitespace-pre-wrap text-sm leading-7 ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {answer}
          </pre>
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        <Stat isDark={isDark} title="Total Research" value={stats.total_research} />
        <Stat isDark={isDark} title="Documents" value={stats.documents} />
        <Stat isDark={isDark} title="Agents Created" value={stats.agents_created} />
        <Stat isDark={isDark} title="Hours Saved" value={`${stats.hours_saved}h`} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <Card isDark={isDark} title="Recent Activity">
          {stats.recent_activity?.length ? (
            stats.recent_activity.map((item, i) => (
              <p key={i}>🧠 {item.title}</p>
            ))
          ) : (
            <p>No activity yet.</p>
          )}
        </Card>

        <Card isDark={isDark} title="Quick Actions">
          <p>➕ Create New Research</p>
          <p>📤 Upload Document</p>
          <p>🤖 Build New Agent</p>
          <p>📚 Explore Templates</p>
        </Card>
      </div>
    </div>
  );
}

function IconButton({ children, isDark, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded-2xl px-5 text-xl disabled:opacity-40 ${
        isDark
          ? "bg-white/10 text-white hover:bg-white/15"
          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({ title, value, isDark }) {
  return (
    <div
      className={`rounded-3xl border p-5 shadow-sm ${
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`}
    >
      <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-500"}>
        {title}
      </p>

      <h3
        className={`mt-3 text-3xl font-bold ${
          isDark ? "text-white" : "text-slate-950"
        }`}
      >
        {value}
      </h3>

      <p className="mt-1 text-xs text-emerald-500">Updated live</p>
    </div>
  );
}

function Card({ title, children, isDark }) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm ${
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`}
    >
      <h3
        className={`mb-4 font-bold ${
          isDark ? "text-pink-300" : "text-pink-600"
        }`}
      >
        {title}
      </h3>

      <div
        className={`space-y-3 text-sm ${
          isDark ? "text-slate-300" : "text-slate-700"
        }`}
      >
        {children}
      </div>
    </div>
  );
}