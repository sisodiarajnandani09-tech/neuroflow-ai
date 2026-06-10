from agents.research_agent import ResearchAgent
from agents.analyst_agent import AnalystAgent
from agents.writer_agent import WriterAgent
from agents.manager_agent import ManagerAgent
from agents.state import ResearchState


class ResearchPipeline:

    def __init__(self):

        self.research_agent = ResearchAgent()

        self.analyst_agent = AnalystAgent()

        self.writer_agent = WriterAgent()

        self.manager_agent = ManagerAgent()

    async def run(
        self,
        topic: str,
        pdf_context: str = ""
    ):

        print("PIPELINE START")

        state = ResearchState(
            topic=topic,
            pdf_context=pdf_context
        )

        state = await self.research_agent.run(
            state
        )
        print("Research Agent Done")

        state = await self.analyst_agent.run(
            state
        )
        print("Analyst Agent Done")

        state = await self.writer_agent.run(
            state
        )
        print("Writer Agent Done")

        state = await self.manager_agent.run(
            state
        )
        print("Manager Agent Done")

        print("PIPELINE END")

        return state