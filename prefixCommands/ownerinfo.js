const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  name: 'ownerinfo',
  description: 'Get information about the server owner',
  async execute(message, args) {
    try {
      const guild = message.guild;
      const owner = await guild.fetchOwner();
      const user = owner.user || owner;

      const joinedDiscord = user.createdAt.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      });

      const member = await guild.members.fetch(user.id);
      const joinedServer = member.joinedAt ? member.joinedAt.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      }) : 'Unknown';

      const isBotOwner = user.id === process.env.OWNER_ID;

      const embed = new EmbedBuilder()
        .setTitle('Server Owner Information')
        .setDescription('Here is some detailed information about the server owner.')
        .setColor('#bbd8ff')
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .addFields(
          { name: 'Owner Name', value: user.tag, inline: true },
          { name: 'Owner ID', value: user.id, inline: true },
          { name: 'Joined Discord', value: joinedDiscord, inline: true },
          { name: 'Joined Server', value: joinedServer, inline: true },
          { name: 'Bot Owner?', value: isBotOwner ? 'Yes' : 'No', inline: true }
        )
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error('Error in ownerinfo command:', err);
      message.channel.send('Failed to fetch server owner info.');
    }
  },
};
