require('dotenv').config();

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    if (!interaction.isStringSelectMenu()) return;
    if (interaction.customId !== 'server_select') return;
    if (interaction.user.id !== process.env.OWNER_ID) return;

    const guildId = interaction.values[0];
    const guild = interaction.client.guilds.cache.get(guildId);

    if (!guild) {
      return interaction.reply({
        content: 'Guild not found or already left.',
        flags: 64
      });
    }

    try {
      await guild.leave();
      await interaction.reply({
        content: `Successfully left **${guild.name}** (ID: ${guild.id})`,
        flags: 64
      });
    } catch (err) {
      await interaction.reply({
        content: `Failed to leave guild: ${err.message}`,
        flags: 64
      });
    }
  }
};
