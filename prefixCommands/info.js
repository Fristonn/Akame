const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'info',
  description: 'Displays information about the bot.',
  async execute(message, args) {
    const ownerId = process.env.OWNER_ID;
    let ownerDisplay = 'Friston';

    try {
      const member = await message.guild.members.fetch(ownerId);
      if (member) {
        ownerDisplay = `<@${ownerId}>`;
      }
    } catch (err) {
      // Owner not in the server
    }

    const embed = new EmbedBuilder()
      .setTitle('Bot Information')
      .setDescription('Here is some detailed information about the bot.')
      .setColor('#2f3136')
      .setThumbnail(message.client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: 'Bot Name', value: message.client.user.username, inline: true },
        { name: 'Bot ID', value: message.client.user.id, inline: true },
        {
          name: 'Created On',
          value: message.client.user.createdAt.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
          inline: true
        },
        { name: 'Servers', value: message.client.guilds.cache.size.toString(), inline: true },
        { name: 'Users', value: message.client.users.cache.size.toString(), inline: true },
        { name: 'Bot Dev/Owner', value: ownerDisplay, inline: true }
      )
      .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};
