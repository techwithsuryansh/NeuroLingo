from flask import Flask, render_template, request, jsonify
import requests
import os

app = Flask(__name__)

# Languages shown in dropdown
LANGUAGES = [
    {"code": "auto", "name": "Auto Detect"},
    {"code": "ar", "name": "Arabic"},
    {"code": "bn", "name": "Bengali"},
    {"code": "zh", "name": "Chinese"},
    {"code": "en", "name": "English"},
    {"code": "fr", "name": "French"},
    {"code": "de", "name": "German"},
    {"code": "gu", "name": "Gujarati"},
    {"code": "hi", "name": "Hindi"},
    {"code": "it", "name": "Italian"},
    {"code": "ja", "name": "Japanese"},
    {"code": "ko", "name": "Korean"},
    {"code": "mr", "name": "Marathi"},
    {"code": "pa", "name": "Punjabi"},
    {"code": "pt", "name": "Portuguese"},
    {"code": "ru", "name": "Russian"},
    {"code": "es", "name": "Spanish"},
    {"code": "ta", "name": "Tamil"},
    {"code": "te", "name": "Telugu"},
    {"code": "ur", "name": "Urdu"}
]


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/languages")
def languages():
    return jsonify({"languages": LANGUAGES})


@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()
    text = data.get("text")
    source = data.get("source", "auto")
    target = data.get("target", "hi")

    if not text:
        return jsonify({"translated_text": ""})

    lang_pair = f"autodetect|{target}" if source == "auto" else f"{source}|{target}"

    try:
        response = requests.get(
            "https://api.mymemory.translated.net/get",
            params={"q": text, "langpair": lang_pair}
        )
        result = response.json()
        translated = result["responseData"]["translatedText"]
        return jsonify({"translated_text": translated})

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"translated_text": "Translation service unavailable"})


@app.route("/health")
def health():
    return "OK"

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)