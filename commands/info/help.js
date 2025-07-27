const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

const categories = [
  {
    name: 'General',
    value: 'general',
    commands: [
      { name: '/ping', description: 'Check the bot ping latency' },
      { name: '/help', description: 'Show this help menu' },
      { name: '/dev', description: 'Show bot and developer info' },
      { name: '/getlink', description: 'Retrieve the OAuth2 link (Owner only)' },
      { name: '/say', description: 'Make the bot say something' },
      { name: '/leave', description: 'Ask the bot to leave the server (Owner only)' },
    ],
  },
  {
    name: 'Moderation',
    value: 'moderation',
    commands: [
      { name: '/kick', description: 'Kick a member from the server' },
      { name: '/ban', description: 'Ban a member from the server' },
      { name: '/unban', description: 'Unban a member from the server' },
      { name: '/purge', description: 'Clear multiple messages' },
      { name: '/massban', description: 'Mass ban users by ID' },
      { name: '/mute', description: 'Mute a member' },
      { name: '/timeout', description: 'Timeout a member' },
      { name: '/untimeout', description: 'Remove timeout' },
      { name: '/roleadd', description: 'Add a role to a member' },
      { name: '/roleremove', description: 'Remove a role from a member' },
      { name: '/changerole', description: 'Change a user\'s role' },
    ],
  },
  {
    name: 'Utility',
    value: 'utility',
    commands: [
      { name: '/server-info', description: 'Show server info' },
      { name: '/user-info', description: 'Show user info' },
      { name: '/ownerinfo', description: 'Show owner info' },
      { name: '/roleinfo', description: 'Show role info' },
      { name: '/afk', description: 'Set AFK status' },
      { name: '/serverstats', description: 'Display server stats' },
      { name: '/avatar', description: 'View avatar of user' },
      { name: '/firstmsg', description: 'Get first message in a channel' },
      { name: '/github', description: 'Bot\'s GitHub repo or profile' },
    ],
  },
  {
    name: 'Actions & Reactions',
    value: 'actions',
    commands: [
      { name: '/actions', description: 'Send fun actions like kiss, pat, hug, etc.' },
    ],
  },
  {
    name: 'Custom / Fun',
    value: 'custom',
    commands: [
      { name: '/embedplus', description: 'Create advanced embeds' },
      { name: '/reactionrolespro', description: 'Pro reaction role system' },
      { name: '/slowmode', description: 'Set slowmode in channel' },
      { name: '/ghostping', description: 'Ghost ping a user' },
      { name: '/tiktok', description: 'Download TikTok videos' },
      { name: '/youtube', description: 'Download YouTube videos' },
      { name: '/yt-info', description: 'Fetch YouTube video/channel info' },
    ],
  },
  {
    name: 'Developer / Owner',
    value: 'owner',
    commands: [
      { name: '/eval', description: 'Run JS code (Owner only)' },
      { name: '/dm', description: 'Send DM to a user (Owner only)' },
      { name: '/cleardm', description: 'Clear DMs sent by bot (Owner only)' },
      { name: '/refresh', description: 'Refresh commands (Owner only)' },
      { name: '/removelogs', description: 'Remove logs from database' },
      { name: '/setlogs', description: 'Set a log channel' },
      { name: '/plugins', description: 'List custom plugins' },
      { name: '/evaltools', description: 'Toolbox for eval use' },
    ],
  },
  {
    name: 'Staff & Applications',
    value: 'staff',
    commands: [
      { name: '/staff-form', description: 'Staff form system' },
      { name: '/staff-apps', description: 'List staff applications' },
      { name: '/staff-review', description: 'Review staff forms' },
      { name: '/staff-role', description: 'Set staff role' },
      { name: '/unit-form', description: 'Unit form system' },
      { name: '/unit-apps', description: 'List unit applications' },
      { name: '/unit-review', description: 'Review unit apps' },
      { name: '/set-role', description: 'Set unit role' },
    ],
  },
  {
    name: 'Prefix Commands',
    value: 'prefix',
    commands: [
      { name: 'actions', description: 'Send fun actions like kiss, hug, pat, etc.' },
      { name: 'afk', description: 'Set your AFK status' },
      { name: 'avatar', description: 'Get a user\'s avatar' },
      { name: 'ban', description: 'Ban a user from the server' },
      { name: 'cleardm', description: 'Clear DMs sent by the bot' },
      { name: 'dm', description: 'Send a DM to a user (owner only)' },
      { name: 'eval', description: 'Execute code (owner only)' },
      { name: 'help', description: 'Show this help menu' },
      { name: 'info', description: 'Bot or server information' },
      { name: 'kick', description: 'Kick a user from the server' },
      { name: 'mute', description: 'Mute a user' },
      { name: 'ownerinfo', description: 'Information about the owner' },
      { name: 'ping', description: 'Check the bot\'s latency' },
      { name: 'purge', description: 'Delete multiple messages' },
      { name: 'roleadd', description: 'Add a role to a user' },
      { name: 'roleinfo', description: 'Show role information' },
      { name: 'roleremove', description: 'Remove a role from a user' },
      { name: 'server-info', description: 'Get server information' },
      { name: 'slowmode', description: 'Enable channel slowmode' },
      { name: 'steal', description: 'Steal an emoji or sticker' },
      { name: 'timeout', description: 'Timeout a user' },
      { name: 'untimeout', description: 'Remove timeout from a user' },
      { name: 'unban', description: 'Unban a user' },
      { name: 'user-info', description: 'Get information about a user' },
    ],
  },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show the help menu with command categories'),

  async execute(interaction) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help-category')
      .setPlaceholder('Select a category')
      .addOptions(
        categories.map(category => ({
          label: category.name,
          description: `Help for ${category.name} commands`,
          value: category.value,
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: 'Choose a category to get help!',
      components: [row],
      flags: 64, // ephemeral fallback
    });

    const filter = i => i.customId === 'help-category' && i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    collector.on('collect', async i => {
      const category = categories.find(c => c.value === i.values[0]);
      if (!category) return;

      const embed = new EmbedBuilder()
        .setTitle(`📖 Help: ${category.name}`)
        .setDescription(`Here are the commands for the **${category.name}** category:`)
        .setColor('Blurple');

      for (const command of category.commands) {
        embed.addFields({ name: command.name, value: command.description, inline: false });
      }

      await i.update({ embeds: [embed], components: [row] });
    });

    collector.on('end', async () => {
      try {
        const disabledRow = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
        await interaction.editReply({ components: [disabledRow] });
      } catch {
        // Message may have been deleted
      }
    });
  },
};
