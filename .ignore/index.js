
const express = require("express");
const { Telegraf } = require("telegraf");
const { WebSocket } = require("ws");

// =============== 1) 基础设置 ===============

const app = express();

// 你的 Bot Token，放在环境变量 BOT_TOKEN 中
const bot = new Telegraf(process.env.BOT_TOKEN);

// 白名单 Chat ID 列表：可以是群(负数)或用户(正数)
const WHITELIST = [
  //-1001111111111, // 群ID示例
  7418590284,      // 用户ID示例
  // ...更多ID
];

// =============== 2) 复读功能 ===============

function sanitizeMessage(text) {
  if (!text) return "";
  // 例：替换 <, >, & 三个常见字符
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&/g, "&amp;")
    .replace(/\//g, "&fs")
    .trim(); // 去除首尾空格
}

// 为每个群准备一个消息队列 { chatId1: [msg1, msg2], chatId2: [...] }
// const messageQueues = {};

// // 当 Bot 收到文本消息时
// bot.on("text", async (ctx) => {
//   const chatId = ctx.chat.id;

//   // 若该群还没初始化队列，先创建空数组
//   if (!messageQueues[chatId]) {
//     messageQueues[chatId] = [];
//   }

//   // 获取当前消息文本
//   const currentText = ctx.message?.text || "";
//   // 经过 sanitize 处理
//   const safeText = sanitizeMessage(currentText);

//   // 把这条安全文本存到该群队列
//   messageQueues[chatId].push(safeText);
//   // 将当前消息存入队列
//   //messageQueues[chatId].push(currentText);
//   i = 0;
//   // 从头开始，每条都回复后再删除直到队列为空
//   while (messageQueues[chatId].length > 0 && i<100) {
//     const textToSend = messageQueues[chatId][0];
//     await ctx.reply(textToSend);
//     messageQueues[chatId].shift(); // 发完后删除队首
//     i++;
//   }
//   //ctx.reply(`This chat ID is: ${chatId}`);
// });


/**
 * 全局对象：用于记录每个群的重复信息
 * 格式示例：
 * {
 *   [chatId]: {
 *     text: "最后一次记录的文本",
 *     userIds: Set(存放不同用户的ID),
 *     count: 计数器（表示有几个不同用户重复了同样的内容）
 *   }
 * }
 */
const repeatedMessages = {};

bot.on("text", async (ctx) => {
  const chatId = ctx.chat.id;
  const userId = ctx.from.id;

  // 若该群还没初始化队列，先创建空数组
  if (!messageQueues[chatId]) {
    messageQueues[chatId] = [];
  }

  // 获取当前消息文本
  const currentText = ctx.message?.text || "";
  // 经过 sanitize 处理
  const safeText = sanitizeMessage(currentText);

  // 如果还没有为该群初始化 repeatedMessages，则初始化
  if (!repeatedMessages[chatId]) {
    repeatedMessages[chatId] = {
      text: "",
      userIds: new Set(),
      count: 0
    };
  }

  // 检查该消息是否与记录中的文本相同
  if (safeText === repeatedMessages[chatId].text) {
    // 若相同，则判断发送此消息的用户是否是新的（不同 userId）
    if (!repeatedMessages[chatId].userIds.has(userId)) {
      repeatedMessages[chatId].userIds.add(userId);
      repeatedMessages[chatId].count++;

      // 如果已经有三个不同用户重复了同样的文本
      if (repeatedMessages[chatId].count === 2) {
        const randomNum = Math.random();
        if (randomNum < 0.8) {
          // 80% 的概率复读
          await ctx.reply(safeText);
        } else {
          // 20% 的概率打断
          await ctx.reply("打断复读");
        }
        // 处理完后重置该群的重复信息
        repeatedMessages[chatId].text = "";
        repeatedMessages[chatId].userIds.clear();
        repeatedMessages[chatId].count = 0;
      }
    }
  } else {
    // 如果文本不同，则重置该群的重复信息
    repeatedMessages[chatId].text = safeText;
    repeatedMessages[chatId].userIds = new Set([ userId ]);
    repeatedMessages[chatId].count = 1;
  }

  // 将新消息放入队列，以保持原有的队列结构
  messageQueues[chatId].push(safeText);

  // 从队列头开始，每条都回复后再删除，避免队列无限增长
  let i = 0;
  while (messageQueues[chatId].length > 0 && i < 100) {
    const textToSend = messageQueues[chatId][0];
    await ctx.reply(textToSend);
    messageQueues[chatId].shift(); // 发完后删除队首
    i++;
  }
});




