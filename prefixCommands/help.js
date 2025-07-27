const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  EmbedBuilder
} = require('discord.js');

const categories = [
  {
    name: 'General',
    value: 'general',
    commands: [
      { name: 'ping', description: 'Check the bot ping latency' },
      { name: 'help', description: 'Show this help menu' },
      { name: 'info', description: 'Shows bot information' },
      { name: 'getlink', description: 'Retrieve the OAuth2 link (Owner only)' },
    ],
  },
  {
    name: 'Moderation',
    value: 'moderation',
    commands: [
      { name: 'kick', description: 'Kick a member from the server' },
      { name: 'ban', description: 'Ban a member from the server' },
      { name: 'unban', description: 'Unban a member from the server' },
      { name: 'purge', description: 'Clear multiple messages at once' },
      { name: 'mute', description: 'Mute a user from the server' },
      { name: 'timeout', description: 'Place a member in timeout' },
      { name: 'untimeout', description: 'Remove timeout from a member' },
      { name: 'roleadd', description: 'Add role to a member' },
      { name: 'roleremove', description: 'Remove role from a member' },
      { name: 'eval', description: 'Execute JavaScript code (Owner only)' },
    ],
  },
  {
    name: 'Utility',
    value: 'utility',
    commands: [
      { name: 'server-info', description: 'Show server information' },
      { name: 'userinfo', description: 'Show user information' },
      { name: 'ownerinfo', description: 'Show server owner information' },
      { name: 'roleinfo', description: 'Show server role information' },
      { name: 'afk', description: 'Set to go afk' },
      { name: 'serverstats', description: 'Show server stats' },
      { name: 'avatar', description: 'Show self or other user avatar' },
      { name: 'firstmsg', description: 'Show the first message of the channel' },
      { name: 'dm', description: 'Send a direct message to a user (Owner only)' },
      { name: 'cleardm', description: 'Deletes bot DMs to a user (Owner only)' },
    ],
  },
  {
    name: 'Custom',
    value: 'custom',
    commands: [
      { name: 'embedplus', description: 'Create advanced embed messages' },
      { name: 'reactionroles', description: 'Setup reaction role on a message' },
      { name: 'reactionroles-pro', description: 'Setup advanced embed reaction roles' },
      { name: 'slowmode', description: 'Set slowmode delay for the current channel' },
    ],
  },
  {
    name: 'Fun',
    value: 'fun',
    commands: [
      { name: 'actions', description: 'Show all action/fun commands like kiss, pat, hug' },
      { name: 'steal', description: 'Steal emoji or sticker' },
    ],
  },
  {
    name: 'Other',
    value: 'other',
    commands: [
      { name: 'Coming Soon', description: 'Other commands coming soon...' },
    ],
  },
];

module.exports = {
  name: 'help',
  description: 'Shows the help menu using dropdown',
  async execute(message) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('prefix-help')
      .setPlaceholder('Select a command category')
      .addOptions(
        categories.map(category => ({
          label: category.name,
          description: `Help for ${category.name} commands`,
          value: category.value,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    const sent = await message.channel.send({
      content: '📘 Choose a category to get help!',
      components: [row],
      flags: 64,
    });

    const filter = i =>
      i.customId === 'prefix-help' && i.user.id === message.author.id;

    const collector = message.channel.createMessageComponentCollector({
      filter,
      time: 120000, // 2 minutes
    });

    collector.on('collect', async i => {
      const category = categories.find(c => c.value === i.values[0]);
      if (!category) return;

      const embed = new EmbedBuilder()
        .setTitle(`Help - ${category.name} Commands`)
        .setColor('Blue')
        .setDescription(
          category.commands
            .map(cmd => `\`${cmd.name}\` - ${cmd.description}`)
            .join('\n')
        );

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await sent.delete();
      } catch (err) {
        // ignore errors if already deleted or no permissions
      }
    });
  }
};
