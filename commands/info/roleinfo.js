const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription('Displays information about a specified role')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to get information about')
                .setRequired(true)),
    async execute(interaction) {
        const role = interaction.options.getRole('role');

        const embed = new EmbedBuilder()
            .setColor(role.hexColor)
            .setTitle(`Role Information: ${role.name}`)
            .addFields(
                { name: 'Role Name', value: role.name, inline: true },
                { name: 'Role ID', value: role.id, inline: true },
                { name: 'Created On', value: role.createdAt.toDateString(), inline: true },
                { name: 'Role Color', value: role.hexColor, inline: true },
                { name: 'Hoisted', value: role.hoist ? 'Yes' : 'No', inline: true },
                { name: 'Mentionable', value: role.mentionable ? 'Yes' : 'No', inline: true },
                { name: 'Position', value: role.position.toString(), inline: true },
                { name: 'Permissions', value: role.permissions.toArray().join(', ') || 'None', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
