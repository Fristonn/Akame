const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('github')
    .setDescription('Get info about a GitHub repository or user')
    .addSubcommand(sub =>
      sub.setName('repo')
        .setDescription('Get info about a GitHub repository')
        .addStringOption(option =>
          option.setName('repo')
            .setDescription('Format: user/repo')
            .setRequired(true)))
    .addSubcommand(sub =>
      sub.setName('user')
        .setDescription('Get info about a GitHub user')
        .addStringOption(option =>
          option.setName('username')
            .setDescription('GitHub username')
            .setRequired(true))),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    if (sub === 'repo') {
      const repo = interaction.options.getString('repo');
      const url = `https://api.github.com/repos/${repo}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Repo not found');
        const data = await res.json();

        const embed = new EmbedBuilder()
          .setTitle(data.full_name)
          .setURL(data.html_url)
          .setDescription(data.description || 'No description.')
          .addFields(
            { name: '⭐ Stars', value: `${data.stargazers_count}`, inline: true },
            { name: '🍴 Forks', value: `${data.forks_count}`, inline: true },
            { name: '🛠️ Language', value: data.language || 'N/A', inline: true },
            { name: '📅 Updated', value: `<t:${Math.floor(new Date(data.updated_at).getTime() / 1000)}:R>`, inline: false }
          )
          .setThumbnail(data.owner.avatar_url)
          .setFooter({ text: '(© Friston Systems • 2025)' })
          .setTimestamp()
          .setColor('#bbd8ff');

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('🔗 Visit on GitHub')
            .setStyle(ButtonStyle.Link)
            .setURL(data.html_url)
        );

        await interaction.reply({ embeds: [embed], components: [button] });

      } catch {
        await interaction.reply({ content: `Could not fetch repo \`${repo}\`.`, flags: 64 });
      }

    } else if (sub === 'user') {
      const username = interaction.options.getString('username');
      const url = `https://api.github.com/users/${username}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('User not found');
        const data = await res.json();

        const embed = new EmbedBuilder()
          .setTitle(`${data.login}'s GitHub`)
          .setURL(data.html_url)
          .setThumbnail(data.avatar_url)
          .setDescription(data.bio || 'No bio.')
          .addFields(
            { name: '👥 Followers', value: `${data.followers}`, inline: true },
            { name: '🔁 Following', value: `${data.following}`, inline: true },
            { name: '📦 Repos', value: `${data.public_repos}`, inline: true },
            { name: '🏢 Company', value: data.company || 'N/A', inline: true },
            { name: '📍 Location', value: data.location || 'Unknown', inline: true },
            { name: '🔗 Blog', value: data.blog || 'None', inline: false }
          )
          .setFooter({ text: '(© Friston Systems • 2025)' })
          .setTimestamp()
          .setColor('#bbd8ff');

        const button = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('🔗 Visit on GitHub')
            .setStyle(ButtonStyle.Link)
            .setURL(data.html_url)
        );

        await interaction.reply({ embeds: [embed], components: [button] });

      } catch {
        await interaction.reply({ content: `Could not find user \`${username}\`.`, flags: 64 });
      }
    }
  }
};
