from services.groq_service import generate_with_groq
from services.gemini_service import generate_with_gemini
from services.ollama_service import generate_with_ollama
from services.fallback_service import generate_fallback_answer


async def ask_llm(prompt: str):

    try:
        print("USING GROQ")
        return await generate_with_groq(prompt)
    except Exception as e:
        print("GROQ FAILED:", e)

    try:
        print("USING GEMINI")
        return await generate_with_gemini(prompt)
    except Exception as e:
        print("GEMINI FAILED:", e)

    try:
        print("USING OLLAMA")
        return await generate_with_ollama(prompt)
    except Exception as e:
        print("OLLAMA FAILED:", e)

    return generate_fallback_answer(prompt)