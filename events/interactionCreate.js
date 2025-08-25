const {
  PermissionsBitField,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const handleStaffApplication = require('./staffApplicationHandler');
const { handleUnitApplication, handleUnitAction } = require('./unitApplicationHandler');


module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    try {
      // Block slash commands and context menu commands in DMs
      if (
        (interaction.isCommand() ||
         interaction.isUserContextMenuCommand() ||
         interaction.isMessageContextMenuCommand()) &&
        !interaction.guild
      ) {
        return await interaction.reply({
          content: "You can't use bot commands in DMs.",
          flags: 64, // ephemeral
        });
      }

      // --- AFK Handler ---
      const afkData = client.afk.get(interaction.user.id);
      if (afkData) {
        client.afk.delete(interaction.user.id);
        if (interaction.channel && interaction.channel.isTextBased()) {
          try {
            const reply = await interaction.channel.send(`${interaction.user} you are no longer AFK.`);
            setTimeout(() => reply.delete().catch(() => {}), 15000);
          } catch (err) {
            console.error('AFK message error:', err);
          }
        }
      }

      // --- Slash Command Handling ---
      if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
          await command.execute(interaction, client);

          // Return early if command is counters (modal shown inside command)
          if (interaction.commandName === 'counters') return;

          // Command Logging
          const logPath = path.join(__dirname, '..', 'logchannels.json');
          if (fs.existsSync(logPath)) {
            const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'));
            const logChannelId = logs[interaction.guild.id];
            if (logChannelId) {
              let logChannel = interaction.guild.channels.cache.get(logChannelId);
              if (!logChannel) {
                try {
                  logChannel = await interaction.guild.channels.fetch(logChannelId);
                } catch (e) {
                  console.warn('Log channel fetch failed:', e.message);
                }
              }

              if (logChannel) {
                let options = 'None';
                if (interaction.options.data.length) {
                  options = interaction.options.data.map(opt => {
                    if (opt.options?.length) {
                      return `**${opt.name}**:\n` + opt.options.map(sub => `• ${sub.name}: \`${sub.value ?? 'None'}\``).join('\n');
                    } else {
                      return `**${opt.name}**: \`${opt.value ?? 'None'}\``;
                    }
                  }).join('\n');
                }

                const embed = new EmbedBuilder()
                  .setTitle('📘 Command Used')
                  .addFields(
                    { name: 'User', value: `${interaction.user.tag} (<@${interaction.user.id}>)`, inline: false },
                    { name: 'Command', value: `/${interaction.commandName}`, inline: true },
                    { name: 'Options', value: options, inline: false },
                    { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: false }
                  )
                  .setFooter({ text: '(© Friston Systems • 2025)', iconURL: interaction.user.displayAvatarURL() })
                  .setColor('Blurple');

                logChannel.send({ embeds: [embed] }).catch(() => {});
              }
            }
          }

        } catch (error) {
          console.error(`Error executing /${interaction.commandName}:`, error);
          const replyContent = { content: 'There was an error while executing this command!', flags: 64 };
          if (interaction.replied || interaction.deferred) {
            await interaction.followUp(replyContent).catch(() => {});
          } else {
            await interaction.reply(replyContent).catch(() => {});
          }
        }
        return;
      }

      // --- Counters Modal Submit Handler (added) ---
      if (interaction.isModalSubmit() && interaction.customId === 'vanityModal') {
        try {
          // Dynamically require the counters command using process.cwd()
          const countersCommand = require(path.join(process.cwd(), 'commands', 'counters.js'));
          await countersCommand.handleModal(interaction);
        } catch (err) {
          console.error('Counters Modal Submit Error:', err);
          if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Error setting up counters.', flags: 64 }).catch(() => {});
          }
        }
        return;
      }

      // --- Staff Form Button ---
      if (interaction.isButton() && interaction.customId === 'open_staff_form') {
        try {
          // Check if staff applications are disabled
          const staffConfigPath = path.join(process.cwd(), 'data', 'staffConfig.json');
          if (fs.existsSync(staffConfigPath)) {
            const staffConfig = JSON.parse(fs.readFileSync(staffConfigPath, 'utf8'));
            if (staffConfig.applicationsDisabled) {
              return await interaction.reply({ 
                content: staffConfig.disabledMessage || '**Staff applications are currently disabled.**', 
                flags: 64 
              });
            }
          }

          const modal = new ModalBuilder()
            .setCustomId('staff_application')
            .setTitle('Staff Applications');

          const questions = [
            'Tell us a bit about yourself.',
            'How long have you been here?',
            'Why do you want to become a staff member?',
            'Do you have mod/management experience?',
            'How often are you available?'
          ];

          const components = questions.map((q, i) =>
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(`q${i + 1}`)
                .setLabel(q.slice(0, 45))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

          modal.addComponents(...components);
          return await interaction.showModal(modal);
        } catch (err) {
          console.error('Staff Modal Error:', err);
          if (!interaction.replied && !interaction.deferred) {
            return await interaction.reply({ content: 'Could not open the staff form.', flags: 64 }).catch(() => {});
          }
        }
      }

      // --- Staff Form Submission ---
      if (interaction.isModalSubmit() && interaction.customId === 'staff_application') {
        try {
          return await handleStaffApplication(interaction, client);
        } catch (err) {
          console.error('Staff Form Submit Error:', err);
          if (!interaction.replied && !interaction.deferred) {
            return await interaction.reply({ content: 'Error submitting your staff form.', flags: 64 }).catch(() => {});
          }
        }
      }

      // --- Unit Form Button ---
      if (interaction.isButton() && interaction.customId === 'open_unit_form') {
        try {
          // Check if applications are disabled first
          const configPath = path.join(process.cwd(), 'data', 'unitConfig.json');
          if (require('fs').existsSync(configPath)) {
            try {
              const config = JSON.parse(require('fs').readFileSync(configPath, 'utf8'));
              if (config.applicationsDisabled) {
                const disabledMessage = config.disabledMessage || 'Unit applications are currently disabled.';
                return await interaction.reply({
                  content: disabledMessage,
                  flags: 64,
                });
              }
            } catch (error) {
              console.error('Error reading config:', error);
            }
          }

          // If applications are enabled, show the modal
          const modal = new ModalBuilder()
            .setCustomId('unit_application')
            .setTitle('Unit Applications');

          const questions = [
            '1. Discord Username',
            '2. Why do you want to join our unit?',
            '3. What style do you edit mostly?',
            '4. Send your best edit? (1 max)',
            '5. What editing softwares do you use?'
          ];

          const components = questions.map((q, i) =>
            new ActionRowBuilder().addComponents(
              new TextInputBuilder()
                .setCustomId(`uq${i + 1}`)
                .setLabel(q.slice(0, 45))
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
            )
          );

          modal.addComponents(...components);
          return await interaction.showModal(modal);
        } catch (err) {
          console.error('Unit Modal Error:', err);
          if (!interaction.replied && !interaction.deferred) {
            return await interaction.reply({ content: 'Could not open the unit form.', flags: 64 }).catch(() => {});
          }
        }
      }

      // --- Unit Form Submission ---
      if (interaction.isModalSubmit() && interaction.customId === 'unit_application') {
        try {
          return await handleUnitApplication(interaction, client);
        } catch (err) {
          console.error('Unit Form Submit Error:', err);
          if (!interaction.replied && !interaction.deferred) {
            return await interaction.reply({ content: 'Error submitting your unit application.', flags: 64 }).catch(() => {});
          }
        }
      }

      // --- Unit Action Buttons ---
      if (interaction.isButton() && interaction.customId.startsWith('unit_')) {
        try {
          return await handleUnitAction(interaction, client);
        } catch (err) {
          console.error('Unit Action Error:', err);
          if (!interaction.replied && !interaction.deferred) {
            return await interaction.reply({ content: 'Failed to process this action.', flags: 64 }).catch(() => {});
          }
        }
      }



    } catch (finalError) {
      console.error('Unhandled interaction error:', finalError);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Something went wrong.', flags: 64 }).catch(() => {});
      }
    }
  }
};
