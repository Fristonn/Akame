const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'afk',
    description: 'Set your AFK status',
    async execute(message, args) {
        const reason = args.join(' ') || 'No reason provided';
        const afkInfo = {
            reason,
            timestamp: Date.now(),
        };

        // Store AFK info in the client's afk map
        message.client.afk.set(message.author.id, afkInfo);

        const embed = new EmbedBuilder()
            .setColor('#bbd8ff')
            .setTitle('AFK Status Set')
            .setDescription(`You are now AFK.\n**Reason:** ${reason}`)
            .setTimestamp();

        // Send the embed reply and keep reference to the message
        const replyMessage = await message.reply({ embeds: [embed] });

        // Delete the reply after 15 seconds
        setTimeout(() => {
            replyMessage.delete().catch(() => {});
        }, 15000);
    },
};
