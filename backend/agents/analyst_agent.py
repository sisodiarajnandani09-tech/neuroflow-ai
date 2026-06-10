from agents.state import ResearchState

from services.llm_router import (
    ask_llm
)


class AnalystAgent:

    async def run(
        self,
        state: ResearchState
    ):

        state.update_step(
            "analyst_agent"
        )

        state.append_log(
            "Analyst Agent Started"
        )

        web_data = ""

        for source in state.search_results:

            web_data += f"""
TITLE:
{source.get("title")}

CONTENT:
{source.get("content")}
"""

        try:

            prompt = f"""
You are a Senior Research Analyst.

Topic:
{state.topic}

Web Research:
{web_data}

PDF Context:
{state.pdf_context}

Tasks:

1. Remove duplicate information
2. Identify key findings
3. Identify trends
4. Identify risks
5. Create structured research brief

Return detailed markdown.
"""

            analysis = await ask_llm(
                prompt
            )

            if not analysis:

                raise Exception(
                    "Analysis generation failed"
                )

            state.analysis_brief = (
                analysis
            )

            state.append_log(
                "Analysis Brief Generated"
            )

            return state

        except Exception as e:

            state.append_log(
                f"Analysis Error: {str(e)}"
            )

            state.analysis_brief = f"""
# Research Brief

Topic:
{state.topic}

## Key Findings

Research data collected successfully.

## Trends

Unable to generate AI analysis.

## Risks

LLM services unavailable.

## Recommendation

Retry later.
"""

            return state