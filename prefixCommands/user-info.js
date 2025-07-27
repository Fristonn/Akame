const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'user',
    description: 'Displays information about a user',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const member = message.guild.members.cache.get(target.id);

        const embed = new EmbedBuilder()
            .setColor('#bbd8ff')
            .setTitle(`User Info for ${target.username}`)
            .setThumbnail(target.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Username', value: target.username, inline: true },
                { name: 'Discriminator', value: `#${target.discriminator}`, inline: true },
                { name: 'ID', value: target.id, inline: true },
                { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
                { name: 'Account Created', value: target.createdAt.toDateString(), inline: true },
            );

        message.channel.send({ embeds: [embed] });
    },
};
