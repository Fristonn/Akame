const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pfs')
    .setDescription('Access editor project files from Drive')
    .addStringOption(option =>
      option
        .setName('editor')
        .setDescription('Select an editor to view their project files')
        .setRequired(true)
        .addChoices(
          { name: '', value: '' },
          { name: '', value: '' },
          // { name: 'editor3', value: 'editor3' },
          // { name: 'editor4', value: 'editor4' },
          // { name: 'editor5', value: 'editor5' },
        )
    ),

  async execute(interaction) {
    if (interaction.user.id !== process.env.OWNER_ID) {
      return interaction.reply({
        content: 'Be a good boy and don’t touch what’s not yours, baka~',
        flags: 64
      });
    }

    const editor = interaction.options.getString('editor');

    const editorData = {
      pjunkie: [
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
        { name: '', url: '' },
      ],
      nikoaed: [
        { name: '', url: '' },
      ],
      // editor3: [
      //   // Add project files here
      // ],
      // editor4: [
      //   // Add project files here
      // ],
      // editor5: [
      //   // Add project files here
      // ],
    };

    const files = editorData[editor];

    if (!files || files.length === 0) {
      return interaction.reply({
        content: `No project files available for **${editor}**.`,
        flags: 64
      });
    }

    const fileList = files
      .map(f => `**${f.name}** — [Download here](${f.url})`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`Project Files — ${editor.charAt(0).toUpperCase() + editor.slice(1)}`)
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
