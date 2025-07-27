const { SlashCommandBuilder } = require('@discordjs/builders');
const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('Send an announcement with placeholders')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Select the channel to send the announcement')
        .setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    if (!channel.isTextBased()) {
      return interaction.reply({ content: 'Please select a text-based channel.', flags: 64 });
    }

    const modal = new ModalBuilder()
      .setCustomId(`announceModal_${channel.id}`)
      .setTitle('Send Announcement');

    const announcementInput = new TextInputBuilder()
      .setCustomId('announcementMessage')
      .setLabel('Your announcement message')
      .setPlaceholder('Example: Hello {user}, welcome to {server}! Use {everyone}, {channel}, etc.')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(announcementInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  },

  replacePlaceholders(message, interaction, channel) {
    const placeholders = {
      '{user}': `<@${interaction.user.id}>`,
      '{everyone}': '@everyone',
      '{here}': '@here',
      '{channel}': `<#${channel.id}>`,
      '{username}': interaction.user.username,
      '{userid}': interaction.user.id,
      '{server}': interaction.guild.name,
    };

    return message.replace(/\{(\w+)\}/gi, (match) => {
      const key = match.toLowerCase();
      return placeholders[key] || match;
    });
  },
};
