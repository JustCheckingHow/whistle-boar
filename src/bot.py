import logging
import os
import re

import requests
from dotenv import load_dotenv
from telegram import Update
from telegram.ext import (Application, CommandHandler, CallbackContext,
                          MessageHandler)
from telegram.ext.filters import LOCATION, PHOTO, TEXT

load_dotenv()

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.DEBUG)

CONST_SPACE = "\n\n\n\n\n\n\n\n\n\n\n\n"
SERVER_API_ADDRS = os.environ['SERVER_API_ADDRS']
builder = Application.builder()
builder.token(os.environ['TOKEN']).build()
application = builder.build()
counter = 1


def form_api_request(location, animal_type, behaviour, image):
    response = requests.post(SERVER_API_ADDRS + '/submit',
                             data={
                                 "location": "user_location",
                                 "location_lat": location[0],
                                 "location_lon": location[1],
                                 "animal_type": animal_type,
                                 "behaviour": behaviour,
                             })
    return response


def escape_markdown(text):
    """
    Helper function to escape telegram markup symbols
    """
    text = text.replace('“', '_').replace('”', '_')
    escape_chars = '\[()+-.!~>=|'
    return re.sub(r'([%s])' % escape_chars, r'\\\1', text)


async def start_callback(update: Update, context: CallbackContext):

    mkd_start = """
    *Witaj w lokalizatorze fauny* \n
    Co zobaczyłeś/zobaczyłaś dzisiaj na szlaku? \n
    Mozesz podać lokalizację oraz załadować zdjęcia. \n
    """
    mkd_start = escape_markdown(mkd_start)
    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text=mkd_start,
                                   parse_mode='MarkdownV2')


async def text_callback(update: Update, context: CallbackContext):
    print(f"Otrzymano tekst: {update.message.text}")
    user_says = update.message.text
    if user_says:
        await update.message.reply_text(escape_markdown(r"Dodatkowe info?"),
                                        parse_mode='MarkdownV2')
        return
    await update.message.reply_text("Else")


async def location_handler(update: Update, context: CallbackContext):
    print(f"Otrzymano lokalizację: {update.message.location}")
    await context.bot.sendMessage(
        chat_id=update.message.chat.id,
        text=escape_markdown("Dzięki za lokalizację, a zdjęcia?"),
        parse_mode='MarkdownV2')


async def photo_handler(update: Update, context: CallbackContext):
    print("Otrzymano zdjęcie!")
    await context.bot.sendMessage(
        chat_id=update.message.chat.id,
        text=escape_markdown("Moim zdaniem to jest bardzo fajny dzik!"),
        parse_mode='MarkdownV2')


# this is the function that will be called when the user sends a location
application.add_handler(MessageHandler(LOCATION, location_handler))
application.add_handler(MessageHandler(PHOTO, photo_handler))
application.add_handler(CommandHandler("start", start_callback))
application.add_handler(MessageHandler(TEXT, text_callback))

application.run_polling()