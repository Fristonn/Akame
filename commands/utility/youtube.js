const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch'); // or native fetch if you use Node 18+

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Download a YouTube video via API')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube video URL')
        .setRequired(true)
    ),

  async execute(interaction) {
    const videoUrl = interaction.options.getString('url');

    await interaction.deferReply();

    try {
      const response = await fetch('http://friston.xyz/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return interaction.editReply(`Failed to download video. Error: ${errorData.error || response.statusText}`);
      }

      
      const data = await response.json().catch(() => ({}));

      await interaction.editReply(`Download started for URL: ${videoUrl}`);

    } catch (error) {
      console.error('API request failed:', error);
      await interaction.editReply('An error occurred while trying to download the video.');
    }
  },
};
