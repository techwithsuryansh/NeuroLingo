from flask import Flask, render_template, request, jsonify
from transformers import M2M100ForConditionalGeneration, M2M100Tokenizer
import fasttext

app = Flask(__name__)

print("Loading translation model...")
model_name = "facebook/m2m100_418M"
tokenizer = M2M100Tokenizer.from_pretrained(model_name)
model = M2M100ForConditionalGeneration.from_pretrained(model_name)
print("Model loaded!")

lang_model = fasttext.load_model("lid.176.bin")

supported_langs = sorted(tokenizer.lang_code_to_id.keys())

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "fr": "French", "es": "Spanish",
    "de": "German", "it": "Italian", "pt": "Portuguese", "ru": "Russian",
    "zh": "Chinese", "ja": "Japanese", "ko": "Korean", "ar": "Arabic",
    "bn": "Bengali", "ur": "Urdu", "ne": "Nepali", "ta": "Tamil",
    "te": "Telugu", "ml": "Malayalam", "mr": "Marathi",
    "gu": "Gujarati", "pa": "Punjabi", "tr": "Turkish",
    "nl": "Dutch", "pl": "Polish"
}

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/languages")
def languages():
    langs = [{"code": code, "name": name}
             for code, name in LANGUAGE_NAMES.items()]

    # sort alphabetically by language name
    langs = sorted(langs, key=lambda x: x["name"])

    # add Auto Detect at the top
    langs.insert(0, {"code": "auto", "name": "Auto Detect"})

    return jsonify({"languages": langs})

@app.route("/translate", methods=["POST"])
def translate():
    data = request.get_json()
    text = data["text"]
    src = data["source"]
    tgt = data["target"]

    if not text.strip():
        return jsonify({"translated_text": ""})

    if src == "auto":
        prediction = lang_model.predict(text)
        src = prediction[0][0].replace("__label__", "")
        if src not in supported_langs:
            src = "en"

    tokenizer.src_lang = src
    encoded = tokenizer(text, return_tensors="pt")

    generated = model.generate(
        **encoded,
        forced_bos_token_id=tokenizer.get_lang_id(tgt)
    )

    translated = tokenizer.decode(generated[0], skip_special_tokens=True)

    return jsonify({"translated_text": translated})

if __name__ == "__main__":
    app.run(debug=True)