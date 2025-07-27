const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of messages from the channel')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The number of messages to delete (1–100)')
                .setRequired(true)
        ),

    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');

        // Check permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: 'You don’t have permission to use this command.', flags: 64 });
        }

        // Validate amount
        if (amount < 1 || amount > 100) {
            return interaction.reply({ content: 'Please enter a number between 1 and 100.', flags: 64 });
        }

        // Acknowledge first to avoid issues with deleted replies
        await interaction.reply({ content: `Deleting ${amount} messages...`, flags: 64 });

        try {
            const deletedMessages = await interaction.channel.bulkDelete(amount, true);
            await interaction.editReply({ content: `Successfully deleted ${deletedMessages.size} messages.` });
        } catch (error) {
            console.error('Purge Error:', error);
            await interaction.editReply({ content: 'There was an error trying to delete messages. Messages older than 14 days cannot be deleted.' });
        }
    }
};
