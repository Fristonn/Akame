const { PermissionsBitField, ChannelType } = require('discord.js');

const CATEGORY_NAME = 'Server Stats';
const MEMBER_VOICE_NAME = (count) => `Total Members: ${count}`;
const BOOST_VOICE_NAME = (count) => `Total Boosts: ${count}`;
const VANITY_VOICE_NAME = (code) => `discord.gg/${code}`;

const updateInterval = 30 * 1000; // 30 seconds

const guildIntervals = new Map();

/**
 * Setup server stat counters with optional vanity code
 * @param {Guild} guild
 * @param {string} [vanityCode] optional vanity code like 'earthcore'
 */
async function setupCountersForGuild(guild, vanityCode) {
  // Clear previous interval
  if (guildIntervals.has(guild.id)) {
    clearInterval(guildIntervals.get(guild.id));
  }

  await guild.members.fetch();

  let category = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory && c.name === CATEGORY_NAME
  );

  if (!category) {
    category = await guild.channels.create({
      name: CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      position: 0,
    });
  } else {
    await category.setPosition(0);
  }

  // Member voice channel
  let memberVoice = guild.channels.cache.find(
    c => c.parentId === category.id && c.name.startsWith('Total Members')
  );

  if (!memberVoice) {
    memberVoice = await guild.channels.create({
      name: MEMBER_VOICE_NAME(guild.members.cache.filter(m => !m.user.bot).size),
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.Connect],
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });
  }

  // Boost voice channel
  let boostVoice = guild.channels.cache.find(
    c => c.parentId === category.id && c.name.startsWith('Total Boosts')
  );

  if (!boostVoice) {
    boostVoice = await guild.channels.create({
      name: BOOST_VOICE_NAME(guild.premiumSubscriptionCount || 0),
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionsBitField.Flags.Connect],
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });
  }

  // Vanity voice channel (optional)
  let vanityVoice = null;
  if (vanityCode) {
    vanityVoice = guild.channels.cache.find(
      c => c.parentId === category.id && c.name === VANITY_VOICE_NAME(vanityCode)
    );

    if (!vanityVoice) {
      vanityVoice = await guild.channels.create({
        name: VANITY_VOICE_NAME(vanityCode),
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionsBitField.Flags.Connect],
            allow: [PermissionsBitField.Flags.ViewChannel],
          },
        ],
      });
    }
  }

  const updateStats = () => {
    const memberCount = guild.members.cache.filter(m => !m.user.bot).size;
    const boostCount = guild.premiumSubscriptionCount || 0;

    memberVoice.setName(MEMBER_VOICE_NAME(memberCount)).catch(console.error);
    boostVoice.setName(BOOST_VOICE_NAME(boostCount)).catch(console.error);

    // Vanity voice channel name doesn't need update
  };

  updateStats();

  const interval = setInterval(updateStats, updateInterval);
  guildIntervals.set(guild.id, interval);

  return { category, memberVoice, boostVoice, vanityVoice };
}

module.exports = { setupCountersForGuild };
