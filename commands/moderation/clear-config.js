const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-config')
    .setDescription('Delete specific config data for this server')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Which config data to delete')
        .setRequired(true)
        .addChoices(
          { name: 'Staff Form (channel where applications are sent)', value: 'staff-form' },
          { name: 'Staff Role (role to give after acceptance)', value: 'staff-role' },
          { name: 'Staff Review Role (pinged when form is submitted)', value: 'staff-review' },
          { name: 'Unit Config (unit-related roles & channels)', value: 'unit' },
          { name: 'Unit Review Role (pinged when unit form is submitted)', value: 'unit-review' },
          { name: 'Form Questions (Staff Applications Channels)', value: 'form-config' }
        )
    ),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const guildId = interaction.guild.id;

    const paths = {
      'staff-form': path.join(process.cwd(), 'data', 'staffFormConfig.json'),
      'staff-role': path.join(process.cwd(), 'data', 'staffConfig.json'),
      'staff-review': path.join(process.cwd(), 'data', 'staffReviewConfig.json'),
      'unit': path.join(process.cwd(), 'data', 'unitConfig.json'),
      'unit-review': path.join(process.cwd(), 'data', 'unitReviewConfig.json'),
      'form-config': path.join(process.cwd(), 'data', 'formConfig.json')
    };

    const labels = {
      'staff-form': 'staff form',
      'staff-role': 'staff role',
      'staff-review': 'staff review',
      'unit': 'unit',
      'unit-review': 'unit review',
      'form-config': 'form questions'
    };

    const filePath = paths[type];
    const label = labels[type];

    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });

    if (!fs.existsSync(filePath)) {
      return interaction.reply({
        content: `No ${label} config file found.`,
        flags: 64
      });
    }

    let config;
    try {
      config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
      return interaction.reply({
        content: `Could not read ${label} config (file may be corrupt).`,
        flags: 64
      });
    }

    let updated = false;

    if (config[guildId]) {
      delete config[guildId];
      updated = true;
    } else if (typeof config === 'object' && Object.keys(config).length > 0) {
      config = {};
      updated = true;
    }

    if (!updated) {
      return interaction.reply({
        content: `No ${label} config is set for this server.`,
        flags: 64
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));

    return interaction.reply({
      content: `I've Successfully deleted ${label} config for this server.`,
      flags: 64
    });
  }
};
