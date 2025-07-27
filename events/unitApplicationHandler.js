require('dotenv').config();
const fs = require('fs');
const path = require('path');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const dataFolder = path.join(process.cwd(), 'data');
const configPath = path.join(dataFolder, 'unitConfig.json');
const cooldownPath = path.join(dataFolder, 'applyCooldowns.json');

function ensureDataFiles() {
  if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder);
  if (!fs.existsSync(cooldownPath)) fs.writeFileSync(cooldownPath, '{}');
}

function readCooldowns() {
  ensureDataFiles();
  try {
    const data = JSON.parse(fs.readFileSync(cooldownPath, 'utf8'));
    const now = Date.now();
    const filtered = {};

    for (const [userId, timestamp] of Object.entries(data)) {
      if (now - timestamp < 86400000) {
        filtered[userId] = timestamp;
      }
    }

    fs.writeFileSync(cooldownPath, JSON.stringify(filtered, null, 2));
    return filtered;
  } catch {
    return {};
  }
}

function saveCooldowns(data) {
  fs.writeFileSync(cooldownPath, JSON.stringify(data, null, 2));
}

module.exports = {
  async handleUnitApplication(interaction, client) {
    ensureDataFiles();

    const cooldowns = readCooldowns();
    const now = Date.now();
    const userId = interaction.user.id;

    if (cooldowns[userId] && now - cooldowns[userId] < 86400000) {
      const remaining = 86400000 - (now - cooldowns[userId]);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return await interaction.reply({
        content: `You can only apply once every 24 hours. Please try again in ${hours}h ${minutes}m.`,
        flags: 64,
      });
    }

    if (!fs.existsSync(configPath)) {
      return await interaction.reply({
        content: 'Configuration file missing. Please contact an administrator.',
        flags: 64,
      });
    }

    const answers = Array.from({ length: 5 }, (_, i) =>
      interaction.fields.getTextInputValue(`uq${i + 1}`)
    );

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const targetChannel = interaction.guild.channels.cache.get(config.reviewChannelId);

    if (!targetChannel) {
      return await interaction.reply({
        content: 'Unit application channel not found.',
        flags: 64,
      });
    }

    const reviewConfigPath = path.join(dataFolder, 'unitReviewConfig.json');
    let reviewerPing = '';
    if (fs.existsSync(reviewConfigPath)) {
      const reviewConfig = JSON.parse(fs.readFileSync(reviewConfigPath, 'utf8'));
      const reviewerRoleId = reviewConfig[interaction.guild.id];
      if (reviewerRoleId) {
        reviewerPing = `<@&${reviewerRoleId}> Wakeyy wakeyy... A new unit application has been submitted <:jett_love:1377994902410887309>`;
      }
    }

    const embed = new EmbedBuilder()
      .setTitle('New Unit Application')
      .setDescription(`From ${interaction.user.username} (<@${userId}>)`)
      .addFields(
        { name: '1. Discord Username', value: answers[0] },
        { name: '2. Why do you want to join our unit?', value: answers[1] },
        { name: '3. What style do you edit mostly?', value: answers[2] },
        { name: '4. Send your best edit? (1 max)', value: answers[3] },
        { name: '5. What editing softwares do you use?', value: answers[4] },
        { name: 'User ID', value: `||${userId}||`, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text: '© Friston Systems • 2025',
        iconURL: client.user.displayAvatarURL(),
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`unit_accept_${userId}`).setLabel('Accept').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`unit_decline_${userId}`).setLabel('Decline').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId(`unit_trial_${userId}`).setLabel('Trial').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId(`unit_reapply_${userId}`).setLabel('Re-Apply').setStyle(ButtonStyle.Primary)
    );

    await targetChannel.send({
      content: reviewerPing || null,
      embeds: [embed],
      components: [row],
    });

    await interaction.reply({
      content: 'Your unit application has been submitted successfully.',
      flags: 64,
    });

    cooldowns[userId] = now;
    saveCooldowns(cooldowns);
  },

  async handleUnitAction(interaction, client) {
    try {
      if (!interaction.deferred && !interaction.replied) {
        try {
          await interaction.deferReply({ ephemeral: true });
        } catch (err) {
          console.error('Failed to defer interaction:', err);
          return;
        }
      }

      const [_, action, userId] = interaction.customId.split('_');

      const isBotOwner = interaction.user.id === process.env.OWNER_ID;
      const isGuildOwner = interaction.user.id === interaction.guild.ownerId;

      if (!isBotOwner && !isGuildOwner) {
        return await interaction.editReply({
          content: 'Only the bot owner or server owner can use these buttons.',
        });
      }

      if (!fs.existsSync(configPath)) {
        return await interaction.editReply({ content: 'Configuration file not found.' });
      }

      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      let member;
      try {
        member = interaction.guild.members.cache.get(userId) || await interaction.guild.members.fetch(userId);
      } catch {
        member = null;
      }

      if (member) {
        try {
          if (action === 'accept' && config.acceptedRoleId) {
            await member.roles.add(config.acceptedRoleId);
          }
          if (action === 'trial' && config.trialRoleId) {
            await member.roles.add(config.trialRoleId);
          }
        } catch (err) {
          console.error('Error assigning role:', err);
        }
      }

      const targetUser = await client.users.fetch(userId).catch(() => null);
      const guildName = interaction.guild.name;
      let dmMsg = '';

      switch (action) {
        case 'accept':
          dmMsg = config.acceptDM || `You’ve been accepted as a unit member in ${guildName}.`;
          break;
        case 'decline':
          dmMsg = config.declineDM || `Your unit application in ${guildName} was declined.`;
          break;
        case 'trial':
          dmMsg = config.trialDM || `You’ve been placed on trial as a unit member in ${guildName}.`;
          break;
        case 'reapply':
          dmMsg = config.reapplyDM || `You’ve been asked to re-apply for unit member in ${guildName}.`;
          break;
      }

      if (targetUser && dmMsg) {
        await targetUser.send({ content: dmMsg }).catch(() => {});
      }

      return await interaction.editReply({
        content: `Action "${action}" completed for <@${userId}>.`,
      });
    } catch (error) {
      console.error('Error handling unit action:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'An error occurred.', flags: 64 });
      } else {
        await interaction.editReply({ content: 'An error occurred while processing the action.' });
      }
    }
  },
};
