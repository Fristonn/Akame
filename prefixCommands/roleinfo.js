const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'roleinfo',
    description: 'Displays information about a specified role',
    args: true,
    usage: '<role>',
    async execute(message, args) {
        const roleName = args.join(' ');
        const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());

        if (!role) {
            return message.reply('Role not found.');
        }

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

        await message.channel.send({ embeds: [embed] });
    },
};
