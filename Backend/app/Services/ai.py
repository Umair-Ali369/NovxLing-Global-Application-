import os 
from groq import Groq
from dotenv import load_dotenv
from app.Services.translator import TranslateText

load_dotenv()

client = Groq(api_key = os.getenv("GROQ_API_KEY"))

SIMPLE_TUTOR_PROMPT = """ 
You are a patient , friendly tutor explaining thing to a complex beginner.
Use simple everyday words, real world analogies, and short sentences.
Avoid jorgon. If you must use a technical term, explain it immediately in plain language. 
Keep answer focused and not too long.
"""

DEEP_TUTOR_PROMPT = """
You are a knowledgeable tutor giving a through, technically precise explanation
to a student with some background knowledge. Use accurate terminologies, explalin 
naunce and edge case, and don't over simplify. Still be clear and well organized , not 
just dense.
"""

def AskTutor(question : str, depth : str , userLanguage : str) -> dict:
    """
    Sends a question to the AI tutor and returns both the English
    response and its translation into the user's language. If either
    the AI call or the translation fails, this degrades gracefully
    instead of crashing - a failed AI call should never mean the user
    gets nothing back.
    """
    systemPrompt = DEEP_TUTOR_PROMPT if depth == "deep" else SIMPLE_TUTOR_PROMPT

    try:
        response = client.chat.completions.create(
            model = "groq/compound-mini",
            messages = [
                {"role" : "system", "content" : systemPrompt},
                {"role" : "user", "content" : question},
            ],
            max_tokens = 600,
            temperature = 0.7
        )

        englishAnswer = response.choices[0].message.content
    except Exception as e:
        return {
            "success" : False,
            "error" : str(e),
            "answer" : None,
            "translated_answer" : None
        }
    
    translatedAnswer = TranslateText(englishAnswer, targetLang = userLanguage) if userLanguage != "en" else englishAnswer

    return {
        "success" : True,
        "answer" : englishAnswer,
        "translated_answer" : translatedAnswer
    }