from app import app
from flask import request, session
from utils import _tts, openai_call
import os
import requests

GREETING = "Witaj w systemie GWIZD. Czy spotkało Cię jakieś dzikie zwierzę?"
SYSTEM = """
Jesteś konsultantem w systemie GWIZD, który służy do zbierania informacji o incydentach związanych z dzikimi zwierzętami.
Rozmówca poda Ci informacje na temat incydentu. Powinieneś zebrać je oraz podać informacje o tym, jakie działania należy podjąć.

Pamiętaj, że rozmawiacie przez telefon, więc Twoje odpowiedzi powinny być krótkie i zwięzłe.

Rules of answering:
 1. Never mention that you're an AI
 2. Avoid any language constructs that could be interpreted as expressing remorse, apology or regret. This includes any phrases containing words like 'sorry', 'apologies', 'regret' etc.
 3. Refrain from disclaimers about you not being a professional or expert
 4. Keep responses unique and ree of repetitions
 5. Never suggest seeking information elsewhere

Jeżeli uznasz że rozmowa została zakończona, dodaj do swojej odpowiedzi słowo '<KONIEC>'. Wtedy system zakończy rozmowę. Zrób to dopiero kiedy użytkownik potwierdzi że nie ma nic więcej do dodania.

===

WAŻNE: Twoja wypowiedź powinna mieć format '<WYPOWIEDŹ> | <NOWOUZYSKANA INFORMACJA>:<INFORMACJA> | <NOWOUZYSKANA INFORMACJA 2>:<INFORMACJA 2> '. /<NIE> oznacza, czy użytkownik uzupełnił w swojej odpowiedzi jakąś z informacji których potrzebujesz. Jeżeli użytkownik nie podał żadnej informacji, nie uzupełniaj pola `NOWOUZYSKANA INFORMACJA`. 
Nie rób podsumowania rozmowy, podaj tylko informację uzyskaną bezpośrednio w poprzedniej odpowiedzi.


Przykład 1:
 - System: Data that is still needed: ["gatunek zwierzęta", "lokalizacja", "zachowanie"]
 - Użytkownik: Tak, spotkałem dzika
 - Asystent: gdzie dokładnie był? | gatunek zwierzęcia: dzik

Przykład 2:
 - System: Data that is still needed: ["gatunek zwierzęta", "lokalizacja", "zachowanie"]
 - Użytkownik: Oczywiście, to jest Kraków, ul. Karmelicka 2. To był dzik.
 - Asystent: jak się zachowywał? | lokalizacja: Kraków ul. Karmelicka 2 | gatune zwierzęcia: dzik

Przykład 3:
 - System: Data that is still needed: ["gatunek zwierzęta", "lokalizacja", "zachowanie"]
 - Użytkownik: Tak, stał na drodze tamując ruch
 - Asystent: Gdzie dokładnie się znajdujecie? | zachowanie: stoi na drodze tamując ruch

Przykład 4:
 - System: Data that is still needed: ["lokalizacja", "zachowanie"]
 - Użytkownik: To było we Wrocławiu
 - Asystent: Czy możesz podać dokładną lokalizację?
 - Użytkownik: Tak, to było na ulicy Świdnickiej
 - Asystent: Jak się zachowywał? |  lokalizacja: Wrocław, ul. Świdnicka

Przykład 5:
 - System: Data that is still needed: ["gatunek zwierzęta", "lokalizacja"]
 - Użytkownik: Spotkałem łosia
 - Asystent: Gdzie dokładnie był? | gatunek zwierzęcia: łoś

Lokalizacja *musi* zawierać miasto i ulicę, a zachowanie musi być krótkim opisem tego, co robiło zwierzę. Jeżeli użytkownik nie był precyzyjny, możesz zapytać o to jeszcze raz.
Użytkownik musi podać lokalizację tak, żeby dało się ją znaleźć na mapie google. Jeżeli podał tylko miasto albo tylko ulicę, nie uzupełniaj pola "lokalizacja".
"""

