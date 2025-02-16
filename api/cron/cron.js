// pages/api/cron.js
const { createApp } = require("../../index.js");

export default async function handler(req, res) {
  console.log("Cron job triggered.");

  try {
    await createApp(); // 调用 index.js 里的逻辑
    return res.status(200).json({ message: "Cron job done." });
  } catch (error) {
    console.error("Error in cron job:", error);
    return res.status(500).json({ error: error.toString() });
  }
}