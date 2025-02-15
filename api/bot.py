from telegram.ext import Application
import os

TOKEN = os.environ["TG_TOKEN"]

application = Application.builder().token(TOKEN).build()

async def handler(request):
    return {"statusCode": 200}