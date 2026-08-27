import os
from groq import Groq
from groq import RateLimitError, APIError
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Maps language codes to full names - the AI understands "Urdu" much
# more reliably than the raw code "ur" in a prompt.
LANGUAGE_NAMES = {
    "en": "English",
    "ur": "Urdu",
    "ja": "Japanese",
    "ar": "Arabic",
    "fr": "French",
    "es": "Spanish",
    "zh": "Chinese",
    "hi": "Hindi",
    "de": "German",
}


def TranslateText(text: str, targetLang: str, sourceLang: str = "auto") -> str:
    """
    Translates text using Groq/Llama instead of GoogleTranslator, since
    the unofficial Google web-scraping approach started failing with
    500 errors (Google-side, not something we can fix). This uses the
    same Groq client already set up for the AI tutor - no new dependency.

    Falls back to the ORIGINAL text if the AI call fails for any reason
    (rate limit, network issue, etc) - a failed translation should never
    mean a lost message, same principle as before.
    """
    if not text or not text.strip():
        return text

    targetLanguageName = LANGUAGE_NAMES.get(targetLang, targetLang)

    try:
        response = client.chat.completions.create(
            model="groq/compound-mini",
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
            max_tokens=500,
            temperature=0.3,  # lower temperature - we want consistent, literal
                              # translation, not creative variation
        )
        translated = response.choices[0].message.content.strip()
        return translated if translated else text

    except RateLimitError:
        # Groq's free tier has request limits - this is the specific
        # case Umair wants a clear message for, not a silent fallback.
        return f"[Translation temporarily unavailable - rate limit reached, please try again shortly] {text}"

    except (APIError, Exception):
        # Any other failure (network, API down, etc) - degrade gracefully,
        # same principle as the original GoogleTranslator version.
        return text
