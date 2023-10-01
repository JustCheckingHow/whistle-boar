from enum import IntEnum

from flask import jsonify, request, session

from app import app
from es_utils import create_es_instance, simple_query
from utils import _tts, openai_call
import os

es = create_es_instance()
app.secret_key = os.getenv("APP_SECRET")


class SessionState(IntEnum):
    ACCESS = 0,
    QUESTION1 = 1,
    QUESTION2 = 2,
    ANSWER = 3,
    SEND = 4,


def get_response(state: SessionState, input: str):
    if state == SessionState.ACCESS:
        return "Witaj w Search Now. Postaram się pomóc Ci znaleźć odpowiednią ścieżkę kariery! Na początku, muszę zadać Ci kilka pytań. Jesteś uczniem, studentem, czy pracujesz?"
    elif state == SessionState.QUESTION1:
        return "Jaki jest Twój cel zawodowy?"
    elif state == SessionState.QUESTION2:
        return "Jakie są Twoje zainteresowania?"
    elif state == SessionState.ANSWER:
        return "Czy chcesz, żebym wysłał Ci linki do stron, które mogą Ci pomóc?"
    elif state == SessionState.SEND:
        return "Wysyłam linki na Twój email. Powodzenia!"
    else:
        return "Nie rozumiem. Czy możesz powtórzyć?"


@app.route("/access", methods=['GET', 'POST'])
def access():
    app.logger.info("AccessYourHeart: call from %s",
                    request.values.get('From', ""))

    greeting = get_response(session.get('state', 0), None)

    resp = _tts(greeting)
    resp.gather(action='access',
                language="pl-PL",
                speech_model="experimental_utterances",
                input="speech",
                speech_timeout="auto")
    speech_result = request.values.get('SpeechResult', "")
    app.logger.info(f"Session state: {session}")

    if 'state' in session:
        session['state'] = session['state'] + 1
        session['responses'].append([greeting, speech_result])
        app.logger.info(f"Session state: {session}")
        if session['state'] == SessionState.SEND:
            dialog = ""
            for el in session['responses']:
                dialog += f"-Doradca: {el[0]}\n-Osoba: {el[1]}\n"
            input_str = f"""
            Jesteś doradcą zawodowym. Twoim zadaniem jest pomóc w wyborze ścieżki kariery.
            Zaproponuj same nazwy kierunków studiów na podstawie dialogu z klientem:
            {dialog}

            Pamiętaj by podawać tylko nazwy kierunków. Nie podawaj linków do stron internetowych.
            """
            convo = [{'role': "system", "content": input_str}]
            app.logger.info(f"Sent convo {convo} to OpenAI")
            ai_response = openai_call(convo, "gpt-3.5-turbo", 0.5)
            app.logger.info(f"Received response {ai_response}")
            query_input = [r.strip() for r in ai_response.split("-")]
            query_input = [r for r in query_input if r]
            app.logger.info(f"QUERY INPUT {query_input}")
            results = simple_query(es, query_input)
            app.logger.info(f"Received results {results}")
            session['state'] = 0
            session['responses'] = []
    else:
        session['state'] = 1
        session['responses'] = []
    return str(resp)