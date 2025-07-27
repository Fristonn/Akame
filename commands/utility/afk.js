const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption(option => 
            option.setName('reason')
                .setDescription('Reason for being AFK')
                .setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const afkInfo = {
            reason,
            timestamp: Date.now(),
        };

        interaction.client.afk.set(interaction.user.id, afkInfo);

        const embed = new EmbedBuilder()
            .setColor('#bbd8ff')
            .setTitle('AFK Status Set')
            .setDescription(`You are now AFK.\n**Reason:** ${reason}`)
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};
