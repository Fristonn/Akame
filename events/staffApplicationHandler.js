const fs = require('fs');
const path = require('path');
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const formConfigPath = path.join(process.cwd(), 'data/staffFormConfig.json');

module.exports = async function handleStaffApplication(interaction, client) {
  try {
    const answers = Array.from({ length: 5 }, (_, i) =>
      interaction.fields.getTextInputValue(`q${i + 1}`) || 'N/A'
    );

    if (!fs.existsSync(formConfigPath)) {
      return await interaction.reply({
        content: 'Staff application config missing. Please ask an admin to set the channel.',
        flags: 64
      });
    }

    const config = JSON.parse(fs.readFileSync(formConfigPath, 'utf8'));
    const guildConfig = config[interaction.guild.id];

    if (!guildConfig || !guildConfig.staffApplicationsChannelId) {
      return await interaction.reply({
        content: 'Staff application channel not configured. Please ask an admin to run the setup command.',
        flags: 64
      });
    }

    const channelId = guildConfig.staffApplicationsChannelId;
    const targetChannel = interaction.guild.channels.cache.get(channelId);

    if (!targetChannel) {
      return await interaction.reply({
        content: 'Configured staff application channel not found. Please update the config.',
        flags: 64
      });
    }

    // Load review role config and prepare ping
    const reviewConfigPath = path.join(process.cwd(), 'data/staffReviewConfig.json');
    let reviewerPing = '';
    if (fs.existsSync(reviewConfigPath)) {
      const reviewConfig = JSON.parse(fs.readFileSync(reviewConfigPath, 'utf8'));
      const roleId = reviewConfig[interaction.guild.id];
      if (roleId) reviewerPing = `<@&${roleId}> A new staff application has been submitted, Consider reviewing it? <:jett_love:1377994902410887309>`;
    }

    const embed = new EmbedBuilder()
      .setTitle('📥 New Staff Application')
      .setDescription(`From <@${interaction.user.id}>`)
      .addFields(
        { name: '1. Tell us a bit about yourself', value: answers[0] },
        { name: '2. How long have you been here?', value: answers[1] },
        { name: '3. Why do you want to become a staff member?', value: answers[2] },
        { name: '4. Do you have mod/management experience?', value: answers[3] },
        { name: '5. How often are you available?', value: answers[4] },
        { name: 'User ID (**click to reveal**)', value: `||${interaction.user.id}||`, inline: true }
      )
      .setFooter({ text: '(© Friston Systems • 2025)', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    await targetChannel.send({
      content: reviewerPing,
      embeds: [embed]
    });

    await interaction.reply({
      content: 'Your application was submitted successfully!',
      flags: 64
    });

  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'An unexpected error occurred. Please try again later.',
      flags: 64
    });
  }
};
