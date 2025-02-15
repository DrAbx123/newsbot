from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
import os
import json

TOKEN = os.environ["TG_TOKEN"]

# 初始化机器人（禁用默认 HTTP 处理器）
application = Application.builder().token(TOKEN).updater(None).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("✅ 消息处理正常！")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"收到: {update.message.text}")

# 注册处理器
application.add_handler(CommandHandler("start", start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

# 直接处理原始请求（绕过任何类检查）
async def handler(request):
    try:
        body = await request.body()
        update = Update.de_json(json.loads(body), application.bot)
        await application.process_update(update)
        return {"statusCode": 200}
    except Exception as e:
        print(f"处理错误: {e}")
        return {"statusCode": 500}