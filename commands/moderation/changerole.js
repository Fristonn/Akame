const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  PermissionsBitField,
  ChannelType,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('change-role')
    .setDescription('Ultimate role permission editor')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('The role to modify')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Runtime double-check for safety
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute',
        flags: 64
      });
    }

    const role = interaction.options.getRole('role');

    // Filter usable channel types (no categories)
    const allowedChannelTypes = [
      ChannelType.GuildText,
      ChannelType.GuildVoice,
      ChannelType.GuildStageVoice,
      ChannelType.GuildForum,
      ChannelType.PublicThread,
      ChannelType.PrivateThread,
      ChannelType.AnnouncementThread
    ];

    const channelOptions = interaction.guild.channels.cache
      .filter(ch => allowedChannelTypes.includes(ch.type))
      .map(ch => {
        const typeName = Object.keys(ChannelType).find(key => ChannelType[key] === ch.type)?.replace('Guild', '') || 'Channel';
        return {
          label: `${ch.name} • ${typeName}`,
          value: ch.id
        };
      })
      .slice(0, 25); // Max 25 options

    const channelMenu = new StringSelectMenuBuilder()
      .setCustomId('select_channels')
      .setPlaceholder('Select channels to apply permissions')
      .setMinValues(1)
      .setMaxValues(channelOptions.length)
      .addOptions(channelOptions);

    const actionMenu = new StringSelectMenuBuilder()
      .setCustomId('select_action')
      .setPlaceholder('Choose an action')
      .addOptions([
        { label: 'Add basic permissions (View/Send)', value: 'add' },
        { label: 'Remove basic permissions', value: 'remove' },
        { label: 'Set custom permissions', value: 'custom' }
      ]);

    const permissionMenu = new StringSelectMenuBuilder()
      .setCustomId('select_permissions')
      .setPlaceholder('Select custom permissions (for custom only)')
      .setMinValues(1)
      .setMaxValues(10)
      .addOptions(
        Object.entries(PermissionsBitField.Flags)
          .slice(0, 25)
          .map(([perm]) => ({
            label: perm.replace(/([A-Z])/g, ' $1').trim(),
            value: perm
          }))
      );

    const stateMenu = new StringSelectMenuBuilder()
      .setCustomId('select_state')
      .setPlaceholder('Choose Allow or Deny')
      .addOptions([
        { label: 'Allow', value: 'allow' },
        { label: 'Deny', value: 'deny' }
      ]);

    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm')
      .setLabel('Apply Permissions')
      .setStyle(ButtonStyle.Success);

    const rows = [
      new ActionRowBuilder().addComponents(channelMenu),
      new ActionRowBuilder().addComponents(actionMenu),
      new ActionRowBuilder().addComponents(permissionMenu),
      new ActionRowBuilder().addComponents(stateMenu),
      new ActionRowBuilder().addComponents(confirmButton)
    ];

    await interaction.reply({
      content: `Configure permissions for role **${role.name}**:`,
      components: rows,
      flags: 64
    });

    const selections = {
      channels: [],
      action: '',
      permissions: [],
      state: ''
    };

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 120_000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({
          content: 'This menu is only for the user who ran the command.',
          flags: 64
        });
      }

      switch (i.customId) {
        case 'select_channels':
          selections.channels = i.values;
          break;
        case 'select_action':
          selections.action = i.values[0];
          break;
        case 'select_permissions':
          selections.permissions = i.values;
          break;
        case 'select_state':
          selections.state = i.values[0];
          break;
      }

      await i.deferUpdate();
    });

    interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 120_000
    }).on('collect', async i => {
      if (i.customId === 'confirm' && i.user.id === interaction.user.id) {
        await i.deferUpdate();

        if (
          !selections.channels.length ||
          !selections.action ||
          (selections.action === 'custom' && (!selections.permissions.length || !selections.state))
        ) {
          return interaction.followUp({
            content: 'Please make sure you selected all required options before applying.',
            flags: 64
          });
        }

        const permissionChanges = {};

        if (selections.action === 'add') {
          permissionChanges.ViewChannel = true;
          permissionChanges.SendMessages = true;
        } else if (selections.action === 'remove') {
          permissionChanges.ViewChannel = false;
          permissionChanges.SendMessages = false;
        } else if (selections.action === 'custom') {
          for (const perm of selections.permissions) {
            permissionChanges[perm] = selections.state === 'allow';
          }
        }

        const updated = [];

        for (const channelId of selections.channels) {
          const channel = interaction.guild.channels.cache.get(channelId);
          if (channel && typeof channel.permissionOverwrites?.edit === 'function') {
            await channel.permissionOverwrites.edit(role, permissionChanges).catch(() => null);
            updated.push(channel.name);
          }
        }

        if (updated.length === 0) {
          return interaction.followUp({
            content: "Couldn't update permissions on the selected channels.",
            flags: 64
          });
        }

        await interaction.editReply({
          content:
            `Permissions updated for ${role.name} in ${updated.map(n => `#${n}`).join(', ')}:\n` +
            Object.entries(permissionChanges).map(([perm, v]) => `• \`${perm}\` → \`${v ? 'ALLOW' : 'DENY'}\``).join('\n'),
          components: []
        });
      }
    });
  }
};
