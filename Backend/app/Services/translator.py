from deep_translator import GoogleTranslator

def TranslateText(text : str, targetLang : str, sourceLang : str = "auto") -> str:
    """
    Translate the text to the target language. If the translation API fails
    for any reason (network issue, unsupported language code, rate limit etc.)
    this falls back to returning the ORIGINAL text
    instead of crashing the request — a failed translation should
    never mean a lost message.
    """

    try:
        translated = GoogleTranslator(source = sourceLang, target = targetLang).translate(text)
        if not translated:
            return text
        return translated
    except Exception:
        return text