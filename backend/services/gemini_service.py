import os
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

load_dotenv()

async def generate_with_gemini(topic: str, analysis_brief: str = ""):

    prompt = f"""
You are a professional AI research report writer.

Create a detailed, visually structured research report.

Topic:
{topic}

Research Brief:
{analysis_brief or "No brief provided."}

Required markdown format:

# 🧠 Executive Summary

Write a clear summary in 1-2 paragraphs.

# 🔍 Key Findings

- Finding 1
- Finding 2
- Finding 3
- Finding 4

# 📊 Technical Analysis

Explain the topic in simple but professional language.

# 📋 Comparison / Summary Table

Create a markdown table if useful.

Example:

| Aspect | Details |
|---|---|
| Definition | Explain clearly |
| Use Cases | Mention examples |
| Benefits | Mention benefits |
| Limitations | Mention limitations |

# ⚠️ Risks and Challenges

- Risk 1
- Risk 2
- Risk 3

# ✅ Recommendations

1. Recommendation 1
2. Recommendation 2
3. Recommendation 3

# 📌 Conclusion

Write a short conclusion.

# 📚 Sources

Mention:
- Web research
- Uploaded PDF context, if available

Rules:
- Use markdown only.
- Use emojis in headings.
- Use bullet points.
- Use numbered lists.
- Use tables whenever comparison, features, pros/cons, tools, technologies, steps, risks or evaluation is needed.
- Bold important words.
- Keep language professional and presentation-ready.
"""

    from services.llm_router import ask_llm

    response = await ask_llm(prompt)

    if response:
        return response

    return f"""
# 🧠 Executive Summary

Research was completed for **{topic}**.

# 🔍 Key Findings

- Information was collected successfully.
- The topic was processed through NeuroFlow AI.
- Report generation used fallback mode.

# 📊 Technical Analysis

The system attempted to generate a detailed AI-powered report using available AI providers.

# 📋 Summary Table

| Section | Status |
|---|---|
| Topic | {topic} |
| AI Analysis | Fallback Mode |
| Report | Generated |

# ⚠️ Risks and Challenges

- AI provider may be unavailable.
- API quota may be exhausted.

# ✅ Recommendations

1. Try again after some time.
2. Use Ollama local model for stable demo.
3. Keep Groq and Gemini as fallback providers.

# 📌 Conclusion

NeuroFlow AI successfully generated a fallback report.

# 📚 Sources

- NeuroFlow AI fallback system
"""