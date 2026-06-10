from agents.state import ResearchState

from utils.report_validator import (
    validate_report
)

from services.llm_router import (
    ask_llm
)


class ManagerAgent:

    async def run(
        self,
        state: ResearchState
    ):

        state.update_step(
            "manager_agent"
        )

        state.append_log(
            "Manager Agent Started"
        )

        try:

            prompt = f"""
You are a senior research report editor.

Improve this report and make it presentation-ready.

Topic:
{state.topic}

Draft Report:
{state.draft_report}

Required final format:

# 🧠 Executive Summary

# 🔍 Key Findings

# 📊 Technical Analysis

# ⚠️ Risks and Challenges

# ✅ Recommendations

# 📚 Sources


Improve formatting:
- Preserve markdown tables.
- Preserve emojis in headings.
- Keep headings clear.
- Add bullet points where needed.
- Add a table if the report compares concepts or features.
- Do not remove useful details.

"""

            final_report = await ask_llm(
                prompt
            )

            if final_report:

                state.final_verified_report = (
                    final_report
                )

            else:

                state.final_verified_report = (
                    state.draft_report
                )

            missing = validate_report(
                state.final_verified_report
            )

            if missing:

                state.append_log(
                    f"Missing Sections: {missing}"
                )

            else:

                state.append_log(
                    "Final Report Verified"
                )

            return state

        except Exception as e:

            state.final_verified_report = (
                state.draft_report
            )

            state.append_log(
                f"Manager Error: {str(e)}"
            )

            return state