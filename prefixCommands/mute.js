const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'mute',
  description: 'Mutes a user by giving them the "Muted" role',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    const user = message.mentions.users.first() || message.client.users.cache.get(args[0]);
    if (!user) return message.reply('User not found.');
    const member = message.guild.members.cache.get(user.id);
    const reason = args.slice(1).join(' ') || 'No reason provided';

    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (!muteRole) return message.reply('Muted role not found. Please create a "Muted" role.');

    if (member.roles.cache.has(muteRole.id)) return message.reply('User is already muted.');

    await member.roles.add(muteRole, reason);

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('User Muted')
      .addFields(
        { name: 'User', value: `${user.tag}` },
        { name: 'Executor', value: `<@${message.author.id}>` },
        { name: 'Reason', value: reason }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
