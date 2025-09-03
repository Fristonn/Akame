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
    .setName('hire-apps')
    .setDescription('Send the Hire Application panel to a selected channel')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to send the application panel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const embed = new EmbedBuilder()
      .setTitle('Hire Someone')
      .setDescription(`Looking to hire someone? Click the button below to submit your hiring request.

**Important Rules to Follow:**
• Always pay some money upfront or give a guarantee before final payment
• Give as many details as possible about what you need
• If something isn't clear, try to work on it until it makes sense
• Always tell us how you want to pay - list all your payment methods (the more options, the better)
• Sometimes you and the designer/editor might be in different time zones, so be patient waiting for replies - one of you might be busy or sleeping

Click the button below to get started!`)
      .setColor('#bbd8ff')
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: interaction.client.user.displayAvatarURL() });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_hire_form')
        .setLabel('Post Hiring Request')
        .setStyle(ButtonStyle.Primary)
    );

    await channel.send({ embeds: [embed], components: [row] });

    await interaction.reply({ content: `Hire application panel sent to ${channel}`, flags: 64 });
  }
};



