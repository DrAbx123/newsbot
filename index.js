const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

let lastMessageText = ""; // 存上一次消息的文本

// 当收到任何消息时（包括群聊消息），处理逻辑
bot.on("message", (ctx) => {
  const message = ctx.message;

  // 如果是文本消息，就把它存起来，然后把上一次存的消息复读
  if (message && message.text) {
    // 如果我们已经有上一次消息，就立刻复读
    if (lastMessageText) {
      ctx.reply(lastMessageText);
    }
    // 更新记录：把当前这条消息内容留给下一次复读
    lastMessageText = message.text;
  }
});

// 将 Telegram 消息通过 /secret-path 路径转发给 bot
app.use(bot.webhookCallback("/secret-path"));

module.exports = app;