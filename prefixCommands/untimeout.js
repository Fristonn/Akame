const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'untimeout',
  description: 'Remove timeout from a user.',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    const target = message.mentions.members.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';
    if (!target) return message.reply('Please mention a valid member.');

    await target.timeout(null, reason);

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('Timeout Removed')
      .addFields(
        { name: 'User', value: `${target}` },
        { name: 'Executor', value: `<@${message.author.id}>` },
        { name: 'Reason', value: reason }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
