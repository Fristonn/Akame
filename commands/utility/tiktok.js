const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tiktok')
    .setDescription('Download a TikTok video using a URL')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('Paste the TikTok video URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const url = interaction.options.getString('url');

    if (!url.includes('tiktok.com')) {
      return await interaction.reply({
        content: 'Please provide a valid TikTok URL.',
        flags: 64
      });
    }

    await interaction.deferReply();

    try {
      const api = `${encodeURIComponent(url)}`; // replace with actual api to download videos
      const response = await fetch(api);
      const data = await response.json();

      if (!data.data || !data.data.play) {
        return await interaction.editReply({
          content: 'Could not fetch the video. It may be private or invalid.',
        });
      }

      const videoUrl = data.data.play;

      const videoRes = await fetch(videoUrl);
      const arrayBuffer = await videoRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const sizeInMB = buffer.length / (1024 * 1024);
      if (sizeInMB > 8) {
        return await interaction.editReply({
          content: `The video is too large to be sent via Discord (${sizeInMB.toFixed(2)} MB).`,
        });
      }

      const fileName = `tiktok_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, fileName);
      fs.writeFileSync(filePath, buffer);

      const attachment = new AttachmentBuilder(filePath, { name: fileName });

      await interaction.editReply({
        content: 'Here is your video bbg:',
        files: [attachment]
      });

      fs.unlinkSync(filePath);

    } catch (err) {
      console.error(err);
      await interaction.editReply({
        content: 'Something went wrong while fetching the video, Contact friston to fix.',
      });
    }
  }
};
