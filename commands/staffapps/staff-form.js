
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'data', 'staffFormConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-form')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Set the channel where form submissions will go')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Channel for form results')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    ),
  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const folderPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    config[interaction.guild.id] = { staffApplicationsChannelId: channel.id };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({ content: `Form submissions will be sent to <#${channel.id}>`, flags: 64 });
  }
};