const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.join(process.cwd(), 'data/hireConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hire-status')
    .setDescription('Open or close Hire Applications')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option
        .setName('state')
        .setDescription('Open or close applications')
        .addChoices(
          { name: 'Open', value: 'open' },
          { name: 'Close', value: 'close' }
        )
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('message')
        .setDescription('Optional message shown when closed')
        .setRequired(false)
    ),

  async execute(interaction) {
    const state = interaction.options.getString('state');
    const message = interaction.options.getString('message') || 'Hire applications are currently closed.';

    let config = {};
    if (fs.existsSync(configPath)) {
      try { config = JSON.parse(fs.readFileSync(configPath, 'utf8')); } catch { config = {}; }
    }

    if (state === 'open') {
      config.applicationsDisabled = false;
      delete config.disabledMessage;
    } else {
      config.applicationsDisabled = true;
      config.disabledMessage = message;
    }

    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    await interaction.reply({ content: `Hire applications have been ${state === 'open' ? 'opened' : 'closed'}.`, flags: 64 });
  }
};


