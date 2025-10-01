const { Events } = require("discord.js");
const fs = require("fs");
const path = require("path");

const { getLlamaReply } = require("./gpt");

const dataDir = path.join(__dirname, "../data");
const configPath = path.join(dataDir, "config.json");

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, JSON.stringify({ chat_channel_id: "", prefix: "!" }, null, 2));
}

module.exports = (client) => {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const prefix = config.prefix || "!";

    if (message.channel.id !== config.chat_channel_id) return;

    // Ignore messages starting with command prefix or slash (/) for slash commands
    if (message.content.startsWith(prefix) || message.content.startsWith("/")) return;

    try {
      await message.channel.sendTyping();

      const reply = await getLlamaReply(message.content, message.author.id);

      if (reply) {
        await message.reply({ content: reply });
      }
    } catch (err) {
      console.error("[GPT Chat Error]:", err);
      await message.reply({
        content: "she's tired rn. try again later, okay?"
      });
    }
  });
};
