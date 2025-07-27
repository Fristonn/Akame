const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'timeout',
  description: 'Timeout a user for a specified duration (in minutes)',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionFlagsBits.ModerateMembers)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    const target = message.mentions.members.first();
    const duration = parseInt(args[1], 10);
    const reason = args.slice(2).join(' ') || 'No reason provided';

    if (!target) return message.reply('Please mention a valid member.');
    if (isNaN(duration) || duration <= 0 || duration > 10080) {
      return message.reply('Please provide a valid timeout duration (1–10080 minutes).');
    }

    await target.timeout(duration * 60 * 1000, reason);

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('Member Timed Out')
      .addFields(
        { name: 'User', value: `${target}` },
        { name: 'Executor', value: `<@${message.author.id}>` },
        { name: 'Duration', value: `${duration} minute(s)` },
        { name: 'Reason', value: reason }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
