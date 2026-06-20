from services.groq_service import generate_with_groq
from services.gemini_service import generate_with_gemini


async def ask_llm(prompt: str, model: str = "auto"):

    model = (model or "auto").lower()

    # Explicit model selection
    if model == "groq":
        return await generate_with_groq(prompt)

    if model == "gemini":
        return await generate_with_gemini(prompt)

    # AUTO MODE
    # 1. Groq (Fastest)
    try:
        print("Trying Groq...")
        response = await generate_with_groq(prompt)

        if response:
            print("Groq Success")
            return response

    except Exception as e:
        print("Groq Failed:", e)

    # 2. Gemini Fallback
    try:
        print("Trying Gemini...")
        response = await generate_with_gemini(prompt)

        if response:
            print("Gemini Success")
            return response

    except Exception as e:
        print("Gemini Failed:", e)

    return "AI model is currently unavailable."