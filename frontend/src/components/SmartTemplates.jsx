"use client";

import { useState } from "react";
import API from "../services/api";

export default function SmartTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const templates = [
    {
      icon: "📑",
      title: "Academic Research",
      desc: "Research paper style format.",
      prompt: `
Create an ACADEMIC RESEARCH REPORT in this exact format:

# Title
# Abstract
# Keywords
# 1. Introduction
# 2. Literature Review
# 3. Research Methodology
# 4. Analysis and Discussion
# 5. Findings
# 6. Conclusion
# References

Rules:
- Formal academic tone
- Use numbered headings
- Add references section
- Add table if useful
`,
    },
    {
      icon: "💼",
      title: "Business Report",
      desc: "Professional business format.",
      prompt: `
Create a BUSINESS REPORT in this exact format:

# Executive Summary
# Business Objective
# Market Overview
# SWOT Analysis
# Competitor Analysis
# Financial Considerations
# Risks and Challenges
# Recommendations
# Conclusion

Rules:
- Use professional business language
- Include SWOT table
- Include recommendation points
`,
    },
    {
      icon: "📊",
      title: "Market Research",
      desc: "Industry and market analysis.",
      prompt: `
Create a MARKET RESEARCH REPORT in this exact format:

# Market Overview
# Target Audience
# Market Size and Trends
# Customer Needs
# Competitor Analysis
# Opportunities
# Threats
# Marketing Strategy
# Conclusion

Rules:
- Use tables for competitors
- Use bullet points
- Keep it industry-focused
`,
    },
    {
      icon: "🧾",
      title: "Technical Report",
      desc: "Technical documentation.",
      prompt: `
Create a TECHNICAL REPORT in this exact format:

# Technical Summary
# System Overview
# Architecture
# Technologies Used
# Workflow
# Implementation Details
# Testing
# Deployment
# Limitations
# Conclusion

Rules:
- Use technical but simple language
- Add workflow steps
- Add architecture explanation
`,
    },
    {
      icon: "📘",
      title: "Project Report",
      desc: "College project documentation.",
      prompt: `
Create a COLLEGE PROJECT REPORT in this exact format:

# Project Title
# Introduction
# Objectives
# Scope of Project
# Software Requirement Specification
# Hardware and Software Requirements
# Technology Used
# System Design
# Project Modules
# Testing
# Deployment
# Future Scope
# Conclusion

Rules:
- Suitable for BCA/BTech project report
- Simple professional English
- Add tables where useful
`,
    },
    {
      icon: "📋",
      title: "Case Study",
      desc: "Detailed case analysis.",
      prompt: `
Create a CASE STUDY REPORT in this exact format:

# Case Title
# Background
# Problem Statement
# Objectives
# Proposed Solution
# Implementation
# Results
# Challenges
# Lessons Learned
# Conclusion

Rules:
- Explain problem and solution clearly
- Use practical examples
- Add result summary table
`,
    },
  ];

  const getErrorMessage = (error) => {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }

    if (typeof detail === "object" && detail !== null) {
      return JSON.stringify(detail);
    }

    if (error?.response?.status === 401) {
      return "Unauthorized. Please login again.";
    }

    if (error?.response?.status === 422) {
      return "Request validation failed. Topic may be too long. Please try a shorter topic.";
    }

    return detail || "Report generation failed. Please check backend.";
  };

  const useTemplate = (template) => {
    setSelectedTemplate(template);
    setTopic("");
    setResult("");
    setMessage("");
  };

  const generateReport = async () => {
    if (!selectedTemplate) {
      setMessage("Please select a template first.");
      return;
    }

    if (!topic.trim()) {
      setMessage("Please enter a topic.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setResult("");

      const finalTopic = `
${selectedTemplate.title} report on ${topic}

Required Format:
${selectedTemplate.prompt}
`;

      const response = await API.post("/research", {
        topic: finalTopic.slice(0, 3000),
      });

      setResult(response.data.report || "No report generated.");
      setMessage("Report generated successfully.");
    } catch (error) {
      console.error(error);
      setMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const downloadText = () => {
    if (!result) return;

    const blob = new Blob([result], {
      type: "text/plain",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedTemplate?.title || "report"}.txt`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="mb-7">
        <h2 className="text-3xl font-bold">Smart Report Templates</h2>
        <p className="mt-1 text-slate-400">
          Choose a template to generate structured reports.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-2xl border border-pink-500/30 bg-pink-500/10 px-5 py-3 text-sm text-pink-100">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {templates.map((template) => (
          <div
            key={template.title}
            className={`rounded-3xl border p-6 text-center shadow-xl ${
              selectedTemplate?.title === template.title
                ? "border-pink-500/60 bg-pink-900/20"
                : "border-pink-500/20 bg-white/5"
            }`}
          >
            <div className="text-4xl">{template.icon}</div>

            <h3 className="mt-4 font-bold">{template.title}</h3>

            <p className="mt-2 text-sm text-slate-400">{template.desc}</p>

            <button
              onClick={() => useTemplate(template)}
              className="mt-5 rounded-xl bg-linear-to-r from-pink-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold"
            >
              Use Template
            </button>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-2xl font-bold">
            {selectedTemplate.icon} {selectedTemplate.title}
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Enter your topic and generate a professional report.
          </p>

          <input
  id="agent-topic"
  name="agent-topic"
  value={topic}
  onChange={(e) => setTopic(e.target.value)}
  placeholder="Example: NeuroFlow AI Multi-Agent Autonomous Research Assistant"
  autoComplete="off"
  className="mt-5 w-full rounded-2xl border border-white/10 bg-[#111124] px-5 py-4 outline-none placeholder:text-slate-500"
/>
          <button
            onClick={generateReport}
            disabled={loading}
            className="mt-5 rounded-2xl bg-linear-to-r from-emerald-500 to-green-600 px-8 py-3 font-bold disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold">Generated Report</h3>

            <button
              onClick={downloadText}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm hover:bg-white/15"
            >
              Download TXT
            </button>
          </div>

          <pre className="max-h-130 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-black/30 p-5 text-sm leading-7 text-slate-200">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}