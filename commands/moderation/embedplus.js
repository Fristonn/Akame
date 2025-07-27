const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embedplus')
    .setDescription('Create a custom Advance embed')
    .addChannelOption(option =>
      option.setName('target')
        .setDescription('Channel or thread where the embed will be sent')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.PublicThread,
          ChannelType.PrivateThread
        )
    )
    .addStringOption(option => option.setName('title').setDescription('The title of the embed'))
    .addStringOption(option => option.setName('description').setDescription('The description of the embed'))
    .addStringOption(option => option.setName('color').setDescription('Embed color in hex (e.g.,rgb(161, 233, 243))'))
    .addStringOption(option => option.setName('image').setDescription('URL of the main image'))
    .addStringOption(option => option.setName('thumbnail').setDescription('URL of the thumbnail'))
    .addStringOption(option => option.setName('footer').setDescription('Footer text'))
    .addStringOption(option => option.setName('footer-image').setDescription('URL of the footer icon'))
    .addStringOption(option => option.setName('author').setDescription('Author name'))
    .addStringOption(option => option.setName('author-icon').setDescription('URL of the author icon'))
    .addStringOption(option => option.setName('field-one-name').setDescription('Field 1 title'))
    .addStringOption(option => option.setName('field-one-content').setDescription('Field 1 content'))
    .addStringOption(option => option.setName('field-two-name').setDescription('Field 2 title'))
    .addStringOption(option => option.setName('field-two-content').setDescription('Field 2 content'))
    .addStringOption(option => option.setName('field-three-name').setDescription('Field 3 title'))
    .addStringOption(option => option.setName('field-three-content').setDescription('Field 3 content')),

  async execute(interaction) {
    const embed = new EmbedBuilder();

    const targetChannel = interaction.options.getChannel('target') || interaction.channel;

    const title = interaction.options.getString('title');
    const description = interaction.options.getString('description');
    const color = interaction.options.getString('color');
    const image = interaction.options.getString('image');
    const thumbnail = interaction.options.getString('thumbnail');
    const footer = interaction.options.getString('footer');
    const footerImage = interaction.options.getString('footer-image');
    const author = interaction.options.getString('author');
    const authorIcon = interaction.options.getString('author-icon');

    const fields = [
      {
        name: interaction.options.getString('field-one-name'),
        value: interaction.options.getString('field-one-content'),
      },
      {
        name: interaction.options.getString('field-two-name'),
        value: interaction.options.getString('field-two-content'),
      },
      {
        name: interaction.options.getString('field-three-name'),
        value: interaction.options.getString('field-three-content'),
      },
    ];

    if (title) embed.setTitle(title);
    if (description) embed.setDescription(description);
    if (color) embed.setColor(color.replace(/^#/, ''));
    if (image) embed.setImage(image);
    if (thumbnail) embed.setThumbnail(thumbnail);
    if (footer) embed.setFooter({ text: footer, iconURL: footerImage || null });
    if (author) embed.setAuthor({ name: author, iconURL: authorIcon || null });

    fields.forEach(f => {
      if (f.name && f.value) {
        embed.addFields({ name: f.name, value: f.value });
      }
    });

    embed.setTimestamp();

    // Send the embed to the selected or current channel
    await targetChannel.send({ embeds: [embed] });

    // Acknowledge the command with an ephemeral confirmation
    await interaction.reply({ content: `Embed sent to ${targetChannel}`, flags: 64 });
  },
};
