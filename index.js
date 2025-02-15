const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// 建立一个字典，用于记录每个群的上一次消息。 key = chatId, value = 上一次消息文本
let lastMessageByGroup = {};

// 监听所有文本消息
bot.on("text", (ctx) => {
  const chatId = ctx.chat.id;                // 群聊或私聊的唯一ID
  const currentText = ctx.message.text;      // 当前消息内容

  // 如果之前群里有记录，就先复读它
  if (lastMessageByGroup[chatId]) {
    ctx.reply(lastMessageByGroup[chatId]);
  }

  // 存储当前消息，留待下一次新的消息时再复读
  lastMessageByGroup[chatId] = currentText;
});

// 处理 Telegram 发来的 webhook 请求
app.use(bot.webhookCallback("/secret-path"));

// 导出 app 给 Vercel
module.exports = app;