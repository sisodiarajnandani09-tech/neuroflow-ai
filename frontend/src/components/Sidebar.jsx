export default function Sidebar({
  darkMode,
  chats,
  selectedChatId,
  setSelectedChatId,
  search,
  setSearch,
  newChat,
  togglePin,
  deleteChat,
  logout,
}) {
  return (
    <aside
      className={`flex w-72.5 flex-col border-r p-4 backdrop-blur-xl ${
        darkMode
          ? "border-white/10 bg-[#0f172a]"
          : "border-white/60 bg-linear-to-b from-indigo-50 via-white to-pink-50"
      }`}
    >
      <div
        className={`mb-6 flex items-center gap-3 rounded-2xl p-3 shadow-sm ${
          darkMode ? "bg-white/10" : "bg-white/80"
        }`}
      >
        <img
          src="/logo.png"
          alt="NeuroFlow"
          className="h-12 w-12 rounded-xl object-cover"
        />

        <div>
          <h1 className="font-bold">NeuroFlow AI</h1>
          <p className="text-xs opacity-70">Research Assistant</p>
        </div>
      </div>

      <button
        onClick={newChat}
        className="mb-4 rounded-2xl bg-linear-to-r from-violet-600 via-fuchsia-500 to-pink-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg"
      >
        + New Chat
      </button>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search chats"
        className={`mb-4 rounded-2xl px-4 py-3 text-sm shadow-sm outline-none ${
          darkMode
            ? "bg-white/10 text-white placeholder:text-slate-400"
            : "bg-white/80 text-slate-800"
        }`}
      />

      <div className="flex-1 overflow-y-auto pr-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`mb-2 rounded-2xl p-3 text-sm transition ${
              chat.id === selectedChatId
                ? darkMode
                  ? "bg-white/15"
                  : "bg-linear-to-r from-violet-100 to-pink-100"
                : darkMode
                ? "bg-white/5 hover:bg-white/10"
                : "bg-white/50 hover:bg-white/80"
            }`}
          >
            <button
              onClick={() => setSelectedChatId(chat.id)}
              className="w-full text-left"
            >
              <p className="truncate font-semibold">
                {chat.pinned ? "📌 " : "💬 "}
                {chat.title}
              </p>

              <p className="text-xs opacity-60">
                {chat.messages.length} messages
              </p>
            </button>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => togglePin(chat.id)}
                className="rounded-full bg-indigo-100 px-3 py-1 text-xs text-indigo-700"
              >
                Pin
              </button>

              <button
                onClick={() => deleteChat(chat.id)}
                className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700"
              >
                Del
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={logout}
        className="mt-4 rounded-2xl bg-linear-to-r from-red-500 via-rose-500 to-pink-500 px-4 py-3 text-left text-sm font-semibold text-white shadow-lg"
      >
        🚪 Logout
      </button>
    </aside>
  );
}