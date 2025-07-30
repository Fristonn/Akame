const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('yt-info')
    .setDescription('Get detailed info about a YouTube channel.')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('Channel handle, URL, username, ID, or video link')
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options.getString('input');
    await interaction.deferReply();

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return interaction.editReply('YouTube API key is not set.');

    const channelId = await resolveChannelId(input, apiKey);
    if (!channelId) return interaction.editReply('No valid YouTube channel found for the given input.');

    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        return interaction.editReply('No data found for this YouTube channel.');
      }

      const channel = data.items[0];
      const snippet = channel.snippet;
      const stats = channel.statistics;
      const branding = channel.brandingSettings?.channel;
      const bannerUrl = channel.brandingSettings?.image?.bannerExternalUrl || null;
      const country = branding?.country || 'Unknown';

      const embed = new EmbedBuilder()
        .setTitle(snippet.title)
        .setURL(`https://www.youtube.com/channel/${channelId}`)
        .setThumbnail(snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url)
        .setColor('#bbd8ff')
        .setDescription(snippet.description?.length > 400 ? snippet.description.slice(0, 400) + '...' : snippet.description || 'No description available.')
        .addFields(
          { name: 'Subscribers', value: stats.hiddenSubscriberCount ? 'Hidden' : Number(stats.subscriberCount).toLocaleString(), inline: true },
          { name: 'Total Videos', value: Number(stats.videoCount).toLocaleString(), inline: true },
          { name: 'Total Views', value: Number(stats.viewCount).toLocaleString(), inline: true },
          { name: 'Country', value: getCountryName(country), inline: true },
          {
            name: 'On YouTube Since',
            value: new Date(snippet.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            inline: true
          },
          { name: 'Channel ID', value: channelId, inline: false },
          { name: 'Custom URL', value: snippet.customUrl || 'N/A', inline: true },
          { name: 'Most Used Keywords', value: branding?.keywords?.split(',').slice(0, 5).join(', ') || 'N/A', inline: true },
          { name: 'Banner Image', value: bannerUrl ? `[View Banner](${bannerUrl})` : 'N/A', inline: false }
        )
        .setFooter({
          text: 'Powered by Friston',
          iconURL: interaction.client.user.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return interaction.editReply('Failed to fetch YouTube channel data.');
    }
  },
};

async function resolveChannelId(input, apiKey) {
  input = input.trim();

  if (/^UC[\w-]{22}$/.test(input)) return input;

  if (input.startsWith('@')) {
    return await searchChannelIdByQuery(input, apiKey);
  }

  const videoId = extractVideoId(input);
  if (videoId) {
    const channelId = await getChannelIdFromVideo(videoId, apiKey);
    if (channelId) return channelId;
  }

  try {
    const url = new URL(input);
    const path = url.pathname.split('/').filter(Boolean);

    if (path[0] === 'channel' && path[1]) {
      if (/^UC[\w-]{22}$/.test(path[1])) return path[1];
    } else if (path[0] === 'user') {
      return await getChannelIdByUsername(path[1], apiKey);
    } else if (path[0].startsWith('@')) {
      return await searchChannelIdByQuery(path[0], apiKey);
    }
  } catch {
    // continue
  }

  const byUsername = await getChannelIdByUsername(input, apiKey);
  return byUsername || await searchChannelIdByQuery(input, apiKey);
}

function extractVideoId(input) {
  const patterns = [
    /(?:v=|\/videos\/|\/embed\/|\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const regex of patterns) {
    const match = input.match(regex);
    if (match && match[1]) return match[1];
  }

  return null;
}

async function getChannelIdFromVideo(videoId, apiKey) {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`);
    const data = await res.json();
    return data.items?.[0]?.snippet?.channelId || null;
  } catch {
    return null;
  }
}

async function getChannelIdByUsername(username, apiKey) {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(username)}&key=${apiKey}`);
    const data = await res.json();
    return data.items?.[0]?.id || null;
  } catch {
    return null;
  }
}

async function searchChannelIdByQuery(query, apiKey) {
  try {
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&key=${apiKey}`);
    const data = await res.json();
    return data.items?.[0]?.snippet?.channelId || null;
  } catch {
    return null;
  }
}

function getCountryName(code) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || 'Unknown';
  } catch {
    return 'Unknown';
  }
}
