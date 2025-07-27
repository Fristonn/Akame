const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(process.cwd(), 'data/ticket-config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickets-transcript')
    .setDescription('Set the channel to receive ticket transcripts')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to log transcripts')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    if (!channel || !channel.isTextBased())
      return interaction.reply({ content: 'Please choose a valid text channel.', flags: 64 });

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {};

    config.transcriptChannelId = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return interaction.reply({ content: `Transcript channel set to **${channel.name}**.`, flags: 64 });
  }
};
