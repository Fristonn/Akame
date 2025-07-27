const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kicks a user from the server.')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('The user to kick')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if the user has KickMembers permission
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
    }

    const member = interaction.options.getMember('target');
    if (!member) {
      return interaction.reply({ content: 'That user is not in this server.', flags: 64 });
    }

    if (!member.kickable) {
      return interaction.reply({ content: 'I cannot kick this user. They may have a higher role than me or have special permissions.', flags: 64 });
    }

    try {
      await member.kick();
      await interaction.reply({ content: `${member.user.tag} has been kicked.` });
    } catch (error) {
      if (error.code === 50013) {
        return interaction.reply({ content: 'I do not have permission to kick this user.', flags: 64 });
      }
      console.error('Error kicking member:', error);
      return interaction.reply({ content: 'An unexpected error occurred while trying to kick that user.', flags: 64 });
    }
  }
};
