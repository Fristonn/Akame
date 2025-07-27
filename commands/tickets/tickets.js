const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Send the ticket panel')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const guildName = interaction.guild ? interaction.guild.name : 'Support';

    const embed = new EmbedBuilder()
      .setTitle(`${guildName} | Tickets`)
      .setDescription(
        `Click the dropdown below to open a ticket for anything you need help with.\n\n` +
        `Our staff is active most of the day and will respond as soon as possible. Please open a ticket for one of the following reasons:\n\n` +
        `<a:slide:1385897202202968176> You need help regarding something\n` +
        `<a:slide:1385897202202968176> You want to join the team\n` +
        `<a:slide:1385897202202968176> You want to collaborate or partner\n` +
        `<a:slide:1385897202202968176> You want to sponsor or feature something\n\n` +
        `**Please choose a category below to continue.**`
      )
      .setColor('#bbd8ff');

    const menu = new StringSelectMenuBuilder()
      .setCustomId('ticket_select')
      .setPlaceholder('Create a ticket')
      .addOptions(
        {
          label: 'General Support',
          value: 'general',
          description: 'Need help or have questions',
          emoji: '🧰',
        },
        {
          label: 'Apply',
          value: 'apply',
          description: 'Apply for staff or contributor role',
          emoji: '📝',
        },
        {
          label: 'Partnership',
          value: 'partner',
          description: 'Discuss partnerships or collabs',
          emoji: '🤝',
        },
        {
          label: 'Sponsor',
          value: 'sponsor',
          description: 'Sponsor or promote something',
          emoji: '🎈',
        }
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
