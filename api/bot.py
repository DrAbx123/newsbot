from http.server import BaseHTTPRequestHandler
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    filters
)
import os
import json

TOKEN = os.environ["TG_TOKEN"]  # 确保环境变量名称一致

application = Application.builder().token(TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("✅ Vercel 机器人已激活！")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"收到: {update.message.text}")

# 注册处理器
application.add_handler(CommandHandler("start", start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

class VercelHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        update = Update.de_json(json.loads(post_data), application.bot)

        async def process():
            await application.process_update(update)

        application.create_task(process())
        self.send_response(200)
        self.end_headers()

def handler(request):
    VercelHandler(request).handle()
    return ('', 200)