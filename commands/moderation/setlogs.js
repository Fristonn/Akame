const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlogs')
    .setDescription('Set a channel where Akame can send logs')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Select the log channel')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction, client) {
    const channel = interaction.options.getChannel('channel');

    // Correct path for logs
    const logPath = path.join(__dirname, '..', 'logchannels.json');

    // Load existing data if available
    let logs = {};
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    // Update the log channel for this guild
    logs[interaction.guild.id] = channel.id;
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

    await interaction.reply({
      content: `Log channel set to <#${channel.id}>.`,
      flags: 64
    });
  }
};
