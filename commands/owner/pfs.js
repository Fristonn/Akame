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
          { name: 'pjunkie', value: 'pjunkie' },
          { name: 'nikoaed', value: 'nikoaed' },
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
        { name: 'Bad Romance', url: 'https://drive.google.com/file/d/18xtOEPRRWp8ELNCNYjFCHhFkjss9Cu5K/view?usp=sharing' },
        { name: 'Boys Beware', url: 'https://drive.google.com/file/d/1Vkf2NxlMqAOFPeTB7Fnf18AZZAcri9vj/view?usp=drive_link' },
        { name: 'FYAAYF', url: 'https://drive.google.com/file/d/1mVAr61LDPh_1-NKQwPZXEdV1y-4st39t/view?usp=drive_link' },
        { name: 'Girls like you', url: 'https://drive.google.com/file/d/1FIdhGNB9_1-Xd_MeAA84u8hw4-st_2HS/view?usp=drive_link' },
        { name: 'Hush', url: 'https://drive.google.com/file/d/1OFVnUa0FJTcPtJSGdH0zVoeloU6LYnwh/view?usp=drive_link' },
        { name: 'So Soaked', url: 'https://drive.google.com/file/d/1w5LqJmFYz8rK2sgUJQcLdtUeNgicn5EQ/view?usp=drive_link' },
        { name: 'Lost Soul Down Makima', url: 'https://drive.google.com/file/d/1tmguareAIRWneQ8rcxWvNX3tCr3btRmP/view?usp=drive_link' },
        { name: 'Hotline', url: 'https://drive.google.com/file/d/1LyM_AaeyeJeojVSVj_RxMT9wTEzwc_cK/view?usp=drive_link' },
      ],
      nikoaed: [
        { name: 'Topaz setting and CC set (18 CC)', url: 'https://drive.google.com/file/d/1AL4vgxJDkBL3ViTYUQ7DzdYnhwM8k5wf/view?usp=drive_link' },
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
