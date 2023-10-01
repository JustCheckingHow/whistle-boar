import logging
import os
import re

import requests
from dataclasses import asdict
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (Application, CommandHandler, CallbackContext,
                          MessageHandler)
from telegram.ext.filters import LOCATION, PHOTO, TEXT
from bot_state import BotState, AnimalUpdate

load_dotenv()

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.DEBUG)

CONST_SPACE = "\n\n\n\n\n\n\n\n\n\n\n\n"
SERVER_API_ADDRS = 'api.gwizd.justcheckinghow.com'
builder = Application.builder()
builder.token(os.environ['TOKEN']).build()
application = builder.build()

bot_state = BotState()
animal_update = AnimalUpdate()


def form_api_request():
    print(f"""\n
            Animal Update:
            animal_type: {animal_update.animal_type}
            location_lat: {animal_update.location_lat}
            location_lon: {animal_update.location_lon}
            behaviour: {animal_update.behaviour}
            image: {animal_update.image}\n
            """)
    response = requests.post(url=f"https://{SERVER_API_ADDRS}/submit",
                             data={
                                 "location": "user_location",
                                 "location_lat": animal_update.location_lat,
                                 "location_lon": animal_update.location_lon,
                                 "animal_type": animal_update.animal_type,
                                 "condition": "",
                                 "behaviour": animal_update.behaviour,
                             })
    animal_update.reset()
    print()
    print("Response from server:")
    print(response.ok, response.status_code, response.text)
    print()
    return response


def escape_markdown(text):
    """
    Helper function to escape telegram markup symbols
    """
    text = text.replace('“', '_').replace('”', '_')
    escape_chars = '\[()+-.!~>=|'
    return re.sub(r'([%s])' % escape_chars, r'\\\1', text)


async def start_callback(update: Update, context: CallbackContext):
    animal_update.reset()
    bot_state.reset()
    msg = bot_state.next_state()
    bot_state.INFO_SHARED = True
    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text=escape_markdown(msg),
                                   parse_mode='MarkdownV2')


async def text_callback(update: Update, context: CallbackContext):
    print(f"Otrzymano tekst: {update.message.text}")
    user_says = update.message.text
    if user_says:
        if bot_state.STATE == "TYPE":
            animal_update.animal_type = user_says
            bot_state.TYPE_RECEIVED = True
        elif bot_state.STATE == "BEHAVIOUR":
            animal_update.behaviour = user_says
            bot_state.BEHAVIOUR_RECEIVED = True
        elif bot_state.STATE == "LOCATION":
            if 'nie' in user_says:
                animal_update.location_lat = 0.0
                animal_update.location_lon = 0.0
                bot_state.LOCATION_RECEIVED = True
        elif bot_state.STATE == "PHOTO":
            if 'nie' in user_says:
                animal_update.image = ""
                bot_state.PHOTO_RECEIVED = True
        if animal_update.is_done():
            form_api_request()
        msg = bot_state.next_state()
        await update.message.reply_text(escape_markdown(msg),
                                        parse_mode='MarkdownV2')
        return


async def location_handler(update: Update, context: CallbackContext):
    print()
    print(f"Otrzymano lokalizację: {update.message.location}")
    print()
    bot_state.LOCATION_RECEIVED = True
    lat = update.message.location.latitude
    lon = update.message.location.longitude
    animal_update.location_lat = lat
    animal_update.location_lon = lon
    msg = bot_state.next_state()
    if animal_update.is_done():
        form_api_request()
    await context.bot.sendMessage(chat_id=update.message.chat.id,
                                  text=escape_markdown(msg),
                                  parse_mode='MarkdownV2')


async def photo_handler(update: Update, context: CallbackContext):
    print("Otrzymano zdjęcie!")
    bot_state.PHOTO_RECEIVED = True
    if animal_update.is_done():
        form_api_request()
    msg = bot_state.next_state()
    await context.bot.sendMessage(chat_id=update.message.chat.id,
                                  text=escape_markdown(msg),
                                  parse_mode='MarkdownV2')


if __name__ == "__main__":
    # this is the function that will be called when the user sends a location

    # animal_update.reset()
    # animal_update.location_lat = 10
    # animal_update.location_lon = 20
    # animal_update.animal_type = "Kot"
    # animal_update.behaviour = "Biegał"
    # animal_update.image = "https://i.imgur.com/4M34hi2.jpeg"

    # form_api_request()
    application.add_handler(MessageHandler(LOCATION, location_handler))
    application.add_handler(MessageHandler(PHOTO, photo_handler))
    application.add_handler(CommandHandler("start", start_callback))
    application.add_handler(MessageHandler(TEXT, text_callback))

    application.run_polling()