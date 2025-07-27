const { SlashCommandBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID; // Make sure to set OWNER_ID in your environment variables
const O2_GRAND_LINK = ''; // Replace with your actual saved link

module.exports = {
  data: new SlashCommandBuilder()
    .setName('getlink')
    .setDescription('Sends you the saved OAuth2 link'),

  async execute(interaction) {
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: "Seriously? You think you’re allowed to do that? Aww..Cute", flags: 64 });
    }

    try {
      await interaction.user.send(`Here is your saved OAuth2 link:\n${O2_GRAND_LINK}`);
      await interaction.reply({ content: 'I have sent you the link in DMs!', flags: 64 });
    } catch (error) {
      console.error('Failed to send DM:', error);
      await interaction.reply({ content: "I couldn't send you a DM. Please check your privacy settings.", flags: 64 });
    }
  },
};
