"use client";

import { useState } from "react";
import API from "../services/api";

export default function Recommendations() {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const items = [
    ["Generative AI Trends 2026", "Trending"],
    ["Large Language Models", "Recommended"],
    ["AI in Healthcare", "Popular"],
    ["Multi Agent Systems", "New"],
    ["Quantum Computing Basics", "Trending"],
  ];

  const generateResearch = async () => {
    if (!selected) {
      setMessage("Please select a recommendation first.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult("");

      const response = await API.post("/research", {
        topic: `Create a professional research report on ${selected[0]}`,
      });

      setResult(response.data.report || "No report generated.");
      setMessage("Research generated successfully.");
    } catch (error) {
      const detail = error?.response?.data?.detail;

      setMessage(
        Array.isArray(detail)
          ? detail.map((item) => item.msg).join(", ")
          : detail || "Failed to generate research."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold">Recommendations</h2>
      <p className="mt-1 text-slate-400">
        AI-powered suggestions based on your research.
      </p>

      {message && (
        <div className="mt-5 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 py-3 text-sm text-pink-100">
          {message}
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          {items.map((item) => (
            <button
              key={item[0]}
              onClick={() => {
                setSelected(item);
                setResult("");
                setMessage("");
              }}
              className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left ${
                selected?.[0] === item[0]
                  ? "border-pink-500/60 bg-pink-900/20"
                  : "border-white/10 bg-white/5"
              }`}
            >
              <div>
                <h3 className="font-bold">{item[0]}</h3>
                <p className="text-sm text-slate-400">
                  Suggested for your next research
                </p>
              </div>

              <span className="rounded-xl bg-pink-600/30 px-3 py-1 text-xs text-pink-200">
                {item[1]}
              </span>
            </button>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="font-bold">Why these?</h3>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            These recommendations are based on your recent activity, uploaded
            documents and research patterns.
          </p>

          {selected && (
            <div className="mt-6 rounded-2xl bg-white/10 p-4">
              <p className="text-sm text-slate-400">Selected Topic</p>
              <h4 className="mt-1 font-bold">{selected[0]}</h4>

              <button
                onClick={generateResearch}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-linear-to-r from-pink-600 to-fuchsia-600 py-3 text-sm font-bold disabled:opacity-60"
              >
                {loading ? "Generating..." : "Generate Research"}
              </button>
            </div>
          )}
        </div>
      </div>

      {result && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="mb-4 text-xl font-bold">Generated Research</h3>

          <pre className="max-h-130 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm leading-7 text-slate-200">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}