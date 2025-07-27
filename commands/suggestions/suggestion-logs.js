const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(process.cwd(), 'data/suggestionConfig.json');
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggestion-logs')
    .setDescription('Set or remove the suggestion logs channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Action type')
        .setRequired(true)
        .addChoices(
          { name: 'Set', value: 'set' },
          { name: 'Remove', value: 'remove' }
        )
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel to set as logs (only used with type: set)')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction) {
    const type = interaction.options.getString('type');
    const channel = interaction.options.getChannel('channel');

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      if (type === 'set') {
        if (!channel) {
          return await interaction.reply({
            content: 'Please provide a channel to set as suggestion logs.',
            flags: 64
          });
        }

        config[interaction.guild.id] = channel.id;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        return await interaction.reply({
          content: `Suggestion logs channel has been set to ${channel}.`,
          flags: 64
        });
      }

      if (type === 'remove') {
        if (config[interaction.guild.id]) {
          delete config[interaction.guild.id];
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          return await interaction.reply({
            content: `Suggestion logs channel has been removed.`,
            flags: 64
          });
        } else {
          return await interaction.reply({
            content: `No suggestion logs channel was set for this server.`,
            flags: 64
          });
        }
      }
    } catch (err) {
      console.error('Error handling suggestion-logs command:', err);
      await interaction.reply({
        content: 'Something went wrong while configuring suggestion logs.',
        flags: 64
      });
    }
  }
};
