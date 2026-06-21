from flask import Flask, render_template, request, jsonify, send_from_directory
from deep_translator import GoogleTranslator
from functools import lru_cache
import time
import os

app = Flask(__name__)

# ================= CONFIG =================

app.config["MAX_CONTENT_LENGTH"] = 100000

SERVER_START = time.time()

translation_counter = 0

SUPPORTED_LANGUAGES = {

    "en","hi","pa","ur","bn",

    "gu","mr","ta","te","ml","kn",

    "fr","es","de","it","pt","nl",

    "ru","uk","pl","ar","tr","fa",

    "he","zh-CN","ja","ko","th",

    "vi","id","ms","el","sv",

    "fi","da","no"

}


# ================= HOME =================

@app.route("/")
def home():

    return render_template("index.html")


# ================= GOOGLE VERIFY =================

@app.route("/googled7d987b5b0e3d91d.html")
def google_verify():

    return send_from_directory(

        ".",

        "googled7d987b5b0e3d91d.html"

    )


# ================= HEALTH =================

@app.route("/health")
def health():

    uptime = round(

        time.time() - SERVER_START,

        1

    )

    return jsonify({

        "status": "online",

        "uptime_seconds": uptime

    })


# ================= STATS =================

@app.route("/stats")
def stats():

    uptime = round(

        time.time() - SERVER_START,

        1

    )

    return jsonify({

        "translations": translation_counter,

        "uptime_seconds": uptime,

        "cache_size": cached_translate.cache_info().currsize

    })


# ================= CACHE =================

@lru_cache(maxsize=1000)
def cached_translate(text, language):

    return GoogleTranslator(

        source="auto",

        target=language

    ).translate(text)


# ================= TRANSLATE =================

@app.route(

    "/translate",

    methods=["POST"]

)

def translate():

    global translation_counter

    try:

        data = request.get_json(

            silent=True

        )

        if not data:

            return jsonify({

                "translation": "",

                "speed": 0,

                "count": translation_counter,

                "error": "No data"

            }), 400

        text = str(

            data.get(

                "text",

                ""

            )

        ).strip()

        language = str(

            data.get(

                "language",

                "en"

            )

        ).strip()

        if not text:

            return jsonify({

                "translation": "",

                "speed": 0,

                "count": translation_counter

            })

        if len(text) > 5000:

            return jsonify({

                "translation": "Text too long.",

                "speed": 0,

                "count": translation_counter

            }), 400

        if language not in SUPPORTED_LANGUAGES:

            language = "en"

        start = time.time()

        translated = cached_translate(

            text,

            language

        )

        elapsed = round(

            time.time() - start,

            2

        )

        translation_counter += 1

        return jsonify({

            "translation": translated,

            "speed": elapsed,

            "count": translation_counter

        })

    except Exception:

        return jsonify({

            "translation": "Translation failed.",

            "speed": 0,

            "count": translation_counter

        }), 500


# ================= RUN =================

if __name__ == "__main__":

    app.run(

        host="0.0.0.0",

        port=int(

            os.environ.get(

                "PORT",

                5000

            )

        ),

        debug=False

    )
