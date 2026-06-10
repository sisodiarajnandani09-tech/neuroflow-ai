from services.llm_router import ask_llm


async def classify_intent(message: str):

    prompt = f"""
You are NeuroFlow AI intent router.

Understand any language:
English, Hindi, Hinglish, mixed language.

Classify the user message.

CHAT:
Normal conversation, greeting, personal question, user tells name, casual help.

RESEARCH:
Detailed explanation, report generation, PDF analysis, summary, comparison, technical topic, academic topic.

Message:
{message}

Return only one word:
CHAT
or
RESEARCH
"""

    result = await ask_llm(prompt)

    if not result:
        return "CHAT"

    result = result.strip().upper()

    if "RESEARCH" in result:
        return "RESEARCH"

    return "CHAT"


async def generate_chat_answer(message: str):

    prompt = f"""
You are NeuroFlow AI, a ChatGPT-style assistant.

Rules:
- Reply in the same language as the user.
- Understand English, Hindi, Hinglish and mixed language.
- Be natural, helpful and conversational.
- Do not force research report format for casual chat.
- Use markdown formatting when useful.
- Use bullet points for lists.
- Use tables when comparison is asked.
- Use code blocks for code.
- Keep simple answers short.
- If user asks your identity, say you are NeuroFlow AI.

User message:
{message}
"""

    return await ask_llm(prompt)