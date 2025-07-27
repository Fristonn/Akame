const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'data/unitConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unit-form')
    .setDescription('Set the channel where unit form application submissions go')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the form responses')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    let config = {};
    if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config.reviewChannelId = channel.id;

fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({ content: `Review channel set to ${channel}`, flags: 64 });
  }
};
