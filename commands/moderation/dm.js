const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
require('dotenv').config();

const OWNER_ID = process.env.OWNER_ID || 'your_discord_user_id_here'; // Replace if not using .env

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('Send a direct message to a user (Administrator only)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to send the message to')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send')
        .setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('target');
    const messageContent = interaction.options.getString('message');
    const member = await interaction.guild.members.fetch(interaction.user.id);

    // Permission check: must have Administrator permission
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute',
        flags: 64,
      });
    }

    try {
      await targetUser.send(messageContent);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Message Sent')
        .setDescription(`Your message has been sent to **${targetUser.tag}**.`)
        .addFields(
          { name: 'Message', value: messageContent },
          { name: 'Sent By', value: interaction.member.displayName, inline: true },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (error) {
      console.error('Error sending DM:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Failed to Send Message')
        .setDescription(`Could not send a message to **${targetUser.tag}**. They might have DMs disabled.`)
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  },
};
