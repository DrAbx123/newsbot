require("dotenv").config(); // 从 .env 里加载环境变量
const express = require("express");
const { Telegraf } = require("telegraf");
const { WebSocket } = require("ws");

// =============== 1) 基础设置 ===============
const app = express();

// 你的 Bot Token，放在环境变量 BOT_TOKEN 中
const bot = new Telegraf(process.env.BOT_TOKEN);

// 白名单 Chat ID 列表：可以是群(负数)或用户(正数)
const WHITELIST = [
  -1001111111111, // 群ID示例
  123456789,      // 用户ID示例
  // ...更多ID
];

// =============== 2) 复读功能 ===============

// 为每个群准备一个消息队列 { chatId1: [msg1, msg2], chatId2: [...] }
const messageQueues = {};

// 当 Bot 收到文本消息时
bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const currentText = ctx.message.text;

  // 若该群还没初始化队列，先创建空数组
  if (!messageQueues[chatId]) {
    messageQueues[chatId] = [];
  }

  // 将当前消息存入队列
  messageQueues[chatId].push(currentText);

  // 从头开始，每条都回复后再删除直到队列为空
  while (messageQueues[chatId].length > 0) {
    const textToSend = messageQueues[chatId][0];
    await ctx.reply(textToSend);
    messageQueues[chatId].shift(); // 发完后删除队首
  }
});

// =============== 3) WebSocket 接收新闻并转发 ===============

// 创建一个 WebSocket 客户端连接
const ws = new WebSocket("wss://wss.phoenixnews.io", {
  headers: {
    "x-api-key": process.env.PHOENIX_API_KEY // 从环境变量中读取
  }
});

ws.on("open", () => {
  console.log("WebSocket 已连接到 wss.phoenixnews.io");
});

ws.on("message", async (data) => {
  console.log("收到 WebSocket 消息：", data.toString());

  // 如果服务端发来的是 JSON，可先尝试解析
  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch (err) {
    console.warn("不是 JSON 或解析失败，原文直接发送：", err);
    parsed = { text: data.toString() };
  }

  // 自定义你要发送到 Telegram 的内容
  const messageToSend = parsed.title
    ? `⚡️ 最新新闻：${parsed.title}\n链接：${parsed.link ? parsed.link : "无"}`
    : parsed.text || "收到未知格式的新闻";

  // 循环白名单，将消息发给每个群/用户
  for (const targetId of WHITELIST) {
    try {
      await bot.telegram.sendMessage(targetId, messageToSend);
      console.log(`已把新闻转发给 -> chat_id: ${targetId}`);
    } catch (error) {
      console.error(`转发新闻到 ${targetId} 失败:`, error);
    }
  }
});

ws.on("error", (error) => {
  console.error("WebSocket 出现错误：", error);
});

ws.on("close", () => {
  console.log("WebSocket 连接已关闭");
});

// =============== 4) 设置 Webhook 回调 ===============
app.use(bot.webhookCallback("/secret-path"));

// 导出 app 供 Vercel 或其他平台使用
module.exports = app;