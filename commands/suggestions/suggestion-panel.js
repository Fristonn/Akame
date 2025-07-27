const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion-panel')
    .setDescription('Send the suggestion panel to a selected channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the suggestion panel to')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle('Share Your Ideas')
      .setDescription([
        `Got an idea to improve the bot or the community? We're all ears.`,
        ``,
        `<a:arrow:1397679707356532797> Click the button below to open the suggestion form.`,
        `<a:arrow:1397679707356532797> Provide clear, specific suggestions — the more detailed, the better.`,
        ``,
        `Your input directly help up for future updates.`
      ].join('\n'))
      .setColor(0xbbd8ff)
      .setFooter({
        text: '(© Friston Systems 2025)',
        iconURL: interaction.client.user.displayAvatarURL()
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('openSuggestionModal')
        .setLabel('Submit a Suggestion')
        .setStyle(ButtonStyle.Primary)
    );

    try {
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({
        content: `Suggestion panel sent to ${channel}.`,
        flags: 64
      });
    } catch (err) {
      console.error('Error sending suggestion panel:', err);
      await interaction.reply({
        content: 'Failed to send the suggestion panel.',
        flags: 64
      });
    }
  }
};
