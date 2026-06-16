export default function ChatArea({
  currentChat,
  loading,
  darkMode,
  chatEndRef,
}) {
  return (
    <section className="flex-1 overflow-y-auto px-10 py-6">
      {currentChat?.messages.map((msg, index) => (
        <div
          key={index}
          className={`mb-6 flex ${
            msg.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[72%] rounded-3xl px-6 py-4 text-sm leading-7 shadow-sm ${
              msg.role === "user"
                ? "bg-linear-to-r from-violet-600 to-indigo-700 text-white"
                : darkMode
                ? "border border-white/10 bg-white/10 text-white"
                : "border border-white/60 bg-white/90 text-gray-900"
            }`}
          >
            <p className="mb-2 text-xs font-bold opacity-70">
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
          className={`mb-6 max-w-[70%] rounded-3xl px-6 py-4 text-sm shadow-sm ${
            darkMode
              ? "border border-white/10 bg-white/10 text-white"
              : "border border-white/60 bg-white/90"
          }`}
        >
          NeuroFlow AI is thinking...
        </div>
      )}

      <div ref={chatEndRef}></div>
    </section>
  );
}