// commands/staffApps/staff-apps.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-apps')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Send the staff application panel to a channel')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to send the staff application panel to')
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild), // Only admins/mods can run this
  async execute(interaction) {
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    const embed = new EmbedBuilder()
      .setTitle('Staff Applications')
      .setDescription([
        '**Interested in joining our staff team? Apply using the button below!**',
        '',
        '** 📌 Rules Before Applying:**',
        '1. Communicate respectfully and handle situations with maturity.',
        '2. Stay active — staff roles are for those who consistently contribute to the community.',
        '3. Alternate accounts are strictly prohibited.',
        '4. Your account must be in this server for at least 7 days before applying.',
        '5. You must be Level 5 or higher to be considered. (Use /rank to check your level)',
        '',
        '⚠️ **Applications that don’t meet these requirements will be ignored.**.'
      ].join('\n'))
      .setColor('#bbd8ff')
      .setFooter({
        text: '(© Friston Systems • 2025)',
        iconURL: interaction.client.user.displayAvatarURL()
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_staff_form')
        .setLabel('Apply for Staff 📝')
        .setStyle(ButtonStyle.Primary)
    );

    await targetChannel.send({ embeds: [embed], components: [row] });

    if (targetChannel.id !== interaction.channel.id) {
      await interaction.reply({ content: `Staff application panel sent to ${targetChannel}.`, flags: 64 });
    } else {
      await interaction.reply({ content: `Panel sent here.`, flags: 64 });
    }
  },
};