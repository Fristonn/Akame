const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('firstmsg')
        .setDescription('Get the first message of the channel'),
    async execute(interaction) {
        const messages = await interaction.channel.messages.fetch({ after: 1, limit: 1 });
        const firstMessage = messages.first();

        await interaction.reply(`First message in this channel:\n${firstMessage.url}`);
    },
};
