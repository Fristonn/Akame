const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user by ID.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('User ID to unban')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unbanning')
        .setRequired(false)
    ),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    try {
      await interaction.guild.members.unban(userId, `Unbanned by ${interaction.user.tag} - ${reason}`);
      const user = await interaction.client.users.fetch(userId);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`The user <@${user.id}> was unbanned.`)
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
    } catch (err) {
      const failEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Failed to unban user')
        .setDescription(err.message)
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();
      return interaction.reply({ embeds: [failEmbed], flags: 64 });
    }
  }
};
