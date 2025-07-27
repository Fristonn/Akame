const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'ban',
  description: 'Bans a user from the server',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.BanMembers)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    const user = message.mentions.users.first();
    const reason = args.slice(1).join(' ') || 'No reason provided';

    if (!user) return message.reply('Please mention a user to ban.');

    const member = message.guild.members.cache.get(user.id);
    if (!member) return message.reply('That user is not in this server.');
    if (!member.bannable) return message.reply('I cannot ban this user due to role hierarchy or permissions.');

    await member.ban({ reason: `Banned by ${message.author.tag} - ${reason}` });

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('User Banned')
      .setDescription(`**${user.tag}** has been banned.`)
      .addFields(
        { name: 'Executor', value: `<@${message.author.id}>`, inline: false },
        { name: 'Reason', value: reason }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
