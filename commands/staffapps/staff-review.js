
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'data', 'staffReviewConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('staff-review-role')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription('Set the reviewer role to ping when a new staff application is submitted')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option
        .setName('role')
        .setDescription('The role to ping on new staff submissions')
        .setRequired(true)
    ),
  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const folderPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    config[interaction.guild.id] = role.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({
      content: `Staff **reviewer role** set to <@&${role.id}>.`,
      flags: 64
    });
  }
};