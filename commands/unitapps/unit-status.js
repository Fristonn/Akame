const {
  SlashCommandBuilder,
  PermissionFlagsBits
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'data', 'unitConfig.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unit-status')
    .setDescription('Enable or disable the Unit Application button')
    .addStringOption(option =>
      option.setName('action')
        .setDescription('Whether to enable or disable applications')
        .addChoices(
          { name: 'Enable Applications', value: 'enable' },
          { name: 'Disable Applications', value: 'disable' }
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const action = interaction.options.getString('action');
    const customMessage = '**Unit applications are currently closed!**\n\nWe\'re not accepting new applications at the moment. Please check back later or contact staff for more information. Thank you for your interest! 💙';

    // Load or create config
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }

    // Ensure data directory exists
    const dataFolder = path.dirname(configPath);
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder, { recursive: true });
    }

    if (action === 'disable') {
      // Update config to disable applications
      config.applicationsDisabled = true;
      config.disabledMessage = customMessage;
      config.disabledBy = interaction.user.id;
      config.disabledAt = new Date().toISOString();

      // Save updated config
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      await interaction.reply({ 
        content: 'Unit applications have been **disabled** successfully!', 
        flags: 64 
      });

    } else if (action === 'enable') {
      // Update config to enable applications
      config.applicationsDisabled = false;
      config.enabledBy = interaction.user.id;
      config.enabledAt = new Date().toISOString();

      // Save updated config
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      await interaction.reply({ 
        content: 'Unit applications have been **enabled** successfully!\n\nUsers can now apply normally.', 
        flags: 64 
      });
    }
  }
};
