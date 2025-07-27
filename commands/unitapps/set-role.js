const { SlashCommandBuilder, RoleSelectMenuBuilder, PermissionFlagsBits, RoleSelectMenuOptionBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'data/unitConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unit-role')
    .setDescription('Set the accepted or trial role for unit applications')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Accepted or Trial?')
        .addChoices(
          { name: 'Accepted', value: 'acceptedRoleId' },
          { name: 'Trial', value: 'trialRoleId' }
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const type = interaction.options.getString('type');

    let config = {};
    if (fs.existsSync(configPath)) config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    config[type] = role.id;

fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await interaction.reply({ content: `${type === 'acceptedRoleId' ? 'Accepted' : 'Trial'} role set to ${role}`, flags: 64 });
  }
};
