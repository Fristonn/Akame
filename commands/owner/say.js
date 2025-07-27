require('dotenv').config();
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something (owner only)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send (supports @mention)')
        .setRequired(true))
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the message in')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true))
    .setDefaultMemberPermissions(0),

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: 'Seriously? You think you’re allowed to do that? Aww..Cute',
        flags: 64
      });
    }

    const message = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel');

    try {
      await channel.send({
        content: message,
        allowedMentions: { parse: ['users', 'roles', 'everyone'] }
      });

      await interaction.reply({
        content: `Message sent in <#${channel.id}>`,
        flags: 64
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      await interaction.reply({
        content: 'Failed to send the message. Do I have access to that channel?',
        flags: 64
      });
    }
  }
};
