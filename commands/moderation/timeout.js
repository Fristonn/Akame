const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('timeout')
    .setDescription('Timeout a member (e.g. 10m, 2h, 1d, or combined like 1d2h30m)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to timeout')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('duration')
        .setDescription('Duration (e.g. 10m, 2h, 1d, 1d2h30m) — Max: 7d')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const input = interaction.options.getString('duration').toLowerCase();
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({ content: 'Member not found in this server.', flags: 64 });
    }

    if (!member.moderatable || member.id === interaction.user.id) {
      return interaction.reply({ content: 'You can’t timeout this user.', flags: 64 });
    }

    // Match all time parts like 2d, 3h, 30m
    const regex = /(\d+)([dhm])/g;
    let match;
    let totalMs = 0;
    let readableParts = [];

    while ((match = regex.exec(input)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 'd':
          totalMs += value * 24 * 60 * 60 * 1000;
          readableParts.push(`${value} day${value === 1 ? '' : 's'}`);
          break;
        case 'h':
          totalMs += value * 60 * 60 * 1000;
          readableParts.push(`${value} hour${value === 1 ? '' : 's'}`);
          break;
        case 'm':
          totalMs += value * 60 * 1000;
          readableParts.push(`${value} minute${value === 1 ? '' : 's'}`);
          break;
      }
    }

    if (totalMs === 0 || readableParts.length === 0) {
      return interaction.reply({
        content: 'Invalid duration format. Use something like `10m`, `2h`, `1d`, or combine: `1d2h30m`',
        flags: 64
      });
    }

    if (totalMs > 604800000) {
      return interaction.reply({ content: 'Timeout duration cannot exceed 7 days.', flags: 64 });
    }

    const readableDuration = readableParts.join(', ');

    try {
      await member.timeout(totalMs, reason);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`The user <@${member.id}> has been **timed out**.`)
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Duration', value: readableDuration, inline: false }
        )
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to timeout the member. Check permissions and role hierarchy.',
        flags: 64
      });
    }
  },
};
