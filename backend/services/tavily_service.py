import os

from dotenv import load_dotenv
from tavily import TavilyClient

load_dotenv()

client = TavilyClient(
    api_key=os.getenv("TAVILY_API_KEY")
)


def search_web(query: str):

    response = client.search(
        query=query,
        search_depth="advanced",
        max_results=10,
        include_answer=True,
        include_raw_content=False
    )

    return response