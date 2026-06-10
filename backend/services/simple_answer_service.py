def is_simple_question(topic: str) -> bool:
    
    text = topic.lower().strip()

    simple_patterns = [
        "my name is",
        "what is my name",
        "who am i",
        "hello",
        "hi",
        "hey",
        "how are you",
        "what is your name",
        "who are you"
    ]

    for pattern in simple_patterns:
        if pattern in text:
            return True

    if len(text.split()) <= 4 and "?" not in text:
        return True

    return False


def generate_simple_answer(topic: str) -> str:

    text = topic.lower().strip()

    if "my name is" in text:
        name = topic.split("is")[-1].strip().title()

        return f"""
# Answer

Your name is **{name}**.
"""

    if "what is my name" in text:
        return """
# Answer

I don't know your name yet. Please tell me by saying: **My name is ...**
"""

    if "who are you" in text or "what is your name" in text:
        return """
# Answer

I am **NeuroFlow AI**, your multi-agent research assistant.
"""

    if text in ["hi", "hello", "hey"]:
        return """
# Answer

Hello! How can I help you today?
"""

    return f"""
# Answer

You said: **{topic}**

Please ask a research topic if you want a detailed report.
"""