const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency'),
    async execute(interaction) {
        try {
            const startTime = Date.now();
            await interaction.reply({ content: 'Pinging...' });
const reply = await interaction.fetchReply();
            const endTime = Date.now();
            const botLatency = endTime - startTime;
            const apiLatency = interaction.client.ws.ping;

            const embed = new EmbedBuilder()
                .setColor('#bbd8ff')
                .setTitle('Ping')
                .setDescription('Latency information')
                .addFields(
                    { name: 'API Latency', value: `${apiLatency}ms`, inline: true },
                    { name: 'Bot Latency', value: `${botLatency}ms`, inline: true }
                )
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error checking bot latency:', error);
            await interaction.reply('There was an error trying to check the bot\'s latency!');
        }
    },
};
