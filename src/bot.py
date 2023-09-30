import logging
import os
import re
import requests

from dotenv import load_dotenv
from telegram.ext import Application, CommandHandler, ContextTypes, MessageHandler
from telegram import Update
from telegram.ext.filters import LOCATION, PHOTO

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


def escape_markdown(text):
    """
    Helper function to escape telegram markup symbols
    """
    text = text.replace('“', '_').replace('”', '_')
    escape_chars = '\[()+-.!~>=|'
    return re.sub(r'([%s])' % escape_chars, r'\\\1', text)


async def start_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):

    mkd_start = """
    *Witaj w lokalizatorze fauny* \n
    Co zobaczyłeś/zobaczyłaś dzisiaj na szlaku? \n
    Mozesz podać lokalizację oraz załadować zdjęcia. \n
    """
    mkd_start = escape_markdown(mkd_start)
    await context.bot.send_message(chat_id=update.effective_chat.id,
                                   text=mkd_start,
                                   parse_mode='MarkdownV2')


async def cmd_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_says = " ".join(context.args)
    if not user_says:
        await update.message.reply_text(escape_markdown(r"Wpisz lokalizację"),
                                        parse_mode='MarkdownV2')
        return
    await update.message.reply_text("Wysłano lokalizację: " + user_says +
                                    CONST_SPACE)


async def location_handler(bot, update):
    print("Otrzymano lokalizację")
    print(bot.message.location)
    await update.bot.sendMessage(
        chat_id=bot.message.chat.id,
        text=escape_markdown("Dzięki za lokalizację, a zdjęcia?"),
        parse_mode='MarkdownV2')


async def photo_handler(bot, update):
    print("Otrzymano zdjęcie")
    await update.bot.sendMessage(
        chat_id=bot.message.chat.id,
        text=escape_markdown("Moim zdaniem to jest bardzo fajny dzik!"),
        parse_mode='MarkdownV2')


# this is the function that will be called when the user sends a location
application.add_handler(MessageHandler(LOCATION, location_handler))
application.add_handler(MessageHandler(PHOTO, photo_handler))
application.add_handler(CommandHandler("start", start_callback))
application.add_handler(CommandHandler("cmd", cmd_callback))

application.run_polling()