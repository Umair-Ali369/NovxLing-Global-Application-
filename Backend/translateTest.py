from app.Services.translator import TranslateText

print(TranslateText("Hello, how are you?", targetLang = "ur"))
print(TranslateText("Hello, I love you", targetLang = "ja"))
print(TranslateText("", targetLang="ur"))
