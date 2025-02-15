// index.js
const { Telegraf } = require("telegraf");
const express = require("express");

// 建立 Express 应用 & Bot
const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

// 建立一个全局对象：key 为 chatId，value 为队列(Array)
const messageQueues = {};

/**
 * 进行消息“转义”或“基本过滤”，防止注入
 * 这里仅做示例：替换HTML符号，移除多余空格等
 */
function sanitizeMessage(text) {
  if (!text) return "";
  // 例：替换 <, >, & 三个常见字符
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .trim(); // 去除首尾空格
}

// 当 Bot 收到任意 message 时触发
bot.on("message", async (ctx) => {
  const chatId = ctx.chat.id;
  // 如果某个群还没初始化队列，则先创建一个空数组
  if (!messageQueues[chatId]) {
    messageQueues[chatId] = [];
  }

  // 获取当前消息文本
  const currentText = ctx.message?.text || "";
  // 经过 sanitize 处理
  const safeText = sanitizeMessage(currentText);

  // 把这条安全文本存到该群队列
  messageQueues[chatId].push(safeText);

  // 从头开始输出，直到队列为空
  while (messageQueues[chatId].length > 0) {
    const textToSend = messageQueues[chatId][0]; // 取队首，但先不删除
    await ctx.reply(textToSend);

    // 发送完成后，再删除队首这条
    messageQueues[chatId].shift();
  }
  ctx.reply(`This chat ID is: ${chatId}`);
});

// 将 Bot 的 webhookCallback 挂载到 /secret-path
app.use(bot.webhookCallback("/secret-path"));

// 导出给 Vercel 使用
module.exports = app;