const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('untimeout')
    .setDescription('Remove timeout from a member.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member to remove the timeout from')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for removing the timeout')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const target = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!member) {
      return interaction.reply({ content: 'Member not found in this server.', flags: 64 });
    }

    if (!member.moderatable || member.id === interaction.user.id) {
      return interaction.reply({ content: 'You can’t untimeout this user.', flags: 64 });
    }

    try {
      await member.timeout(null, reason); // Remove timeout

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`The timeout for <@${member.id}> has been **removed**.`)
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Reason', value: reason, inline: false }
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
        content: 'Failed to remove timeout. Check permissions and role hierarchy.',
        flags: 64
      });
    }
  },
};
