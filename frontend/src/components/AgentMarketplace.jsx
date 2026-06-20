"use client";

import { useEffect, useState } from "react";
import API from "../services/api";

export default function AgentMarketplace() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const response = await API.get("/marketplace-agents");
      setAgents(response.data || []);
    } catch (error) {
      console.error(error);

      if (error?.response?.status === 401) {
        setMessage("Please login again. Token missing or expired.");
      } else {
        setMessage("Failed to load marketplace agents.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openAgent = (agent) => {
    setSelectedAgent(agent);
    setAnswer("");
    setQuery("");
  };

  const runMarketplaceAgent = async () => {
    if (!selectedAgent) {
      setMessage("Please select an agent first.");
      return;
    }

    if (!query.trim()) {
      setMessage("Please enter your query.");
      return;
    }

    try {
      setRunning(true);
      setMessage("");
      setAnswer("");

      const response = await API.post(
        `/run-marketplace-agent/${selectedAgent.id}`,
        {
          query: query.trim(),
        }
      );

      setAnswer(response.data.answer || response.data.report || "No response");
      setMessage("Agent executed successfully.");
    } catch (error) {
      console.error(error);

      if (error?.response?.status === 401) {
        setMessage("Unauthorized. Please login again.");
      } else {
        setMessage(
          error?.response?.data?.detail ||
            "Agent run failed. Please check backend."
        );
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-7">
        <h2 className="text-3xl font-bold">Agent Marketplace</h2>
        <p className="mt-1 text-slate-400">
          Explore and run ready-to-use AI agents.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 py-3 text-sm text-pink-100">
          {message}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-slate-400">
          Loading marketplace agents...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          {agents.map((agent) => (
            <div
              key={agent.id}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl"
            >
              <div className="text-4xl">{agent.icon || "🤖"}</div>

              <h3 className="mt-5 text-lg font-bold">{agent.name}</h3>

              <p className="mt-2 min-h-12 text-sm text-slate-400">
                {agent.description}
              </p>

              <p className="mt-3 text-xs text-pink-300">
                Category: {agent.category || "General"}
              </p>

              <button
                onClick={() => openAgent(agent)}
                className="mt-5 w-full rounded-xl bg-linear-to-r from-pink-600 to-fuchsia-600 py-3 text-sm font-bold text-white"
              >
                Use Agent
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedAgent && (
        <div className="mt-8 rounded-3xl border border-pink-500/20 bg-pink-900/20 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                {selectedAgent.icon} {selectedAgent.name}
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Ask this agent anything related to its domain.
              </p>
            </div>

            <button
              onClick={() => setSelectedAgent(null)}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Close
            </button>
          </div>

          <textarea
  id="agent-marketplace-query"
  name="agent-marketplace-query"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  placeholder={
    selectedAgent.name === "Real Estate Agent"
      ? "Example: Find 2BHK properties under 30 lakh in Jaipur."
      : selectedAgent.name === "Finance Advisor"
      ? "Example: Create a monthly budget plan for a student."
      : selectedAgent.name === "Medical Assistant"
      ? "Example: Explain this blood report in simple language."
      : "Enter your query here..."
  }
  autoComplete="off"
  className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-[#111124] p-5 text-sm leading-7 outline-none placeholder:text-slate-500"
/>

          <button
            onClick={runMarketplaceAgent}
            disabled={running}
            className="mt-4 rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 px-8 py-3 font-bold text-white disabled:opacity-60"
          >
            {running ? "Running Agent..." : "Run Agent"}
          </button>

          {answer && (
            <pre className="mt-5 max-h-112.5 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm leading-7 text-slate-200">
              {answer}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}