"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

export default function DashboardMain() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [input, setInput] = useState("");
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [selectedChat, setSelectedChat] = useState(0);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [activeAgent, setActiveAgent] = useState("");
  const [agentLogs, setAgentLogs] = useState([]);

  const [chats, setChats] = useState([
    {
      id: null,
      title: "Welcome Chat",
      pinned: false,
      report: "",
      messages: [
        {
          role: "assistant",
          content: "Hi, I am NeuroFlow AI. Ask me anything or attach a PDF.",
        },
      ],
    },
  ]);

  const currentChat = chats[selectedChat] || chats[0];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await API.get("/history");

      const savedChats = response.data.map((item) => ({
        id: item.id,
        title: item.topic || "Untitled Chat",
        pinned: false,
        report: item.report || "",
        messages: [
          {
            role: "user",
            content: item.topic || "",
          },
          {
            role: "assistant",
            content: item.report || "",
          },
        ],
      }));

      if (savedChats.length > 0) {
        setChats(savedChats);
        setSelectedChat(0);
      }
    } catch (error) {
      console.error("History load failed", error);
    }
  };

  const newChat = () => {
    const chat = {
      id: null,
      title: "New Chat",
      pinned: false,
      report: "",
      messages: [
        {
          role: "assistant",
          content: "New chat started. You can ask a question or attach a PDF.",
        },
      ],
    };

    setChats([chat, ...chats]);
    setSelectedChat(0);
    setSelectedPdf(null);
  };

  const updateCurrentChat = (updatedChat) => {
    const updated = [...chats];
    updated[selectedChat] = updatedChat;
    setChats(updated);
  };

  const markAgent = (name) => {
    setActiveAgent(name);
    setAgentLogs((prev) => [...prev, `${name} running`]);
  };

  const selectPdf = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Please upload PDF only.");
      event.target.value = "";
      return;
    }

    setSelectedPdf(file);
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      alert("Please enter your question first.");
      return;
    }

    const userText = input.trim();

    const userMessageContent = selectedPdf
      ? `${userText}\n\n📄 Attached PDF: ${selectedPdf.name}`
      : userText;

    const updatedChat = {
      ...currentChat,
      title: userText.slice(0, 35),
      messages: [
        ...currentChat.messages,
        {
          role: "user",
          content: userMessageContent,
        },
      ],
    };

    updateCurrentChat(updatedChat);

    setInput("");
    setLoading(true);
    setAgentLogs([]);
    markAgent("Research Agent");

    try {
      if (selectedPdf) {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", selectedPdf);

        await API.post("/upload-pdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        setUploading(false);
      }

      const responsePromise = API.post("/research", {
        topic: userText,
      });

      setTimeout(() => markAgent("Analyst Agent"), 900);
      setTimeout(() => markAgent("Writer Agent"), 1800);
      setTimeout(() => markAgent("Manager Agent"), 2700);

      const response = await responsePromise;

      setAgentLogs(response.data.logs || []);
      setActiveAgent("Completed");

      const finalChat = {
        ...updatedChat,
        id: response.data.id,
        report: response.data.report || "",
        messages: [
          ...updatedChat.messages,
          {
            role: "assistant",
            content: response.data.report || "No response generated.",
          },
        ],
      };

      updateCurrentChat(finalChat);
      setSelectedPdf(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setActiveAgent("Failed");

      updateCurrentChat({
        ...updatedChat,
        messages: [
          ...updatedChat.messages,
          {
            role: "assistant",
            content: "Backend error. Please check FastAPI terminal.",
          },
        ],
      });
    } finally {
      setLoading(false);
      setUploading(false);

      setTimeout(() => {
        setActiveAgent("");
      }, 2500);
    }
  };

  const deleteChat = async (index) => {
    const chat = chats[index];

    try {
      if (chat.id) {
        await API.delete(`/history/${chat.id}`);
      }
    } catch (error) {
      console.error("Delete failed", error);
    }

    const updated = chats.filter((_, i) => i !== index);

    if (updated.length === 0) {
      setChats([
        {
          id: null,
          title: "Welcome Chat",
          pinned: false,
          report: "",
          messages: [
            {
              role: "assistant",
              content: "Hi, I am NeuroFlow AI.",
            },
          ],
        },
      ]);
      setSelectedChat(0);
      return;
    }

    setChats(updated);
    setSelectedChat(0);
  };

  const sortedChats = [...chats].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned)
  );

  const togglePin = (sortedIndex) => {
    const chat = sortedChats[sortedIndex];
    const originalIndex = chats.findIndex((c) => c === chat);

    const updated = [...chats];
    updated[originalIndex].pinned = !updated[originalIndex].pinned;

    setChats(updated);
    setSelectedChat(originalIndex);
  };

  const downloadFile = async (type) => {
    if (!currentChat?.report) {
      alert("No report available to download.");
      return;
    }

    const endpoint = type === "pdf" ? "/download-pdf" : "/download-docx";

    try {
      const response = await API.post(
        endpoint,
        {
          report: currentChat.report,
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download =
        type === "pdf" ? "neuroflow-report.pdf" : "neuroflow-report.docx";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error(error);
      alert("Download failed. Please check backend.");
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome for voice input.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.start();

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };

    recognition.onerror = () => {
      alert("Voice input failed. Try again.");
    };
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#dfe5e8] via-[#eef7f8] to-[#fde7ef] p-8">
  <div className="mx-auto flex h-[88vh] max-w-7xl overflow-hidden rounded-[34px] border border-white/60 bg-linear-to-br from-cyan-50 via-white to-pink-50 shadow-2xl">
    
    <aside className="w-52 border-r border-white/60 bg-white/55 p-5 backdrop-blur-xl">
      <div className="mb-8">
        <img
          src="/logo.png"
          alt="NeuroFlow AI Logo"
          className="w-28 rounded-xl"
        />
      </div>

          <button
            onClick={newChat}
            className="mb-6 w-full rounded-full bg-pink-500 py-3 text-white"
          >
            💬 New Chat
          </button>

          <nav className="space-y-4 text-sm text-gray-700">
            <SideButton label="Chat Helper" onClick={() => {}} />

            <SideButton
              label="Settings"
              onClick={() => router.push("/settings")}
            />

            <SideButton label="Logout" onClick={logout} />
          </nav>
        </aside>

        <main className="flex flex-1 flex-col bg-linear-to-br from-cyan-200 via-yellow-100 to-pink-200 p-6">
          <AgentStatus activeAgent={activeAgent} logs={agentLogs} />

          <div className="flex-1 overflow-y-auto px-4">
            {currentChat.messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-5 flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[72%] rounded-2xl p-5 text-sm leading-7 shadow-sm ${
                    msg.role === "user"
                      ? "bg-white text-black"
                      : "bg-[#fffaf0] text-black"
                  }`}
                >
                  <p className="mb-2 font-bold text-blue-600">
                    {msg.role === "user" ? "You" : "NeuroFlow AI"}
                  </p>

                  <pre className="whitespace-pre-wrap font-sans">
                    {msg.content}
                  </pre>
                </div>
              </div>
            ))}

            {loading && (
              <div className="rounded-2xl bg-[#fffaf0] p-5 text-sm shadow">
                NeuroFlow AI is thinking...
              </div>
            )}
          </div>

          {selectedPdf && (
            <div className="mb-2 flex items-center justify-between rounded-2xl bg-white/70 px-4 py-2 text-xs text-gray-700">
              <span>📄 Selected PDF: {selectedPdf.name}</span>

              <button
                onClick={() => {
                  setSelectedPdf(null);

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
                className="rounded-full bg-red-500 px-2 py-1 text-white"
              >
                Remove
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={selectPdf}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full bg-white p-3"
              title="Select PDF"
            >
              📎
            </button>

            <button
              onClick={startVoiceInput}
              className="rounded-full bg-white p-3"
              title="Voice Input"
            >
              🎙️
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder={
                selectedPdf
                  ? "Ask a question about selected PDF..."
                  : "Start typing"
              }
              className="flex-1 rounded-full bg-white px-5 py-3 text-sm outline-none"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="rounded-full bg-pink-500 px-5 py-3 text-white disabled:opacity-60"
            >
              ➤
            </button>
          </div>
        </main>

        <aside className="w-77 bg-linear-to-b from-yellow-100 to-orange-200 p-6">
          <div className="mb-4 flex justify-between">
            <h2 className="text-2xl font-serif">History</h2>

            <span className="text-xs">{chats.length}/30</span>
          </div>

          {sortedChats.map((chat, index) => (
            <div
              key={`${chat.id || chat.title}-${index}`}
              className="mb-3 rounded-xl bg-white/50 p-3 text-sm"
            >
              <button
                onClick={() => {
                  const originalIndex = chats.findIndex((c) => c === chat);
                  setSelectedChat(originalIndex);
                }}
                className="w-full text-left"
              >
                <p className="font-bold">
                  {chat.pinned ? "📌 " : "💬 "}
                  {chat.title}
                </p>

                <p className="text-xs text-gray-600">
                  {chat.messages.length} messages
                </p>
              </button>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => togglePin(index)}
                  className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-xs hover:bg-blue-200"
                >
                  Pin
                </button>

                <button
                  onClick={() => {
                    const originalIndex = chats.findIndex((c) => c === chat);
                    setSelectedChat(originalIndex);
                    setTimeout(() => downloadFile("pdf"), 100);
                  }}
                  className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs hover:bg-green-200"
                >
                  PDF
                </button>

                <button
                  onClick={() => {
                    const originalIndex = chats.findIndex((c) => c === chat);
                    setSelectedChat(originalIndex);
                    setTimeout(() => downloadFile("docx"), 100);
                  }}
                  className="rounded-full bg-purple-100 text-purple-700 px-3 py-1 text-xs hover:bg-purple-200"
                >
                  DOCX
                </button>

                <button
                  onClick={() => {
                    const originalIndex = chats.findIndex((c) => c === chat);
                    deleteChat(originalIndex);
                  }}
                  className="rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs hover:bg-red-200"
                >
                  Del
                </button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function SideButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="block w-full rounded-xl px-3 py-2 text-left hover:bg-gray-100"
    >
      {label}
    </button>
  );
}

function AgentStatus({ activeAgent, logs }) {
  const agents = [
    "Research Agent",
    "Analyst Agent",
    "Writer Agent",
    "Manager Agent",
  ];

  const joinedLogs = logs.join(" ").toLowerCase();

  const getStatus = (agent) => {
    if (activeAgent === "Completed") return "done";
    if (activeAgent === "Failed") return "failed";
    if (activeAgent === agent) return "active";

    if (agent === "Research Agent" && joinedLogs.includes("research")) {
      return "done";
    }

    if (agent === "Analyst Agent" && joinedLogs.includes("analyst")) {
      return "done";
    }

    if (agent === "Writer Agent" && joinedLogs.includes("writer")) {
      return "done";
    }

    if (agent === "Manager Agent" && joinedLogs.includes("manager")) {
      return "done";
    }

    return "waiting";
  };

  return (
    <div className="mb-4 rounded-2xl bg-white/60 p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Agent Workflow</h3>

        <span className="text-xs text-gray-600">
          {activeAgent || "Idle"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {agents.map((agent) => {
          const status = getStatus(agent);

          return (
            <div
              key={agent}
              className={`rounded-xl px-2 py-3 text-center text-xs transition-all duration-300 ${
                status === "active"
                  ? "scale-105 bg-blue-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.9)]"
                  : status === "done"
                  ? "bg-green-500 text-white shadow-[0_0_12px_rgba(34,197,94,0.55)]"
                  : status === "failed"
                  ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.55)]"
                  : "bg-white/70 text-gray-500"
              }`}
            >
              <div className="mb-1 text-lg">
                {status === "done"
                  ? "✓"
                  : status === "active"
                  ? "⚡"
                  : status === "failed"
                  ? "!"
                  : "○"}
              </div>

              <div>{agent}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}