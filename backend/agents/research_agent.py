from agents.state import ResearchState

from services.tavily_service import search_web

from services.llm_router import ask_llm

from utils.source_cleaner import clean_results


class ResearchAgent:

    async def run(
        self,
        state: ResearchState
    ):

        state.update_step(
            "research_agent"
        )

        state.append_log(
            "Research Agent Started"
        )

        try:

            prompt = f"""
Improve the following research query.

Return only the improved query.

Topic:
{state.topic}
"""

            optimized_query = await ask_llm(
                prompt=prompt,
                topic=state.topic
            )

            if not optimized_query:

                optimized_query = (
                    state.topic
                )

            state.append_log(
                f"Optimized Query: {optimized_query}"
            )

            search_response = search_web(
                optimized_query
            )

            results = []

            for item in search_response.get(
                "results",
                []
            ):

                results.append(
                    {
                        "title": item.get(
                            "title",
                            ""
                        ),
                        "url": item.get(
                            "url",
                            ""
                        ),
                        "content": item.get(
                            "content",
                            ""
                        )
                    }
                )

            state.search_results = clean_results(
                results
            )

            state.append_log(
                f"Collected {len(state.search_results)} sources"
            )

            return state

        except Exception as e:

            state.append_log(
                f"Search Error: {str(e)}"
            )

            return state