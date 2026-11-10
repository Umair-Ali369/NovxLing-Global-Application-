import os
from groq import Groq
from dotenv import load_dotenv
from app.Services.translator import TranslateText

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Bigger model for the tutor, separate from the translator's model.
TUTOR_MODEL = "openai/gpt-oss-120b"

LANGUAGE_RULE = """
IMPORTANT: The student may write in any language (Urdu, Arabic, Hindi, etc.).
Understand the question, but ALWAYS write your entire answer in English.
Never answer in the student's language - a separate system translates it afterwards.
"""

FOLLOW_UP_RULE = """
If the student asks you to explain something again, simpler, shorter, or in more detail,
follow that request even if it differs from your usual style.
"""

SIMPLE_TUTOR_PROMPT = """
You are a patient, friendly tutor explaining things to a complete beginner.
Use simple everyday words, one real-world analogy, and short sentences.
Avoid jargon. If you must use a technical term, explain it immediately in plain language.
Keep the answer between 150 and 250 words. Use a short numbered list only if the topic is a process.
End with a one-sentence summary.
""" + LANGUAGE_RULE + FOLLOW_UP_RULE

DEEP_TUTOR_PROMPT = """
You are a knowledgeable tutor giving a precise, technically accurate explanation
to a student with some background. Use correct terminology and explain mechanisms,
assumptions and edge cases. Do not use beginner analogies.
Be focused: cover the core mechanism in depth instead of listing every related topic.
Keep math to the essential formulas only.
Aim for 350 to 500 words, organized under 3 to 5 short headings.
Finish with one line on what to study next.
""" + LANGUAGE_RULE + FOLLOW_UP_RULE


def AskTutor(question: str, depth: str, userLanguage: str, history: list | None = None) -> dict:
    isDeep = depth == "deep"
    systemPrompt = DEEP_TUTOR_PROMPT if isDeep else SIMPLE_TUTOR_PROMPT

    try:
        response = client.chat.completions.create(
            model=TUTOR_MODEL,
            messages=[
                {"role": "system", "content": systemPrompt},
                *(history or []),
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