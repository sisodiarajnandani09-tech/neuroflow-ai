"use client";

import { useState } from "react";
import API from "../services/api";

export default function AgentBuilder({ theme = "dark", accent = "pink" }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [agentId, setAgentId] = useState(null);
  const [agentName, setAgentName] = useState("");

  const [runQuery, setRunQuery] = useState("");
  const [runResult, setRunResult] = useState("");

  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

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

  const ideas = [
    "Real Estate Agent",
    "Medical Assistant",
    "Finance Advisor",
    "Legal Assistant",
    "Edu Mentor",
    "Travel Planner",
  ];

  const buildAgent = async () => {
    if (!input.trim()) {
      setMessage("Please describe the agent you want to build.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult("");
      setRunResult("");
      setAgentId(null);

      const response = await API.post("/build-agent", {
        agent_type: input.trim(),
      });

      setResult(response.data.answer || response.data.report || "");
      setAgentId(response.data.agent_id || null);
      setAgentName(response.data.topic || input.trim());

      setMessage("Agent created successfully. Now you can run it.");
    } catch (error) {
      console.error(error);

      const detail = error?.response?.data?.detail;

      setMessage(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Backend error. Please check FastAPI terminal."
      );
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async () => {
    if (!agentId) {
      setMessage("Please build an agent first.");
      return;
    }

    if (!runQuery.trim()) {
      setMessage("Please enter a query to run this agent.");
      return;
    }

    try {
      setRunning(true);
      setMessage("");
      setRunResult("");

      const response = await API.post("/run-agent", {
        agent_id: agentId,
        query: runQuery.trim(),
      });

      setRunResult(response.data.answer || response.data.report || "");
      setMessage("Agent executed successfully.");
    } catch (error) {
      console.error(error);

      const detail = error?.response?.data?.detail;

      setMessage(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Agent run failed. Please check backend."
      );
    } finally {
      setRunning(false);
    }
  };

  const downloadText = () => {
    if (!result) {
      setMessage("No agent blueprint available to download.");
      return;
    }

    const content = `
NEUROFLOW AI - GENERATED AGENT BLUEPRINT

Agent:
${agentName || "Generated Agent"}

Blueprint:
${result}

Run Result:
${runResult || "No run result yet."}
`;

    const blob = new Blob([content], {
      type: "text/plain",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${agentName || "generated-agent"}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={isDark ? "min-h-screen text-white" : "min-h-screen text-slate-950"}>
      <div className="mb-7">
        <h2 className="text-3xl font-bold">Agent Builder</h2>

        <p className={isDark ? "mt-1 text-slate-400" : "mt-1 text-slate-600"}>
          Create, save and directly run custom AI agents.
        </p>
      </div>

      {message && (
        <div
          className={
            isDark
              ? "mb-5 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 py-3 text-sm text-pink-100"
              : "mb-5 rounded-2xl border border-pink-200 bg-pink-50 px-5 py-3 text-sm text-pink-700"
          }
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <Card isDark={isDark}>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Describe Your Agent</h3>

                <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
                  Tell us what kind of AI agent you want to create.
                </p>
              </div>

              <span
                className={
                  isDark
                    ? "rounded-full bg-pink-600/20 px-4 py-2 text-xs text-pink-200"
                    : "rounded-full bg-pink-100 px-4 py-2 text-xs text-pink-700"
                }
              >
                Step 1
              </span>
            </div>

            <textarea
  id="agent-description"
  name="agent-description"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Example: Create a real estate agent that helps users find properties, compare prices, analyze budget and suggest best locations."
  autoComplete="off"
  className={textareaClass(isDark)}
/>

            <div className="mt-4 flex flex-wrap gap-3">
              {ideas.map((item) => (
                <button
                  key={item}
                  onClick={() =>
                    setInput(
                      `Create a ${item} that works as a professional domain-specific AI assistant.`
                    )
                  }
                  className={
                    isDark
                      ? "rounded-xl bg-white/10 px-4 py-2 text-xs text-slate-300 hover:bg-white/15"
                      : "rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-700 hover:bg-slate-200"
                  }
                >
                  {item}
                </button>
              ))}
            </div>

            <button
              onClick={buildAgent}
              disabled={loading}
              className={`mt-6 w-full rounded-2xl bg-linear-to-r ${accentButton} py-4 font-bold text-white shadow-lg disabled:opacity-60`}
            >
              {loading ? "Building Agent..." : "Build Agent →"}
            </button>
          </Card>

          {result && (
            <Card isDark={isDark} extra="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    Generated Agent Blueprint
                  </h3>

                  <p className={isDark ? "text-sm text-slate-400" : "text-sm text-slate-600"}>
                    Agent ID: {agentId || "Not saved"}
                  </p>
                </div>

                <button
                  onClick={downloadText}
                  className={
                    isDark
                      ? "rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
                      : "rounded-xl bg-slate-100 px-4 py-2 text-sm hover:bg-slate-200"
                  }
                >
                  Download TXT
                </button>
              </div>

              <pre className={preClass(isDark)}>
                {result}
              </pre>
            </Card>
          )}
        </div>

        <div>
          <div
            className={
              isDark
                ? "rounded-3xl border border-pink-500/20 bg-pink-900/20 p-6"
                : "rounded-3xl border border-pink-200 bg-pink-50 p-6"
            }
          >
            <h3 className="text-xl font-bold">▶ Run This Agent</h3>

            <p className={isDark ? "mt-1 text-sm text-slate-400" : "mt-1 text-sm text-slate-600"}>
              After building, test your agent with a real query.
            </p>

            <textarea
  id="agent-run-query"
  name="agent-run-query"
  value={runQuery}
  onChange={(e) => setRunQuery(e.target.value)}
  placeholder="Example: Find 2BHK properties under 30 lakh in Jaipur."
  autoComplete="off"
  className="h-32 w-full resize-none rounded-2xl border border-white/10 bg-[#111124] p-5 text-sm leading-7 outline-none placeholder:text-slate-500"
/>

            <button
              onClick={runAgent}
              disabled={running || !agentId}
              className="mt-4 w-full rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 py-4 font-bold text-white disabled:opacity-50"
            >
              {running ? "Running Agent..." : "Run Agent"}
            </button>

            {!agentId && (
              <p className={isDark ? "mt-3 text-xs text-slate-400" : "mt-3 text-xs text-slate-600"}>
                Build an agent first to enable run mode.
              </p>
            )}
          </div>

          {runResult && (
            <Card isDark={isDark} extra="mt-6">
              <h3 className="mb-4 text-xl font-bold">Agent Response</h3>

              <pre className={preClass(isDark)}>
                {runResult}
              </pre>
            </Card>
          )}

          <Card isDark={isDark} extra="mt-6">
            <h3 className="text-xl font-bold">How it works</h3>

            <div className={isDark ? "mt-4 space-y-3 text-sm text-slate-300" : "mt-4 space-y-3 text-sm text-slate-700"}>
              <p>1. Describe your custom agent.</p>
              <p>2. NeuroFlow generates role, goal, prompt and code.</p>
              <p>3. Agent is saved in your account.</p>
              <p>4. Run the agent directly with any query.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Card({ children, isDark, extra = "" }) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-xl ${extra} ${
        isDark
          ? "border-white/10 bg-white/5"
          : "border-slate-200 bg-white"
      }`}
    >
      {children}
    </div>
  );
}

function textareaClass(isDark, extra = "h-44") {
  return `${extra} w-full resize-none rounded-2xl border p-5 text-sm leading-7 outline-none ${
    isDark
      ? "border-white/10 bg-[#111124] text-white placeholder:text-slate-500"
      : "border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400"
  }`;
}

function preClass(isDark) {
  return `max-h-[450px] overflow-y-auto whitespace-pre-wrap rounded-2xl p-5 text-sm leading-7 ${
    isDark
      ? "bg-black/30 text-slate-200"
      : "bg-slate-50 text-slate-800"
  }`;
}