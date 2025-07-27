const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping',
    description: 'Check the bot\'s latency',
    async execute(message) {
        try {
            const startTime = Date.now();
            const reply = await message.channel.send('Pinging...');
            const endTime = Date.now();
            const botLatency = endTime - startTime;
            const apiLatency = message.client.ws.ping;

            const embed = new EmbedBuilder()
                .setColor('#bbd8ff')
                .setTitle('Ping')
                .setDescription('Latency information')
                .addFields(
                    { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                    { name: 'Bot Latency', value: `${botLatency}ms`, inline: true }
                )
                .setTimestamp();

            await reply.edit({ content: 'All set', embeds: [embed] });
        } catch (error) {
            console.error('Error checking bot latency:', error);
            message.reply('There was an error trying to check the bot\'s latency!');
        }
    },
};
