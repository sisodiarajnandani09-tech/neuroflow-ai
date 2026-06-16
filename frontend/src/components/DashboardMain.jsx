"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import API from "../services/api";

import Sidebar from "./Sidebar";
import AgentStatus from "./AgentStatus";
import ChatArea from "./ChatArea";
import MessageInput from "./MessageInput";

export default function DashboardMain() {
  const router = useRouter();

  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const sendingRef = useRef(false);

  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [activeAgent, setActiveAgent] = useState("");
  const [agentLogs, setAgentLogs] = useState([]);

  const [chats, setChats] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [micMuted, setMicMuted] = useState(false);

  const createWelcomeChat = () => ({
    id: crypto.randomUUID(),
    backendIds: [],
    title: "Welcome Chat",
    pinned: false,
    report: "",
    messages: [
      {
        role: "assistant",
        content: "Hi, I am NeuroFlow AI. Ask me anything or attach a PDF/Image.",
      },
    ],
  });
useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  setDarkMode(savedTheme === "dark");

  let oldChats = [];

  const savedChats = localStorage.getItem("neuroflow_chats");

  if (savedChats) {
    try {
      const parsed = JSON.parse(savedChats);
      if (Array.isArray(parsed)) {
        oldChats = parsed;
      }
    } catch {
      localStorage.removeItem("neuroflow_chats");
    }
  }

  const freshChat = {
    id: crypto.randomUUID(),
    backendIds: [],
    title: "New Chat",
    pinned: false,
    report: "",
    messages: [
      {
        role: "assistant",
        content:
          "New chat started. What do you want to research?",
      },
    ],
  };

  setChats([freshChat, ...oldChats]);
  setSelectedChatId(freshChat.id);
}, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("neuroflow_chats", JSON.stringify(chats));
    }
  }, [chats]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedChatId, loading]);

  const currentChat =
    chats.find((chat) => chat.id === selectedChatId) || chats[0];

  const updateChat = (updatedChat) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === updatedChat.id ? updatedChat : chat
      )
    );
  };

  const newChat = () => {
    const chat = {
      id: crypto.randomUUID(),
      backendIds: [],
      title: "New Chat",
      pinned: false,
      report: "",
      messages: [
        {
          role: "assistant",
          content: "New chat started. What do you want to research?",
        },
      ],
    };

    setChats((prev) => [chat, ...prev]);
    setSelectedChatId(chat.id);
    setInput("");
    setSearch("");
    setSelectedFile(null);
  };

  const markAgent = (name) => {
    setActiveAgent(name);
    setAgentLogs((prev) => [...prev, `${name} running`]);
  };

  const selectFile = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, JPEG and PNG files are allowed.");
      event.target.value = "";
      return;
    }

    setSelectedFile({
      file,
      name: file.name,
    });
  };

  const sendMessage = async () => {
    if (sendingRef.current || loading) return;
    if (!input.trim() || !currentChat) return;

    const userText = input.trim();

    if (userText.length < 3 || userText.length > 500) {
      updateChat({
        ...currentChat,
        messages: [
          ...currentChat.messages,
          {
            role: "assistant",
            content:
              "⚠️ Please enter a valid query between 3 and 500 characters.",
          },
        ],
      });
      return;
    }

    sendingRef.current = true;
    setLoading(true);
    setAgentLogs([]);
    markAgent("Research Agent");

    const userContent = selectedFile
      ? `${userText}\n\n📎 Attached File: ${selectedFile.name}`
      : userText;

    const updatedChat = {
      ...currentChat,
      title:
        currentChat.title === "Welcome Chat" ||
        currentChat.title === "New Chat"
          ? userText.slice(0, 35)
          : currentChat.title,
      messages: [
        ...currentChat.messages,
        {
          role: "user",
          content: userContent,
        },
      ],
    };

    updateChat(updatedChat);
    setInput("");

    try {
      let response;

      if (selectedFile) {
        setUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile.file);

        const uploadResponse = await API.post("/upload-file", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        response = await API.post("/ask-document", {
          document_id: uploadResponse.data.document_id,
          question: userText,
        });
      } else {
        setTimeout(() => markAgent("Analyst Agent"), 700);
        setTimeout(() => markAgent("Writer Agent"), 1400);
        setTimeout(() => markAgent("Manager Agent"), 2100);

        response = await API.post("/research", {
          topic: userText,
        });
      }

      const aiResponse =
        response.data.answer ||
        response.data.report ||
        "No response generated.";

      const finalChat = {
        ...updatedChat,
        backendIds: response.data.id
          ? [...(updatedChat.backendIds || []), response.data.id]
          : updatedChat.backendIds || [],
        report: aiResponse,
        messages: [
          ...updatedChat.messages,
          {
            role: "assistant",
            content: aiResponse,
          },
        ],
      };

      setAgentLogs(response.data.logs || []);
      setActiveAgent("Completed");
      updateChat(finalChat);

      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      setActiveAgent("Failed");

      const detail = error?.response?.data?.detail;

      updateChat({
        ...updatedChat,
        messages: [
          ...updatedChat.messages,
          {
            role: "assistant",
            content:
              detail || "Backend error. Please check FastAPI terminal.",
          },
        ],
      });
    } finally {
      sendingRef.current = false;
      setLoading(false);
      setUploading(false);

      setTimeout(() => {
        setActiveAgent("");
      }, 2000);
    }
  };

  const deleteChat = async (chatId) => {
    const updated = chats.filter((chat) => chat.id !== chatId);

    if (updated.length === 0) {
      const welcome = createWelcomeChat();
      setChats([welcome]);
      setSelectedChatId(welcome.id);
      return;
    }

    setChats(updated);
    setSelectedChatId(updated[0].id);
  };

  const togglePin = (chatId) => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, pinned: !chat.pinned }
          : chat
      )
    );
  };

  const downloadFile = async (type) => {
    if (!currentChat?.messages?.length) {
      alert("No chat available to download.");
      return;
    }

    const endpoint = type === "pdf" ? "/download-pdf" : "/download-docx";

    const fullChat = currentChat.messages
      .map(
        (msg) => `
${msg.role === "user" ? "👤 USER" : "🤖 NEUROFLOW AI"}

${msg.content}
`
      )
      .join("\n\n====================================\n\n");

    try {
      const response = await API.post(
        endpoint,
        { report: fullChat },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download =
        type === "pdf"
          ? `${currentChat.title}.pdf`
          : `${currentChat.title}.docx`;

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Download failed.");
    }
  };

  const startVoiceInput = () => {
    if (micMuted) {
      alert("Microphone is muted.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Use Chrome for voice input.");
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setMicMuted(true);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";

    recognitionRef.current = recognition;
    recognition.start();

    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };
  };

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const filteredChats = useMemo(() => {
    return [...chats]
      .filter((chat) =>
        chat.title.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => Number(b.pinned) - Number(a.pinned));
  }, [chats, search]);

  return (
    <div
      className={`h-screen overflow-hidden ${
        darkMode
          ? "bg-[#07111f] text-white"
          : "bg-linear-to-br from-indigo-100 via-sky-100 to-pink-100 text-[#111827]"
      }`}
    >
      <div className="flex h-full">
        <Sidebar
          darkMode={darkMode}
          chats={filteredChats}
          selectedChatId={selectedChatId}
          setSelectedChatId={setSelectedChatId}
          search={search}
          setSearch={setSearch}
          newChat={newChat}
          togglePin={togglePin}
          deleteChat={deleteChat}
          logout={logout}
        />

        <main
          className={`flex flex-1 flex-col ${
            darkMode
              ? "bg-[#07111f]"
              : "bg-linear-to-br from-sky-100 via-violet-100 to-pink-100"
          }`}
        >
          <header
            className={`flex items-center justify-between border-b px-8 py-4 backdrop-blur-xl ${
              darkMode
                ? "border-white/10 bg-white/5"
                : "border-white/70 bg-white/40"
            }`}
          >
            <div>
              <h2 className="text-lg font-bold">
                {currentChat?.title || "Chat"}
              </h2>
              <p className="text-xs opacity-70">
                {uploading ? "Uploading File..." : "NeuroFlow AI"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => downloadFile("pdf")}
                className="rounded-full bg-linear-to-r from-emerald-400 to-green-500 px-4 py-2 text-xs font-semibold text-white"
              >
                PDF
              </button>

              <button
                onClick={() => downloadFile("docx")}
                className="rounded-full bg-linear-to-r from-purple-500 to-pink-500 px-4 py-2 text-xs font-semibold text-white"
              >
                DOCX
              </button>
            </div>
          </header>

          <AgentStatus activeAgent={activeAgent} darkMode={darkMode} />

          <ChatArea
            currentChat={currentChat}
            loading={loading}
            darkMode={darkMode}
            chatEndRef={chatEndRef}
          />

          <MessageInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            loading={loading}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            fileInputRef={fileInputRef}
            selectFile={selectFile}
            startVoiceInput={startVoiceInput}
            micMuted={micMuted}
            setMicMuted={setMicMuted}
            recognitionRef={recognitionRef}
            darkMode={darkMode}
          />
        </main>
      </div>
    </div>
  );
}