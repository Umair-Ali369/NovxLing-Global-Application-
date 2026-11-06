import os
from groq import Groq
from groq import RateLimitError
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Change the model here only. Must be a chat model your key can use
# (check with client.models.list()).
MODEL = "openai/gpt-oss-20b"

LANGUAGE_NAMES = {
    "en": "English", "ur": "Urdu", "ja": "Japanese", "ar": "Arabic",
    "fr": "French", "es": "Spanish", "zh": "Chinese", "hi": "Hindi", "de": "German",
}


def TranslateText(text: str, targetLang: str, sourceLang: str = "auto") -> str:
    if not text or not text.strip():
        return text

    targetLanguageName = LANGUAGE_NAMES.get(targetLang, targetLang)

    try:
        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are a translation engine. Translate the user's message "
                        f"into {targetLanguageName}. Reply with ONLY the translated "
                        f"text - no explanations, no quotes, no extra commentary."
                    ),
                },
                {"role": "user", "content": text},
            ],
            max_tokens=1500,          # reasoning tokens count too, so keep this generous
            reasoning_effort="low",   # translation doesn't need deep thinking
            temperature=0.3,
        )
        translated = (response.choices[0].message.content or "").strip()
        if not translated:
            print("GROQ TRANSLATE: empty response, falling back to original text")
            return text
        return translated

    except RateLimitError as e:
        print("GROQ RATE LIMIT:", e)
        return f"[Translation temporarily unavailable - rate limit reached, please try again shortly] {text}"

    except Exception as e:
        print("GROQ TRANSLATE ERROR:", type(e).__name__, e)
        return text