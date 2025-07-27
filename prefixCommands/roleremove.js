const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'roleremove',
  description: 'Remove a role from a member.',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)
    ) {
      return message.reply('You do not have permission to use this command.');
    }

    const member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const role = message.mentions.roles.first() || message.guild.roles.cache.find(r => r.name === args.slice(1).join(' '));
    if (!member || !role) return message.reply('Please mention both a member and a role.');

    if (!member.roles.cache.has(role.id)) return message.reply('User does not have this role.');
    await member.roles.remove(role);

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('Role Removed')
      .addFields(
        { name: 'User', value: `<@${member.id}>` },
        { name: 'Role', value: `${role.name}` },
        { name: 'Executor', value: `<@${message.author.id}>` }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
