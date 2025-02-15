import os
import json
from telegram import Bot
from telegram.utils.request import Request

TOKEN = os.environ["TG_TOKEN"]

# 配置自定义请求对象（绕过 HTTP 框架）
request = Request(connect_timeout=30, read_timeout=30)
bot = Bot(token=TOKEN, request=request)

async def handler(event):
    try:
        # 解析原始请求体
        body = event.get("body", "{}")
        update_data = json.loads(body)

        # 手动处理消息
        if "message" in update_data:
            chat_id = update_data["message"]["chat"]["id"]
            text = update_data["message"].get("text", "")
            await bot.send_message(chat_id=chat_id, text=f"收到消息: {text}")

        return {"statusCode": 200}
    except Exception as e:
        print(f"处理错误: {e}")
        return {"statusCode": 500}