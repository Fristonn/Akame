const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'unban',
  description: 'Unbans a user by ID',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    const userId = args[0];
    const reason = args.slice(1).join(' ') || 'No reason provided';

    await message.guild.members.unban(userId, reason);

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('User Unbanned')
      .addFields(
        { name: 'User ID', value: userId },
        { name: 'Executor', value: `<@${message.author.id}>` },
        { name: 'Reason', value: reason }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