// function formatMessage(data) {
//   // 判断消息类型：如果 source 等于 "Twitter"，则视为 tweet，否则视为 news
//   if (data.source === "Twitter") {
//     return formatTweet(data);
//   } else {
//     return formatNews(data);
//   }
// }

// function formatNews(news) {
//   // 只输出源、分类、标题，以及如果为important===true就加一个⚠️
//   const source = news.source || "";
//   const category = news.category || "";
//   const title = news.title || "";

//   let lines = [];
//   lines.push(`(news) Source: ${source}`);
//   lines.push(`Category: ${category}`);
//   lines.push(`Title: ${title}`);

//   // 如果 important === true，就输出⚠️
//   if (news.important === true) {
//     lines.push(`⚠️ 这是一条重要新闻`);
//   }

//   // 对于 url，使用简短LINK或emoji
//   if (news.url) {
//     // Telegram Markdown 版： [LINK](url)
//     lines.push(`🔗 [LINK](${news.url})`);
//   }
//   return lines.join("\n");
// }

// function formatTweet(tweet) {
//   // 输出 source、name、body、coin
//   const source = tweet.source || "";
//   const name = tweet.name || "";
//   const body = tweet.body || "";
//   const coin = tweet.coin || "";
//   let lines = [];
//   lines.push(`(tweet) Source: ${source}`);
//   lines.push(`Name: ${name}`);
//   lines.push(`Body: ${body}`);
//   if (coin) {
//     lines.push(`Coin: ${coin}`);
//   }

//   // 处理 url
//   if (tweet.url) {
//     lines.push(`🔗 [LINK](${tweet.url})`);
//   }

//   // 4个布尔值用不同 emoji 表示
//   // 只有为 true 才输出
//   let flags = [];
//   if (tweet.isReply)      flags.push("🗨");  // 你可自定义
//   if (tweet.isSelfReply)  flags.push("♻️");
//   if (tweet.isRetweet)    flags.push("🔁");
//   if (tweet.isQuote)      flags.push("📝");
//   if (flags.length > 0) {
//     lines.push(`特征: ${flags.join(" ")}`);
//   }

//   return lines.join("\n");
// }



// // =============== 3) WebSocket 接收新闻并转发 ===============

// // 创建一个 WebSocket 客户端连接
// const ws = new WebSocket("wss://wss.phoenixnews.io", {
//   headers: {
//     "x-api-key": process.env.PHOENIX_API_KEY // 从环境变量中读取
//   }
// });

// ws.on("open", () => {
//   console.log("WebSocket 已连接到 wss.phoenixnews.io");
// });

// ws.on("message", async (data) => {
//   console.log("收到 WebSocket 消息：", data.toString());

//   // 如果服务端发来的是 JSON，可先尝试解析
//   let parsed;
//   try {
//     parsed = JSON.parse(data);
//   } catch (err) {
//     console.warn("不是 JSON 或解析失败，原文直接发送：", err);
//     parsed = { text: data.toString() };
//   }

//   // 自定义你要发送到 Telegram 的内容
//   const messageToSend = formatMessage(parsed)
//   //const messageToSend = parsed.title
//     //? `⚡️ 最新新闻：${parsed.title}\n链接：${parsed.link ? parsed.link : "无"}`
//     //: parsed.text || "收到未知格式的新闻";

//   // 循环白名单，将消息发给每个群/用户
//   for (const targetId of WHITELIST) {
//     try {
//       await bot.telegram.sendMessage(targetId, messageToSend);
//       console.log(`已把新闻转发给 -> chat_id: ${targetId}`);
//     } catch (error) {
//       console.error(`转发新闻到 ${targetId} 失败:`, error);
//     }
//   }
// });

// ws.on("error", (error) => {
//   console.error("WebSocket 出现错误：", error);
// });

// ws.on("close", () => {
//   console.log("WebSocket 连接已关闭");
// });

// =============== 4) 设置 Webhook 回调 ===============
app.use(bot.webhookCallback("/secret-path"));


module.exports =  app ;
// 导出 app 供 Vercel 或其他平台使用
//module.exports = app;