const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'purge',
  description: 'Deletes a specified number of messages from the channel',
  usage: 'purge <1-100>',
  async execute(message, args) {
    // Permissions check
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)
    ) {
      return message.reply('You do not have permission to use this command.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    // Bot permission check
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('I need the **Manage Messages** permission to perform this.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    const amount = parseInt(args[0], 10);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('Please enter a number between 1 and 100.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 5000));
    }

    await message.delete().catch(() => {}); // delete the user's command message

    try {
      const deleted = await message.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Messages Purged')
        .addFields(
          { name: 'Amount', value: `${deleted.size}`, inline: true },
          { name: 'Executor', value: `<@${message.author.id}>`, inline: true },
          { name: 'Channel', value: `${message.channel}`, inline: false }
        )
        .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();

      const confirm = await message.channel.send({ embeds: [embed] });
      setTimeout(() => confirm.delete().catch(() => {}), 7000);
    } catch (err) {
      console.error('Bulk delete error:', err);
      message.channel.send('Failed to delete messages. I can only delete messages newer than 14 days.')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 7000));
    }
  }
};
