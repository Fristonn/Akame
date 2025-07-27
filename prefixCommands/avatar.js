const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'av',
    description: 'Displays the avatar of a specified user',
    args: false,
    usage: '<user>',
    async execute(message, args) {
        let user;
        if (args.length) {
            user = message.mentions.users.first() || message.client.users.cache.get(args[0]);
            if (!user) {
                return message.reply('User not found.');
            }
        } else {
            user = message.author;
        }
        const avatarURL = user.displayAvatarURL({ dynamic: true, size: 1024 });

        const embed = new EmbedBuilder()
            .setColor('#bbd8ff') // Light blue color
            .setTitle(`${user.username}'s Avatar`)
            .setImage(avatarURL)
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};

