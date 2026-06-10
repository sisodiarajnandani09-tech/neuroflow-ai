import os
from dotenv import load_dotenv
from ollama import AsyncClient

load_dotenv()

client = AsyncClient()


async def generate_with_ollama(prompt: str):

    model = os.getenv(
        "OLLAMA_MODEL",
        "qwen2.5:3b"
    )

    response = await client.chat(
        model=model,
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    return response["message"]["content"]