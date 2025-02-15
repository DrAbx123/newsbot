from telegram import Update
from telegram.ext import (  # 明确导入 filters 和 MessageHandler
    Application,
    CommandHandler,
    MessageHandler,
    ContextTypes,
    filters
)
import os

TOKEN = os.environ["TG_TOKEN"]

application = Application.builder().token(TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("收到 /start 命令")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"你发送了: {update.message.text}")

# 注册处理器时需使用 filters 模块
application.add_handler(CommandHandler("start", start))
application.add_handler(
    MessageHandler(filters.TEXT & ~filters.COMMAND, echo)  # 确保 filters 已导入
)

async def handler(request):
    try:
        data = await request.json()
        update = Update.de_json(data, application.bot)
        await application.process_update(update)
        return {"statusCode": 200}
    except Exception as e:
        print(f"处理请求时出错: {e}")
        return {"statusCode": 500}