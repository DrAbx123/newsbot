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

TOKEN = os.environ.get("TG_TOKEN")  # 从环境变量读取 Token
WEBHOOK_URL = "https://newsbot-git-main-abx123-s-projects.vercel.app/api/bot"  # 替换为你的域名

# 初始化机器人
application = Application.builder().token(TOKEN).build()

# 定义处理函数
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("你好！Vercel 机器人已启动。")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(f"你发送了: {update.message.text}")

# 注册处理器
application.add_handler(CommandHandler("start", start))
application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, echo))

# 定义 Vercel 请求处理类
class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        update = Update.de_json(json.loads(post_data), application.bot)

        # 异步处理更新
        async def process_update():
            await application.process_update(update)

        application.create_task(process_update())

        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'OK')

# Vercel 入口函数（必须保留此函数名）
def handler(request):
    h = Handler(request)
    h.handle()
    return h