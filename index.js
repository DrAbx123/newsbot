// index.js
const { Telegraf } = require("telegraf");
const express = require("express");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

app.use((req, res, next) => {
    console.log(`Incoming request to ${req.path} with method ${req.method}`);
    next();
  });

app.use(bot.webhookCallback("/secret-path"));

bot.start((ctx) => {
    console.log("Received /start from:", ctx.from.id);
    ctx.reply("Hello from Vercel!");
  });

module.exports = app;