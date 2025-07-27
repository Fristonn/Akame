const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-info')
        .setDescription('Displays information about this server.'),
    async execute(interaction) {
        const guild = interaction.guild;
        const owner = await guild.fetchOwner();
        const embed = new EmbedBuilder()
            .setColor('#bbd8ff')
            .setTitle(`Server Info for ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Server Name', value: guild.name, inline: true },
                { name: 'Server ID', value: guild.id, inline: true },
                { name: 'Owner', value: owner.user.tag, inline: true },
                { name: 'Total Members', value: guild.memberCount.toString(), inline: true },
                { name: 'Creation Date', value: guild.createdAt.toDateString(), inline: true },
                { name: 'Region', value: guild.preferredLocale, inline: true },
                { name: 'Verification Level', value: guild.verificationLevel.toString(), inline: true },
                { name: 'Boost Level', value: guild.premiumTier.toString(), inline: true },
                { name: 'Boosts Count', value: guild.premiumSubscriptionCount.toString(), inline: true },
                { name: 'Number of Roles', value: guild.roles.cache.size.toString(), inline: true },
                { name: 'Number of Channels', value: guild.channels.cache.size.toString(), inline: true },
            );

        await interaction.reply({ embeds: [embed] });
    },
};
