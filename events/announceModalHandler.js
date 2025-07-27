module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;

    if (!interaction.customId.startsWith('announceModal_')) return;

    const channelId = interaction.customId.split('_')[1];
    const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      return interaction.reply({ content: 'Selected channel not found or inaccessible.', flags: 64 });
    }

    const rawMessage = interaction.fields.getTextInputValue('announcementMessage');
    const command = client.commands.get('announce');

    let message;
    if (command && command.replacePlaceholders) {
      message = command.replacePlaceholders(rawMessage, interaction, channel);
    } else {
      message = rawMessage; // fallback - send raw message if replace not found
    }

    try {
      await interaction.deferReply({ flags: 64 });

      await channel.send({
        content: message,
        allowedMentions: { parse: ['everyone', 'users', 'roles'] },
      });

      await interaction.editReply({ content: `Announcement sent to ${channel}` });
    } catch (error) {
      console.error('Error sending announcement:', error);
      await interaction.editReply({ content: `Failed to send announcement: ${error.message}` });
    }
  },
};
