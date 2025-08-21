const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const DELETE_CHOICES = [
  { name: "Don't delete any", value: 0 },
  { name: 'Previous hour', value: 3600 },
  { name: 'Previous 6 hrs', value: 21600 },
  { name: 'Previous 1 day', value: 86400 },
  { name: 'Previous 3 day', value: 259200 },
  { name: 'Previous 5 day', value: 432000 },
  { name: 'Previous 7 day', value: 604800 },
];

const getDeleteLabel = (seconds) => {
  const found = DELETE_CHOICES.find(c => c.value === seconds);
  return found ? found.name : `${seconds} seconds`;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('softban')
    .setDescription('Softban a user (ban + unban to clear messages)')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('User to softban')
        .setRequired(true)
    )
    .addIntegerOption(option => {
      let opt = option.setName('delete_messages')
        .setDescription('Delete message history?')
        .setRequired(true);
      DELETE_CHOICES.forEach(choice => opt.addChoices(choice));
      return opt;
    })
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for soft ban')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Permission check: must have BanMembers permission
    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute',
        flags: 64
      });
    }

    const user = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteSeconds = interaction.options.getInteger('delete_messages');

    if (user.id === interaction.guild.ownerId || user.id === interaction.client.user.id) {
      return interaction.reply({
        content: 'You cannot softban this user.',
        flags: 64
      });
    }

    try {
      await interaction.guild.members.ban(user.id, {
        deleteMessageSeconds: deleteSeconds,
        reason: `Softbanned by ${interaction.user.tag} - ${reason}`
      });

      await interaction.guild.members.unban(user.id, 'Softban (unbanned immediately)');

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`The user <@${user.id}> was **soft banned**.`)
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Deleted Messages', value: getDeleteLabel(deleteSeconds), inline: false }
        )
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

    } catch (err) {
      const failEmbed = new EmbedBuilder()
        .setColor('#f2a365')
        .setTitle('Failed to soft ban user')
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
