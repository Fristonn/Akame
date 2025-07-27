const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(process.cwd(), 'data/ticket-config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-category')
    .setDescription('Set the category where ticket channels will be created')
    .addChannelOption(opt =>
      opt.setName('category')
        .setDescription('Category channel')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const category = interaction.options.getChannel('category');
    if (category.type !== 4)
      return interaction.reply({ content: 'Please select a category channel.', flags: 64 });

    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {};

    config.categoryId = category.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return interaction.reply({ content: `Ticket category set to **${category.name}**.`, flags: 64 });
  }
};
