const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('Displays detailed information about a selected user.')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('The user to view information for')
                .setRequired(true)
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(user.id);

        const status = member.presence?.status || 'offline';
        const roles = member.roles.cache
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(role => role.toString())
            .slice(0, 10)
            .join(', ') || 'None';

        const embed = new EmbedBuilder()
            .setColor(member.displayHexColor || '#bbd8ff')
            .setAuthor({
                name: `${user.tag}`,
                iconURL: user.displayAvatarURL({ dynamic: true }),
            })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: 'Username', value: user.username, inline: true },
                { name: 'Display Name', value: member.displayName || 'None', inline: true },
                { name: 'User ID', value: user.id, inline: false },
                { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
                { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: true },
                { name: 'Status', value: status.charAt(0).toUpperCase() + status.slice(1), inline: true },
                { name: 'Boosting Since', value: member.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : 'Not boosting', inline: true },
                { name: 'Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Roles', value: roles, inline: false },
                { name: 'Avatar URL', value: `[Click to View](${user.displayAvatarURL({ dynamic: true, size: 512 })})`, inline: false }
            )
            .setFooter({
                text: `Requested by ${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
