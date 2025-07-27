const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(process.cwd(), 'data/ticket-config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tickets-staff')
    .setDescription('Set the staff role with ticket access')
    .addRoleOption(opt =>
      opt.setName('role')
        .setDescription('Staff role')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const config = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath))
      : {};

    config.staffRoleId = role.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return interaction.reply({ content: `Staff role set to **${role.name}**.`, flags: 64 });
  }
};
