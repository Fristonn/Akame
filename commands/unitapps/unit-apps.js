const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unit-apps')
    .setDescription('Send the Unit Application panel to a selected channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the application panel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle('📋 Unit Applications Open')
      .setDescription('Want to join the Unit? Click the button below to fill the form! 💗')
      .setColor('#ff69b4')
      .setFooter({ text: '© Friston Systems • 2025', iconURL: interaction.client.user.displayAvatarURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_unit_form')
        .setLabel('Apply Now 📝')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({ content: `Application panel sent to ${channel}`, flags: 64 });
  }
};
