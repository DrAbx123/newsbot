// index.js
const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// 使用 bot.webhookCallback('/secret-path') 暴露给Vercel Serverless
app.use(bot.webhookCallback("/secret-path"));

// 简单示例：响应 /start 命令
bot.start((ctx) => ctx.reply("Hello! You've successfully deployed to Vercel!"));

// Vercel部署时无需手动 app.listen(3000)，
// 但本地调试可加上这段来跑:
//  ...
// Vercel只要导出 app，就可由它托管

module.exports = app;