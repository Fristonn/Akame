require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const dataFolder = path.join(process.cwd(), 'data');
const configPath = path.join(dataFolder, 'hireConfig.json');
const cooldownPath = path.join(dataFolder, 'hireCooldowns.json');

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
      if (now - timestamp < 3600000) { // 1 hour cooldown for hire posts
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
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Open Hire Form
      if (interaction.isButton() && interaction.customId === 'open_hire_form') {
        // Check if applications are disabled
        if (fs.existsSync(configPath)) {
          try {
            const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            if (cfg.applicationsDisabled) {
              return await interaction.reply({ content: cfg.disabledMessage || 'Hire applications are currently closed.', flags: 64 });
            }
          } catch {}
        }
        const modal = new ModalBuilder()
          .setCustomId('hire_application')
          .setTitle('Hire Application');

        const questions = [
          '1. What role are you hiring for?',
          '2. Briefly describe the responsibilities',
          '3. Required skills/experience',
          '4. Budget (if any) and timeline',
          '5. Contact info'
        ];

        const components = questions.map((q, i) =>
          new ActionRowBuilder().addComponents(
            new TextInputBuilder()
              .setCustomId(`hq${i + 1}`)
              .setLabel(q.slice(0, 45))
              .setStyle(TextInputStyle.Paragraph)
              .setRequired(true)
          )
        );

        modal.addComponents(...components);
        return await interaction.showModal(modal);
      }

      // Handle Hire Form Submit
      if (interaction.isModalSubmit() && interaction.customId === 'hire_application') {
        ensureDataFiles();
        const cooldowns = readCooldowns();
        const now = Date.now();
        const userId = interaction.user.id;

        if (cooldowns[userId] && now - cooldowns[userId] < 3600000) {
          const remaining = 3600000 - (now - cooldowns[userId]);
          const minutes = Math.ceil(remaining / 60000);
          return await interaction.reply({ content: `You can only submit a hire request once every 60 minutes. Try again in ~${minutes}m.`, flags: 64 });
        }

        if (!fs.existsSync(configPath)) {
          return await interaction.reply({ content: 'Hire configuration missing. Please set review channel with /hire-form.', flags: 64 });
        }

        const answers = Array.from({ length: 5 }, (_, i) => interaction.fields.getTextInputValue(`hq${i + 1}`));

        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const targetChannel = interaction.guild.channels.cache.get(config.reviewChannelId);
        if (!targetChannel) {
          return await interaction.reply({ content: 'Hire review channel not found.', flags: 64 });
        }

        const reviewConfigPath = path.join(dataFolder, 'hireReviewConfig.json');
        let reviewerPing = '';
        if (fs.existsSync(reviewConfigPath)) {
          const reviewConfig = JSON.parse(fs.readFileSync(reviewConfigPath, 'utf8'));
          const reviewerRoleId = reviewConfig[interaction.guild.id];
          if (reviewerRoleId) reviewerPing = `<@&${reviewerRoleId}> New hire application received.`;
        }

        const embed = new EmbedBuilder()
          .setTitle('New Hire Application')
          .setDescription(`From ${interaction.user.username} (<@${userId}>)`)
          .addFields(
            { name: '1. Role', value: answers[0] },
            { name: '2. Responsibilities', value: answers[1] },
            { name: '3. Requirements', value: answers[2] },
            { name: '4. Budget & Timeline', value: answers[3] },
            { name: '5. Contact', value: answers[4] },
            { name: 'User ID', value: `||${userId}||`, inline: true }
          )
          .setTimestamp()
          .setFooter({ text: '© Friston Systems • 2025', iconURL: client.user.displayAvatarURL() });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`hire_accept_${userId}`).setLabel('Accept').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`hire_decline_${userId}`).setLabel('Decline').setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId(`hire_contact_${userId}`).setLabel('Request Contact').setStyle(ButtonStyle.Secondary)
        );

        await targetChannel.send({ content: reviewerPing || null, embeds: [embed], components: [row] });

        await interaction.reply({ content: 'Your hire request has been submitted successfully.', flags: 64 });

        cooldowns[userId] = now;
        saveCooldowns(cooldowns);
        return;
      }

      // Handle Hire Action Buttons
      if (interaction.isButton() && interaction.customId.startsWith('hire_')) {
        if (!interaction.deferred && !interaction.replied) {
          try { await interaction.deferReply({ flags: 64 }); } catch {}
        }

        const [_, action, userId] = interaction.customId.split('_');

        const reviewConfigPath = path.join(dataFolder, 'hireReviewConfig.json');
        let allow = false;
        if (fs.existsSync(reviewConfigPath)) {
          const reviewConfig = JSON.parse(fs.readFileSync(reviewConfigPath, 'utf8'));
          const reviewerRoleId = reviewConfig[interaction.guild.id];
          if (reviewerRoleId && interaction.member.roles.cache.has(reviewerRoleId)) allow = true;
        }
        if (!allow && interaction.user.id !== interaction.guild.ownerId && interaction.user.id !== process.env.OWNER_ID) {
          return await interaction.editReply({ content: 'You are not allowed to perform this action.' });
        }

        const targetUser = await client.users.fetch(userId).catch(() => null);
        const guildName = interaction.guild.name;
        let dmMsg = '';
        switch (action) {
          case 'accept':
            dmMsg = `Your hire request in ${guildName} was accepted. Our team will contact you shortly.`;
            break;
          case 'decline':
            dmMsg = `Your hire request in ${guildName} was declined.`;
            break;
          case 'contact':
            dmMsg = `Please provide more contact details for your hire request in ${guildName}.`;
            break;
        }
        if (targetUser && dmMsg) {
          await targetUser.send({ content: dmMsg }).catch(() => {});
        }
        return await interaction.editReply({ content: `Action "${action}" completed for <@${userId}>.` });
      }
    } catch (err) {
      console.error('Hire handler error:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Something went wrong.', flags: 64 }).catch(() => {});
      }
    }
  }
};


