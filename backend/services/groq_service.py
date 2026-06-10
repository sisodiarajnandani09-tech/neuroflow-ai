import os
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage

load_dotenv()


async def generate_with_groq(prompt: str):

    llm = ChatGroq(
        model=os.getenv(
            "GROQ_MODEL",
            "llama-3.3-70b-versatile"
        ),
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.4,
        max_tokens=1800
    )

    response = await llm.ainvoke(
        [
            HumanMessage(content=prompt)
        ]
    )

    return response.content