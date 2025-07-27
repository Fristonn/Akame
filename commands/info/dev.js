const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dev')
    .setDescription('Displays detailed information about the bot and developer.'),

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    let ownerDisplay = 'Friston';
    let ownerMention = 'Friston';
    let ownerPfp = interaction.client.user.displayAvatarURL();

    try {
      const member = await interaction.guild.members.fetch(ownerId);
      if (member) {
        ownerDisplay = member.user.tag;
        ownerMention = `<@${ownerId}>`;
        ownerPfp = member.user.displayAvatarURL({ dynamic: true, size: 1024 });
      }
    } catch {
      // Fallback to default
    }

    const embed = new EmbedBuilder()
      .setAuthor({
        name: `${interaction.client.user.username} • Bot Overview`,
        iconURL: interaction.client.user.displayAvatarURL(),
      })
      .setColor('#00c3ff')
      .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setDescription(`**Hey!** I'm <@${interaction.client.user.id}> made by Friston. A bot-loving editor.`)
      .addFields(
        { name: 'Bot Name', value: interaction.client.user.username, inline: true },
        { name: 'Bot ID', value: interaction.client.user.id, inline: true },
        {
          name: 'Created On',
          value: interaction.client.user.createdAt.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
          }),
          inline: true
        },
        { name: 'Servers', value: `${interaction.client.guilds.cache.size}`, inline: true },
        { name: 'Bot Users', value: `${interaction.client.users.cache.size}`, inline: true },
        { name: 'Developer', value: `**${ownerMention}**`, inline: true },
        {
          name: 'About Developer',
          value: `I’m Friston — an editor who loves turning ideas into clean systems and sharp visuals. From slash command setups to community tools, I make things that feel smooth, smart and personal. Still learning, still growing — but every line I write has a purpose.`,
          inline: false
        }
      )
      .setFooter({
        text: `(© Friston Systems • 2025)`,
      })
      .setTimestamp();

    const payhipLink = 'https://payhip.com/Fristonae';

    const buttonRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('🛒 View My Payhip Store')
        .setStyle(ButtonStyle.Link)
        .setURL(payhipLink)
    );

    await interaction.reply({ embeds: [embed], components: [buttonRow] });
  },
};
