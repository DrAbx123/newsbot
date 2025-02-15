from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes
import os
import json

TOKEN = os.environ["TG_TOKEN"]

# 初始化机器人
application = Application.builder().token(TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("👋 机器人正常运行！")

# 注册命令处理器
application.add_handler(CommandHandler("start", start))

# Vercel Webhook 处理
async def handler(request):
    body = await request.json()
    update = Update.de_json(body, application.bot)
    await application.process_update(update)
    return {"statusCode": 200}