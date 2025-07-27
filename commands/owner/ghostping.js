const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ghost-ping')
    .setDescription('Ghost ping a user or role (message gets deleted quickly)')
    .addMentionableOption(option =>
      option.setName('target')
        .setDescription('The user or role to ghost ping')
        .setRequired(true)),
  // .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // Uncomment to allow admins

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;

    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: 'Only the bot owner can use this command.', flags: 64 });
    }

    const target = interaction.options.getMentionable('target');

    const pingMessage = await interaction.channel.send(`${target}`);
    await interaction.reply({ content: 'Ghost ping sent.', flags: 64 });

    setTimeout(() => {
      pingMessage.delete().catch(() => {});
    }, 1000); // 1 second
  },
};
