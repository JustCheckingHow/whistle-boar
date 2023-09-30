from flask import Response, request, session
from twilio.twiml.voice_response import VoiceResponse
import os

def _tts(text):
    lang = session.get('language', 'pl-PL')
    resp = VoiceResponse()
    resp.say(text, language=lang, voice=f"Google.{lang}-Wavenet-B")
    return resp

def openai_call(messages, model, temperature=0.0):
    import openai
    openai.api_key = os.getenv("OPENAI_API_KEY")
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature
    ).choices[0]['message']['content']
    return response