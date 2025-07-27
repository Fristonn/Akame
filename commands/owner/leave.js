const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Allows the bot owner to view and make the bot leave any server.'),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: 'Seriously? You think you’re allowed to do that? Aww..Cute',
        flags: 64 
      });
    }

    const guilds = interaction.client.guilds.cache.map(g => ({
      label: g.name.length > 100 ? g.name.slice(0, 97) + '...' : g.name,
      description: `ID: ${g.id}`,
      value: g.id
    })).slice(0, 25);

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('server_select')
      .setPlaceholder('Select a server to leave')
      .addOptions(guilds);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const embed = new EmbedBuilder()
      .setTitle('Servers List')
      .setColor('#bbd8ff')
      .setDescription(`The bot is currently in **${interaction.client.guilds.cache.size}** servers.\nSelect one to leave.`)
      .setFooter({
        text: '(© Friston Systems • 2025)',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

   
    await interaction.reply({
      embeds: [embed],
      components: [row]
      
    });
  }
};
