const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'roleadd',
  description: 'Assign a role to a member.',
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

    if (member.roles.cache.has(role.id)) return message.reply('User already has this role.');
    await member.roles.add(role);

    const embed = new EmbedBuilder()
      .setColor('#bbd8ff')
      .setTitle('Role Added')
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
