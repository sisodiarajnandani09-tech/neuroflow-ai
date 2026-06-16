export default function AgentStatus({ activeAgent, darkMode }) {
  const agents = [
    "Research Agent",
    "Analyst Agent",
    "Writer Agent",
    "Manager Agent",
  ];

  return (
    <div
      className={`mx-8 mt-4 rounded-2xl border p-3 shadow-sm ${
        darkMode
          ? "border-white/10 bg-white/10"
          : "border-white/60 bg-white/80"
      }`}
    >
      <div className="mb-2 flex justify-between">
        <h3 className="text-sm font-bold">Agent Workflow</h3>

        <span className="text-xs opacity-70">
          {activeAgent || "Idle"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {agents.map((agent) => (
          <div
            key={agent}
            className={`rounded-xl px-3 py-3 text-center text-xs transition ${
              activeAgent === agent
                ? "bg-linear-to-r from-violet-600 to-indigo-700 text-white"
                : activeAgent === "Completed"
                ? "bg-linear-to-r from-emerald-400 to-green-500 text-white"
                : darkMode
                ? "bg-white/10 text-slate-300"
                : "bg-white/70 text-slate-500"
            }`}
          >
            <div>
              {activeAgent === agent
                ? "⚡"
                : activeAgent === "Completed"
                ? "✓"
                : "○"}
            </div>

            <div>{agent}</div>
          </div>
        ))}
      </div>
    </div>
  );
}