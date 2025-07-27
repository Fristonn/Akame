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
        { name: 'Ae organizer', url: 'https://drive.google.com/file/d/1SeRIHuCJeSBHtGgCvSFUgkQDmz7oL19M/view?usp=drive_link' },
        { name: 'Auto Nulls', url: 'https://drive.google.com/file/d/13VUUk-aOYmes4QCtkBN4xcHFnUdaFPuL/view?usp=drive_link' },
        { name: 'Auto beats marker', url: 'https://drive.google.com/file/d/1ympQXf9il6KiMpgHkqUCQi5uZLQJDkZZ/view?usp=drive_link' },
        { name: 'Composition Duplicator', url: 'https://drive.google.com/file/d/1nKuLeKDRrWeo_vrXTTtT7xCwnF4W5eI6/view?usp=drive_link' },
        { name: 'Text Evo 2', url: 'https://drive.google.com/file/d/1i0hxGrJOdrq8Mh_c3dEWhO9xbsciZvww/view?usp=sharing' },
        // Add real AE script links here
      ],
      panels: [
        { name: 'Flow - Aescripts', url: 'https://drive.google.com/file/d/1n20UCyFji9oIsAuG5gwVmwg30kOsYla7/view?usp=sharing' },
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
