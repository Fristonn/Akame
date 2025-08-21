const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removelogs')
    .setDescription('Removes the logging channel for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Permission check: must have Administrator permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute',
        flags: 64
      });
    }

    const logPath = path.join(__dirname, '..', 'logchannels.json');

    // Load existing data
    let logs = {};
    if (fs.existsSync(logPath)) {
      logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    }

    const guildId = interaction.guild.id;

    if (!logs[guildId]) {
      return interaction.reply({
        content: 'No logging channel was set for this server.',
        flags: 64,
      });
    }

    delete logs[guildId];
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2));

    await interaction.reply({
      content: 'Logging channel has been removed for this server.',
      flags: 64,
    });
  }
};
