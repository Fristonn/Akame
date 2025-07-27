const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require("discord.js");
const fs = require("fs");
const path = require("path");

const configPath = path.join(process.cwd(), "data/config.json");
const dataDir = path.dirname(configPath);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("chatbot")
    .setDescription("Set or remove the channel where AI chatbot should respond.")
    .addStringOption(option =>
      option.setName("action")
        .setDescription("Choose whether to set or remove the chatbot channel.")
        .setRequired(true)
        .addChoices(
          { name: "Set channel", value: "set" },
          { name: "Remove channel", value: "remove" }
        )
    )
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Text channel to set for AI chatbot.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const action = interaction.options.getString("action");
    const channel = interaction.options.getChannel("channel");

    try {
      // Ensure data folder exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Load config
      let config = {};
      if (fs.existsSync(configPath)) {
        try {
          config = JSON.parse(fs.readFileSync(configPath, "utf8"));
        } catch {
          console.warn("Invalid config.json. Resetting.");
          config = {};
        }
      }

      if (action === "set") {
        if (!channel || channel.type !== ChannelType.GuildText) {
          return interaction.reply({
            content: "You must provide a valid **text channel** to set.",
            flags: 64
          });
        }

        config.chat_channel_id = channel.id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        console.log(`Chatbot channel set to: ${channel.id}`);
        return interaction.reply({
          content: `AI chatbot will now respond in <#${channel.id}>.`,
          flags: 64
        });

      } else if (action === "remove") {
        if (!config.chat_channel_id) {
          return interaction.reply({
            content: "No chatbot channel is currently set.",
            flags: 64
          });
        }

        delete config.chat_channel_id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        console.log(`Chatbot channel removed.`);
        return interaction.reply({
          content: "AI chatbot channel has been removed.",
          flags: 64
        });
      }
    } catch (err) {
      console.error("Error updating chatbot config:", err);
      return interaction.reply({
        content: "Failed to save chatbot config. Check console logs.",
        flags: 64
      });
    }
  }
};
