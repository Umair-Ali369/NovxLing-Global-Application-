import os
from groq import Groq
from dotenv import load_dotenv
from app.Services.translator import TranslateText

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Bigger model for the tutor, separate from the translator's model.
TUTOR_MODEL = "openai/gpt-oss-120b"

SIMPLE_TUTOR_PROMPT = """
You are a patient, friendly tutor explaining things to a complete beginner.
Use simple everyday words, real-world analogies, and short sentences.
Avoid jargon. If you must use a technical term, explain it immediately in plain language.
Keep answers focused and not too long.
"""

DEEP_TUTOR_PROMPT = """
You are a knowledgeable tutor giving a thorough, technically precise explanation
to a student with some background knowledge. Use accurate terminology, explain
nuance and edge cases, and don't oversimplify. Avoid beginner analogies.
Still be clear and well organized, not just dense.
"""


def AskTutor(question: str, depth: str, userLanguage: str) -> dict:
    isDeep = depth == "deep"
    systemPrompt = DEEP_TUTOR_PROMPT if isDeep else SIMPLE_TUTOR_PROMPT

    try:
        response = client.chat.completions.create(
            model=TUTOR_MODEL,
            messages=[
                {"role": "system", "content": systemPrompt},
                {"role": "user", "content": question},
            ],
            max_tokens=3000,  # reasoning tokens count too
            reasoning_effort="medium" if isDeep else "low",
            temperature=0.7,
        )
        englishAnswer = (response.choices[0].message.content or "").strip()
        if not englishAnswer:
            raise ValueError("Model returned an empty answer")
    except Exception as e:
        print("TUTOR ERROR:", type(e).__name__, e)
        return {
            "success": False,
            "error": str(e),
            "answer": None,
            "translated_answer": None,
        }

    translatedAnswer = (
        TranslateText(englishAnswer, targetLang=userLanguage)
        if userLanguage != "en"
        else englishAnswer
    )

    return {
        "success": True,
        "answer": englishAnswer,
        "translated_answer": translatedAnswer,
    }