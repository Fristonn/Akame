const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('aescripts')
    .setDescription('Get Google Drive links for AE scripts or panels')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Select the type to view')
        .setRequired(true)
        .addChoices(
          { name: 'scripts', value: 'scripts' },
          { name: 'panels', value: 'panels' }
        )
    ),

  async execute(interaction) {
    // Removed owner check so everyone can use

    const type = interaction.options.getString('type');

    const scriptsData = {
      scripts: [
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        // Add real AE script links here
      ],
      panels: [
        { name: '', url: '' },
        // Add real AE panel links here
      ],
    };

    const files = scriptsData[type];

    if (!files || files.length === 0) {
      return interaction.reply({
        content: `No ${type} available.`,
        flags: 64
      });
    }

    const fileList = files
      .map(f => `**${f.name}** — [Download here](${f.url})`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`AE ${type.charAt(0).toUpperCase() + type.slice(1)}`)
      .setColor('#bbd8ff')
      .setDescription(fileList)
      .setFooter({
        text: '(© Friston Systems • 2025)',
        iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      flags: 64
    });
  }
};
