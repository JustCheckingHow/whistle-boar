from app import app
from flask import request, jsonify, session
from utils import _tts

@app.route("/access", methods=['GET', 'POST'])
def access():
    app.logger.info("AccessYourHeart: call from %s", request.values.get('From', ""))

    greeting = "Witaj w Access Your Heart. W czym mogę pomóc?"
    resp = _tts(greeting)
    resp.gather(action='access',
                language="pl-PL",
                speech_model="experimental_utterances",
                input="speech",
                speech_timeout="auto")

    return str(resp)