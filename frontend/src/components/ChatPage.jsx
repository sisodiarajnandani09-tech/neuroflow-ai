"use client";

import { useEffect, useRef, useState } from "react";
import API from "../services/api";

export default function ChatPage({ theme = "dark", accent = "pink" }) {
  const chatEndRef = useRef(null);

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

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi, I am NeuroFlow AI. Ask me anything.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const saveFullChat = (updatedMessages, topic, backendId = null) => {
    const oldChats = JSON.parse(
      localStorage.getItem("neuroflow_full_chats") || "[]"
    );

    const chat = {
      id: backendId || crypto.randomUUID(),
      title: topic.slice(0, 40),
      topic,
      messages: updatedMessages,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(
      "neuroflow_full_chats",
      JSON.stringify([chat, ...oldChats])
    );
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();

    const userMsg = {
      role: "user",
      content: userText,
    };

    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setInput("");

    try {
      setLoading(true);

      const response = await API.post("/research", {
        topic: userText,
      });

      const aiText =
        response.data.report || response.data.answer || "No response.";

      const assistantMsg = {
        role: "assistant",
        content: aiText,
      };

      const finalMessages = [...updatedMessages, assistantMsg];

      setMessages(finalMessages);

      saveFullChat(
        finalMessages,
        userText,
        response.data.id || null
      );
    } catch (error) {
      const detail = error?.response?.data?.detail;

      const errorMsg = {
        role: "assistant",
        content: Array.isArray(detail)
          ? detail.map((i) => i.msg).join(", ")
          : detail || "Backend error. Please check FastAPI terminal.",
      };

      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const downloadChat = () => {
    const content = messages
      .map(
        (msg) =>
          `${msg.role === "user" ? "USER" : "NEUROFLOW AI"}:\n${msg.content}`
      )
      .join("\n\n-------------------------\n\n");

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "neuroflow-full-chat.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={isDark ? "min-h-screen text-white" : "min-h-screen text-slate-950"}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">💬 NeuroFlow Chat</h2>
          <p className={isDark ? "mt-1 text-slate-400" : "mt-1 text-slate-600"}>
            Complete chat will be saved in history.
          </p>
        </div>

        <button
          onClick={downloadChat}
          className={`rounded-xl bg-linear-to-r ${accentButton} px-5 py-3 text-sm font-bold text-white`}
        >
          Download Chat
        </button>
      </div>

      <div
        className={`flex h-[68vh] flex-col rounded-3xl border p-5 ${
          isDark
            ? "border-white/10 bg-white/5"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex-1 overflow-y-auto pr-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-5 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-3xl px-5 py-4 text-sm leading-7 ${
                  msg.role === "user"
                    ? `bg-linear-to-r ${accentButton} text-white`
                    : isDark
                    ? "bg-white/10 text-slate-100"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                <p className="mb-1 text-xs font-bold opacity-70">
                  {msg.role === "user" ? "You" : "NeuroFlow AI"}
                </p>

                <pre className="whitespace-pre-wrap font-sans">
                  {msg.content}
                </pre>
              </div>
            </div>
          ))}

          {loading && (
            <div
              className={`mb-5 max-w-[70%] rounded-3xl px-5 py-4 text-sm ${
                isDark ? "bg-white/10" : "bg-slate-100"
              }`}
            >
              NeuroFlow AI is thinking...
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        <div className="mt-4 flex gap-3">
          <input
  id="chat-message"
  name="chat-message"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") sendMessage();
  }}
  placeholder="Ask anything..."
  autoComplete="off"
  className={`flex-1 rounded-2xl border px-5 py-4 outline-none ${
    isDark
      ? "border-white/10 bg-[#111124] text-white"
      : "border-slate-200 bg-slate-50 text-slate-950"
  }`}
/>

          <button
            onClick={sendMessage}
            disabled={loading}
            className={`rounded-2xl bg-linear-to-r ${accentButton} px-6 font-bold text-white disabled:opacity-50`}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}