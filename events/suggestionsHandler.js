const {
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  EmbedBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

// Config file paths
const configPath = path.resolve(__dirname, '../data/suggestionConfig.json');
const limitsPath = path.resolve(__dirname, '../data/suggestionLimits.json');

// Ensure config files exist
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');
if (!fs.existsSync(limitsPath)) fs.writeFileSync(limitsPath, '{}');

module.exports = {
  name: Events.InteractionCreate,

  async execute(interaction) {
    // Show modal on button press
    if (interaction.isButton() && interaction.customId === 'openSuggestionModal') {
      const modal = new ModalBuilder()
        .setCustomId('suggestionModal')
        .setTitle('Submit Your Suggestion');

      const input = new TextInputBuilder()
        .setCustomId('suggestionInput')
        .setLabel('What would you like to suggest?')
        .setPlaceholder('e.g., Add a /profile command to view user stats')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000);

      const row = new ActionRowBuilder().addComponents(input);
      modal.addComponents(row);

      return await interaction.showModal(modal);
    }

    // Handle modal submission
    if (interaction.isModalSubmit() && interaction.customId === 'suggestionModal') {
      const now = Date.now();
      const userId = interaction.user.id;
      const guildId = interaction.guild.id;

      // Load and parse rate limits from disk
      const rawLimits = JSON.parse(fs.readFileSync(limitsPath, 'utf-8'));
      if (!rawLimits[guildId]) rawLimits[guildId] = {};
      if (!rawLimits[guildId][userId]) rawLimits[guildId][userId] = [];

      // Clean old timestamps (older than 6 hours)
      const timestamps = rawLimits[guildId][userId].filter(ts => now - ts < 6 * 60 * 60 * 1000);

      // Check limits
      const within10Min = timestamps.some(ts => now - ts < 10 * 60 * 1000);
      const within6Hours = timestamps.length >= 2;

      if (within10Min) {
        const last = Math.max(...timestamps);
        const timeLeft = 10 * 60 * 1000 - (now - last);
        const mins = Math.ceil(timeLeft / 60000);
        return await interaction.reply({
          content: `Please wait *${mins}* minute before sending another suggestion.`,
          flags: 64
        });
      }

      if (within6Hours) {
        const oldest = timestamps.sort()[0];
        const timeLeft = 6 * 60 * 60 * 1000 - (now - oldest);
        const hrs = Math.floor(timeLeft / 3600000);
        const mins = Math.floor((timeLeft % 3600000) / 60000);
        return await interaction.reply({
          content: `You've reached the 6-hour limit (2 suggestions). Try again in ${hrs}h ${mins}m.`,
          flags: 64
        });
      }

      // Add current timestamp and save
      timestamps.push(now);
      rawLimits[guildId][userId] = timestamps;
      fs.writeFileSync(limitsPath, JSON.stringify(rawLimits, null, 2));

      const suggestion = interaction.fields.getTextInputValue('suggestionInput');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      const logChannelId = config[guildId];

      // No channel set
      if (!logChannelId) {
        return await interaction.reply({
          content: 'Suggestion log channel is not configured. Please ask an admin.',
          flags: 64
        });
      }

      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (!logChannel || !logChannel.isTextBased()) {
        return await interaction.reply({
          content: 'The configured log channel is invalid or inaccessible.',
          flags: 64
        });
      }

      // Create embed
      const embed = new EmbedBuilder()
        .setTitle('New Suggestion Received')
        .addFields(
          { name: 'Suggestion', value: suggestion },
          { name: 'Submitted By', value: `<@${interaction.user.id}> (${interaction.user.tag})` }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setColor(0xbbd8ff)
        .setFooter({
          text: '(© Friston Systems 2025)',
          iconURL: interaction.client.user.displayAvatarURL()
        })
        .setTimestamp();

      try {
        await logChannel.send({ embeds: [embed] });
        await interaction.reply({
          content: 'Your suggestion has been submitted successfully. Thank you.',
          flags: 64
        });
      } catch (err) {
        console.error('Failed to send suggestion embed:', err);
        await interaction.reply({
          content: 'Something went wrong while logging your suggestion.',
          flags: 64
        });
      }
    }
  }
};
