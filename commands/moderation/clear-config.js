const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('delete-config')
    .setDescription('Deletes a config file from the data folder')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const configPath = path.join(process.cwd(), 'data');
    if (!fs.existsSync(configPath)) {
      return interaction.reply({ content: 'No data folder found.', flags: 64 });
    }

    const files = fs.readdirSync(configPath).filter(file => file.endsWith('.json'));
    if (files.length === 0) {
      return interaction.reply({ content: 'No  config files found in data.', flags: 64 });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select_config_delete')
      .setPlaceholder('Select a config to delete')
      .addOptions(
        files.map(file => ({
          label: file,
          value: file,
        }))
      );

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: 'Choose a config file to delete:',
      components: [row],
      flags: 64,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30_000,
      max: 1,
    });

    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.user.id !== interaction.user.id)
        return selectInteraction.reply({ content: 'This menu isn’t for you.', flags: 64 });

      const selectedFile = selectInteraction.values[0];
      const selectedPath = path.join(configPath, selectedFile);

      try {
        fs.unlinkSync(selectedPath);
        await selectInteraction.update({
          content: `\`${selectedFile}\` deleted successfully.`,
          components: [],
        });
      } catch (err) {
        await selectInteraction.update({
          content: `Failed to delete \`${selectedFile}\`\n\`\`\`${err.message}\`\`\``,
          components: [],
        });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          content: 'No config was deleted.',
          components: [],
        }).catch(() => {});
      }
    });
  },
};
