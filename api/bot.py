# api/bot.py
import os
from telegram import Bot
from telegram.utils.request import Request  # 适用于 v13.x

TOKEN = os.environ["TG_TOKEN"]
request = Request(con_pool_size=8)
bot = Bot(token=TOKEN, request=request)

def handler(event):
    return {"statusCode": 200}