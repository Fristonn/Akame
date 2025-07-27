const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roleadd')
    .setDescription('Assign a role to yourself or another member')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to assign')
        .setRequired(true))
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member to assign the role to')),

  async execute(interaction) {
    const role = interaction.options.getRole('role');
    const member = interaction.options.getMember('member') || interaction.member;

    // User permission check
    if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const deniedEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Permission Denied')
        .setDescription('You do not have permission to use this command.')
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [deniedEmbed], flags: 64 });
    }

    // Bot permission check
    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      const botPermsEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Missing Permissions')
        .setDescription('I do not have permission to manage roles.')
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [botPermsEmbed], flags: 64 });
    }

    // Check if bot can manage this role
    const botMember = interaction.guild.members.me;
    if (botMember.roles.highest.position <= role.position) {
      const hierarchyEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Role Too High')
        .setDescription(`I can't add the role **${role.name}** because it's higher than or equal to my highest role.`)
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [hierarchyEmbed], flags: 64 });
    }

    // Check if member already has the role
    if (member.roles.cache.has(role.id)) {
      const alreadyEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`<@${member.id}> already has the role **${role.name}**`)
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.reply({ embeds: [alreadyEmbed], flags: 64 });
    }

    // Attempt to add the role
    try {
      await member.roles.add(role);

      const successEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setAuthor({
          name: `${interaction.member.displayName} (${interaction.user.tag})`,
          iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`The role **${role.name}** was added to <@${member.id}>`)
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Added Role', value: `${role.name}`, inline: false }
        )
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Role Add Error:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Error')
        .setDescription('There was an error assigning the role. It may be due to missing permissions or role hierarchy.')
        .setFooter({
          text: '(© Friston Systems • 2025)',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  },
};
