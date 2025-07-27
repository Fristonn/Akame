const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ownerinfo')
    .setDescription('Get information about the server owner'),

  async execute(interaction) {
    const owner = await interaction.guild.fetchOwner();
    const user = owner.user || owner;

    const joinedDiscord = user.createdAt.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    const member = await interaction.guild.members.fetch(user.id);
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
      .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
