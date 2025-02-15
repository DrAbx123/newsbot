function formatMessage(data) {
    // 判断消息类型：如果 source 等于 "Twitter"，则视为 tweet，否则视为 news
    if (data.source === "Twitter") {
      return formatTweet(data);
    } else {
      return formatNews(data);
    }
  }

  function formatNews(news) {
    // 只输出源、分类、标题，以及如果为important===true就加一个⚠️
    const source = news.source || "";
    const category = news.category || "";
    const title = news.title || "";

    let lines = [];
    lines.push(`(news) Source: ${source}`);
    lines.push(`Category: ${category}`);
    lines.push(`Title: ${title}`);

    // 如果 important === true，就输出⚠️
    if (news.important === true) {
      lines.push(`⚠️ 这是一条重要新闻`);
    }

    // 对于 url，使用简短LINK或emoji
    if (news.url) {
      // Telegram Markdown 版： [LINK](url)
      lines.push(`🔗 [LINK](${news.url})`);
    }
    return lines.join("\n");
  }

  function formatTweet(tweet) {
    // 输出 source、name、body、coin
    const source = tweet.source || "";
    const name = tweet.name || "";
    const body = tweet.body || "";
    const coin = tweet.coin || "";
    let lines = [];
    lines.push(`(tweet) Source: ${source}`);
    lines.push(`Name: ${name}`);
    lines.push(`Body: ${body}`);
    if (coin) {
      lines.push(`Coin: ${coin}`);
    }

    // 处理 url
    if (tweet.url) {
      lines.push(`🔗 [LINK](${tweet.url})`);
    }

    // 4个布尔值用不同 emoji 表示
    // 只有为 true 才输出
    let flags = [];
    if (tweet.isReply)      flags.push("🗨");  // 你可自定义
    if (tweet.isSelfReply)  flags.push("♻️");
    if (tweet.isRetweet)    flags.push("🔁");
    if (tweet.isQuote)      flags.push("📝");
    if (flags.length > 0) {
      lines.push(`特征: ${flags.join(" ")}`);
    }

    return lines.join("\n");
  }

  // 示例用法：
  // const msg = formatMessage(newsOrTweetObject);
  // bot.telegram.sendMessage(chatId, msg, { parse_mode: "Markdown" });