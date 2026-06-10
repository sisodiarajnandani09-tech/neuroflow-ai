from agents.state import ResearchState

from services.llm_router import (
    ask_llm
)


class WriterAgent:

    async def run(
        self,
        state: ResearchState
    ):

        state.update_step(
            "writer_agent"
        )

        state.append_log(
            "Writer Agent Started"
        )

        try:

            prompt = f"""
You are a professional AI research report writer.

Create a premium, well-structured research report.

Topic:
{state.topic}

Research Brief:
{state.analysis_brief}

Use this exact markdown format:

 🧠 Executive Summary

Write a clear 1-2 paragraph summary.

 🔍 Key Findings

- Important finding 1
- Important finding 2
- Important finding 3
- Important finding 4

 📊 Technical Analysis

Explain the topic in detail using simple but professional language.

 ⚠️ Risks and Challenges

- Risk 1
- Risk 2
- Risk 3

 ✅ Recommendations

- Recommendation 1
- Recommendation 2
- Recommendation 3

 📚 Sources

Mention sources or write: Web search and uploaded PDF context.
Format Rules:
- Use markdown.
- Use emojis in major headings.
- Use bullet points for findings.
- Use numbered steps for processes.
- Use markdown tables whenever comparison, features, tools, pros/cons, risks, or evaluation is needed.
- Add a clean conclusion.
- Make the report presentation-ready.

Required sections:
# 🧠 Executive Summary
# 🔍 Key Findings
# 📊 Technical Analysis
# 📋 Comparison / Summary Table
# ⚠️ Risks and Challenges
# ✅ Recommendations
# 📌 Conclusion
# 📚 Sources
"""
            report = await ask_llm(
                prompt
            )

            if not report:

                raise Exception(
                    "All LLMs Failed"
                )

            state.draft_report = report

            state.append_log(
                "Draft Report Generated"
            )

            return state

        except Exception as e:

            state.append_log(
                f"Writer Error: {str(e)}"
            )

            state.draft_report = f"""
 🧠 Executive Summary

Research Topic:
{state.topic}

~ Key Findings

Fallback Mode Activated

~ Technical Analysis

AI services unavailable.

~ Risks

External provider unavailable.

~ Recommendations

Retry later.

~ Sources

Web Search Results
"""

            return state