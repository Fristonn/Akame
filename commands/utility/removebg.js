// commands/removebg.js
const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removebg')
    .setDescription('Removes background from the uploaded image')
    .addAttachmentOption(option =>
      option.setName('image').setDescription('Image file').setRequired(true)
    ),

  async execute(interaction) {
    const attachment = interaction.options.getAttachment('image');

    if (!attachment.contentType.startsWith('image/')) {
      return interaction.reply({
        content: 'Please upload a valid image file.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    try {
      const response = await axios({
        method: 'post',
        url: 'https://api.remove.bg/v1.0/removebg',
        data: {
          image_url: attachment.url,
          size: 'auto',
        },
        headers: {
          'X-Api-Key': process.env.REMOVE_BG_API_KEY,
        },
        responseType: 'arraybuffer',
      });

      const resultBuffer = Buffer.from(response.data, 'binary');
      const file = new AttachmentBuilder(resultBuffer, { name: 'no-bg.png' });

      await interaction.editReply({
        content: 'Background removed!',
        files: [file],
      });
    } catch (error) {
      console.error(error?.response?.data || error);
      await interaction.editReply({
        content: 'Failed to remove background, Contact Friston to inform so he can Check API key or rate limits.',
      });
    }
  },
};
