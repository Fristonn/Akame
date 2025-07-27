const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverstats')
    .setDescription('Get statistics about this server'),

  async execute(interaction) {
    try {
      const { guild } = interaction;
      await guild.members.fetch();

      const members = guild.members.cache;
      const bots = members.filter(m => m.user.bot).size;
      const humans = members.size - bots;

      const emojis = guild.emojis.cache;
      const animatedEmojis = emojis.filter(e => e.animated).size;

      const createdAt = dayjs(guild.createdAt);
      const now = dayjs();

      const verificationLevels = ['None', 'Low', 'Medium', 'High', 'Extreme'];
      const explicitContentFilters = ['Disabled', 'Members Without Roles', 'All Members'];
      const defaultNotifLevels = ['All Messages', 'Only Mentions'];

      const embed = new EmbedBuilder()
        .setTitle(`Server Statistics — ${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setColor('#bbd8ff')
        .addFields(
          { name: 'Owner', value: `${(await guild.fetchOwner()).user.tag}`, inline: true },
          { name: 'Created On', value: createdAt.format('MMM D, YYYY'), inline: true },
          { name: 'Server Age', value: createdAt.from(now, true), inline: true },

          { name: 'Members', value: `Total: ${guild.memberCount}\nHumans: ${humans}\nBots: ${bots}`, inline: true },
          { name: 'Presence', value: `Online: ${members.filter(m => m.presence?.status === 'online').size}\nIdle: ${members.filter(m => m.presence?.status === 'idle').size}\nDND: ${members.filter(m => m.presence?.status === 'dnd').size}\nOffline: ${members.filter(m => !m.presence || m.presence.status === 'offline').size}`, inline: true },

          { name: 'Channels', value: `Text: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size}\nVoice: ${guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size}`, inline: true },
          { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },

          { name: 'Emojis', value: `Total: ${emojis.size}\nAnimated: ${animatedEmojis}`, inline: true },
          { name: 'Boosts', value: `Count: ${guild.premiumSubscriptionCount || 0}\nLevel: ${guild.premiumTier ? `Level ${guild.premiumTier}` : 'None'}`, inline: true },

          { name: 'AFK', value: `Channel: ${guild.afkChannel ? guild.afkChannel.name : 'None'}\nTimeout: ${guild.afkTimeout / 60} minutes`, inline: true },

          { name: 'Verification Level', value: verificationLevels[guild.verificationLevel] || 'Unknown', inline: true },
          { name: 'Explicit Content Filter', value: explicitContentFilters[guild.explicitContentFilter] || 'Unknown', inline: true },
          { name: 'Default Notifications', value: defaultNotifLevels[guild.defaultMessageNotifications] || 'Unknown', inline: true },
        )
        .setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in serverstats command:', error);
      await interaction.reply({ content: 'Sorry, something went wrong retrieving server stats.', flags: 64 });
    }
  },
};
