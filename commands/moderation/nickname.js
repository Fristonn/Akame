const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change the nickname of a user in the server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator) // admin-only
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to change nickname')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('New nickname')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('target');
    const newNick = interaction.options.getString('nickname');

    if (!member) {
      return interaction.reply({ content: 'User not found in this server.', flags: 64 });
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageNicknames)) {
      return interaction.reply({ content: 'I do not have permission to manage nicknames.', flags: 64 });
    }
    if (!member.manageable) {
      return interaction.reply({ content: 'I cannot change the nickname of this user.', flags: 64 });
    }

    try {
      await member.setNickname(newNick, `Nickname changed by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`Nickname for <@${member.id}> was changed successfully.`)
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'New Nickname', value: newNick, inline: false }
        )
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      const failEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Failed to change nickname')
        .setDescription(error.message)
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [failEmbed], flags: 64 });
    }
  }
};
