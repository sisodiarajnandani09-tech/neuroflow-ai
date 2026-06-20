import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=os.getenv("GEMINI_API_KEY"),
    temperature=0.3
)


async def generate_with_gemini(prompt: str):
    try:
        response = await llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        print("Gemini error:", e)
        raise e