const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-dm')
    .setDescription('Deletes direct messages that the bot has sent to a specified user (Owner only)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Number of bot DMs to delete')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User whose DMs you want to delete')
        .setRequired(false)
    ),

  async execute(interaction) {
    const OWNER_ID = process.env.OWNER_ID;
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({ content: 'Seriously? You think you’re allowed to do that? Aww.. Cute.', flags: 64 });
    }

    const targetUser = interaction.options.getUser('user') || interaction.user;
    const amount = interaction.options.getInteger('amount');
    await interaction.deferReply({ flags: 64 });

    try {
      const dmChannel = await targetUser.createDM();
      const messages = await dmChannel.messages.fetch({ limit: amount + 5 });

      const deletable = messages.filter(msg => msg.author.id === interaction.client.user.id);
      let deleted = 0;

      for (const [, msg] of deletable) {
        try {
          await msg.delete();
          deleted++;
        } catch (err) {
          // Skip non-deletable messages
        }
        if (deleted >= amount) break;
      }

      await interaction.editReply({ content: `Successfully deleted ${deleted} messages from DMs with **${targetUser.tag}**.` });
    } catch (err) {
      await interaction.editReply({ content: `Failed to delete messages: ${err.message}` });
    }
  }
};
