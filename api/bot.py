from http.server import BaseHTTPRequestHandler
from telegram import Update
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
    filters,
    MessageHandler
)
import os
import json

TOKEN = os.environ.get("TG_TOKEN")
WEBHOOK_URL = "https://YOUR_VERCEL_DOMAIN.vercel.app/api/bot"

# 初始化机器人
application = Application.builder().token(TOKEN).build()

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🤖 机器人已启动！")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"收到消息: {update.message.text}")

application.add_handler(CommandHandler("start", start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        update = Update.de_json(json.loads(post_data), application.bot)

        async def process_update():
            await application.process_update(update)

        application.create_task(process_update())
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')

def handler(request):
    h = Handler(request)
    h.handle()
    return h