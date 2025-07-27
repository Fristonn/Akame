const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'slowmode',
  description: 'Set the slowmode delay for the current channel (Admins only)',
  async execute(message, args) {
    // Permission check: Owner, Guild Owner, or Manage Channels
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    if (!args[0]) {
      return message.reply('Please specify the slowmode duration in seconds.');
    }

    const seconds = parseInt(args[0], 10);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply('Please provide a valid number of seconds between 0 and 21600.');
    }

    try {
      await message.channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Slowmode Updated')
        .addFields(
          { name: 'Channel', value: `${message.channel}`, inline: true },
          { name: 'New Delay', value: `${seconds} second(s)`, inline: true },
          { name: 'Executor', value: `<@${message.author.id}>` }
        )
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: message.client.user.displayAvatarURL(),
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Failed to set slowmode:', err);
      message.reply('Failed to update slowmode. I may not have permission.');
    }
  },
};
