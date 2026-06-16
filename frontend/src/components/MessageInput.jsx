export default function MessageInput({
  input,
  setInput,
  sendMessage,
  loading,
  selectedFile,
  setSelectedFile,
  fileInputRef,
  selectFile,
  startVoiceInput,
  micMuted,
  setMicMuted,
  recognitionRef,
  darkMode,
}) {
  return (
    <>
      {selectedFile && (
        <div
          className={`mx-10 mb-2 flex items-center justify-between rounded-2xl border px-4 py-2 text-xs shadow-sm ${
            darkMode
              ? "border-white/10 bg-white/10 text-white"
              : "border-white/60 bg-white/80"
          }`}
        >
          <span>📎 Selected File: {selectedFile.name}</span>

          <button
            onClick={() => {
              setSelectedFile(null);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
            className="rounded-full bg-rose-100 px-3 py-1 text-rose-700"
          >
            Remove
          </button>
        </div>
      )}

      <footer
        className={`border-t px-8 py-5 backdrop-blur-xl ${
          darkMode
            ? "border-white/10 bg-white/5"
            : "border-white/70 bg-white/30"
        }`}
      >
        <div
          className={`mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${
            darkMode
              ? "border-white/10 bg-white/10"
              : "border-white/60 bg-white/85"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/png,image/jpeg,image/jpg"
            onChange={selectFile}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-full bg-sky-100 px-4 py-3 text-sky-700"
          >
            📎
          </button>

          <button
            onClick={() => {
              if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current = null;
                setMicMuted(true);
              } else if (micMuted) {
                setMicMuted(false);
              } else {
                startVoiceInput();
              }
            }}
            className={`rounded-full px-4 py-3 ${
              micMuted
                ? "bg-red-100 text-red-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {micMuted ? "🔇" : "🎙️"}
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !loading) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={
              selectedFile
                ? "Ask a question about selected file..."
                : "Ask anything..."
            }
            className={`flex-1 bg-transparent px-2 py-3 text-sm outline-none ${
              darkMode
                ? "text-white placeholder:text-slate-400"
                : "text-slate-800"
            }`}
          />

          <button
            onClick={() => {
              if (!loading) sendMessage();
            }}
            disabled={loading}
            className="rounded-full bg-linear-to-r from-fuchsia-500 via-pink-500 to-orange-400 px-5 py-3 text-white shadow-lg disabled:opacity-60"
          >
            ➤
          </button>
        </div>
      </footer>
    </>
  );
}