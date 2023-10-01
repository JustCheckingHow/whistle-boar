from app import app
from flask import request, jsonify, session
from utils import _tts
from enum import IntEnum

class SessionState(Enum):
    ACCESS = 0,
    QUESTION1 = 1,
    QUESTION2 = 2,
    ANSWER = 3,
    SEND = 4,

def get_response(state: SessionState, input: str):
    if state == SessionState.ACCESS:
        return  "Witaj w Search Now. Postaram się pomóc Ci znaleźć odpowiednią ścieżkę kariery! Na początku, muszę zadać Ci kilka pytań. Jesteś uczniem, studentem, czy pracujesz?"
    elif state == SessionState.QUESTION1:
        return "Jaki jest Twój cel zawodowy?"
    elif state == SessionState.QUESTION2:
        return "Jakie są Twoje zainteresowania?"
    elif state == SessionState.ANSWER:
        return "Czy chcesz, żebym wysłał Ci linki do stron, które mogą Ci pomóc?"
    elif state == SessionState.SEND:
        return "Wysyłam linki na Twój email. Powodzenia!"

    # return "Nie rozumiem. Czy możesz powtórzyć?"


        # return "Czy chcesz, żebym wysłał Ci linki do stron, które mogą Ci pomóc?"




@app.route("/access", methods=['GET', 'POST'])
def access():
    app.logger.info("AccessYourHeart: call from %s", request.values.get('From', ""))
    
    greeting = get_response(session)

    resp = _tts(greeting)
    resp.gather(action='access',
                language="pl-PL",
                speech_model="experimental_utterances",
                input="speech",
                speech_timeout="auto")

    session['state'] = session['state'] + 1

    return str(resp)