const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('slowmode')
    .setDescription('Set the slowmode delay for the current channel')
    .addIntegerOption(option =>
      option.setName('seconds')
        .setDescription('Number of seconds for slowmode (0 to disable)')
        .setRequired(true)
    ),

  async execute(interaction) {
    const seconds = interaction.options.getInteger('seconds');
    const member = await interaction.guild.members.fetch(interaction.user.id);

    if (!member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute',
        flags: 64,
      });
    }

    try {
      await interaction.channel.setRateLimitPerUser(seconds);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Slowmode Updated')
        .setDescription(`Slowmode has been set to **${seconds} seconds** in this channel.`)
        .setFooter({ 
          text: `(© Friston Systems • 2025)`, 
          iconURL: interaction.client.user.displayAvatarURL() // Bot avatar
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: 'Failed to update slowmode. I may not have permission.',
        flags: 64,
      });
    }
  },
};