@app.route("/voice", methods=['GET', 'POST'])
def voice():
    app.logger.info("Call from %s", request.values.get('From', ""))
    session["conversation"] = [
        {"role": "system", "content": SYSTEM},
        {"role": "assistant", "content": GREETING}
    ]
    session["gathered_info"] = {}
    session["address_confirmed"] = False

    resp = _tts(GREETING)
    # resp.say("You can answer in your own language", language="en-US", voice=f"Google.en-US-Wavenet-B")
    resp.gather(action='main_loop', language="pl-PL", speech_model="experimental_utterances", input="speech", speech_timeout="auto")

    return str(resp)


@app.route("/main_loop", methods=['GET', 'POST'])
def main_loop():
    speech_result = request.values.get('SpeechResult', "")
    session["conversation"].append({"role": "user", "content": speech_result})
    gathered_info = session["gathered_info"]

    gathered_already = gathered_info.keys()
    to_gather = [i for i in ["gatunek zwierzęta", "lokalizacja", "zachowanie"] if i not in gathered_already]

    response = openai_call(session["conversation"], "gpt-4")
    session["conversation"].append({"role": "assistant", "content": response})
    app.logger.info("Response from data extraction: %s", response)

    gathered = response.split("|")[1:]
    for row in gathered:
        try:
            key, value = row.split(":")
            if key.strip() in gathered_info:
                gathered_info[key.strip()] += f", {value.strip()}"
            else:
                gathered_info[key.strip()] = value.strip()
        except ValueError:
            pass
    app.logger.info("Gathered info: %s", gathered_info)
    session["gathered_info"] = gathered_info

    gathered_already = gathered_info.keys()
    to_gather = [i for i in ["gatunek zwierzęta", "lokalizacja", "zachowanie"] if i not in gathered_already]

    session["conversation"].append({"role": "system", "content": "Data gathered so far: " + str(gathered_info)})
    session["conversation"].append({"role": "system", "content": "Data that is still needed: " + str(to_gather) + ". Please ask for it."})
    text_response = response.split("|")[0].strip()

    if "lokalizacja" in gathered_info and not session["address_confirmed"]:
        app.logger.info("Asking for address confirmation")
        resp = _tts('')
        resp.enqueue(action='validate_address')
        return str(resp)

    if '<KONIEC>' in response:
        app.logger.info("Conversation ended")
        resp = _tts(text_response)
        resp.hangup()
        return str(resp)
    
    app.logger.info("Text response: %s", text_response)

    resp = _tts(text_response)
    resp.gather(action='main_loop', language="pl-PL", speech_model="experimental_utterances", input="speech", speech_timeout="auto")

    return str(resp)


@app.route("/validate_address", methods=['GET', 'POST'])
def validate_address():
    app.logger.info("Validating address")
    address = session["gathered_info"]["lokalizacja"]

    try:
        text = request.values["SpeechResult"]

        if "tak" in text.lower():
            session["address_confirmed"] = True
            resp = _tts("Świetnie, lokalizacja została potwierdzona.")
            resp.enqueue(action='main_loop')
            return str(resp)
        else:
            resp = _tts('Czy możesz podać poprawną lokalizację?')

            gathered = session["gathered_info"]
            del gathered["lokalizacja"]
            session["gathered_info"] = gathered

            resp.gather(action='main_loop', language="pl-PL", speech_model="experimental_utterances", input="speech", speech_timeout="auto")
            return str(resp)
    except KeyError:
        url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key=" + os.environ["GOOGLE_KEY"]
        response = requests.get(url)

        formatted = response.json()['results'][0]['formatted_address']

        resp = _tts(f"Czy to jest poprawny adres: {formatted}?")
        resp.gather(action='validate_address', language="pl-PL", speech_model="experimental_utterances", input="speech", speech_timeout="auto")

        return str(resp)