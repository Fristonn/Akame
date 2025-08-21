const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

const DELETE_CHOICES = [
  { name: "Don't delete any", value: 0 },
  { name: 'Previous hour', value: 3600 },
  { name: 'Previous 6 hrs', value: 21600 },
  { name: 'Previous 1 day', value: 86400 },
  { name: 'Previous 3 days', value: 259200 },
  { name: 'Previous 5 days', value: 432000 },
  { name: 'Previous 7 days', value: 604800 },
];

const getDeleteLabel = (seconds) => {
  const found = DELETE_CHOICES.find(c => c.value === seconds);
  return found ? found.name : `${seconds} seconds`;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Deletes messages from the channel, optionally from a specific member.')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('The number of messages to check (1–500)')
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName('member')
        .setDescription('The member whose messages you want to delete')
        .setRequired(false)
    )
    .addIntegerOption(option => {
      let opt = option.setName('delete_messages')
        .setDescription('Delete messages from the last X seconds (only works with member filter)')
        .setRequired(false);
      DELETE_CHOICES.forEach(choice => opt.addChoices(choice));
      return opt;
    })
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for purging messages')
        .setRequired(false)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const member = interaction.options.getUser('member');
    const deleteSeconds = member ? interaction.options.getInteger('delete_messages') ?? 0 : 0;
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteLabel = member ? getDeleteLabel(deleteSeconds) : 'All messages in range';

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ 
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute', 
        flags: 64 
      });
    }

    if (amount < 1 || amount > 500) {
      return interaction.reply({ content: 'Please enter a number between 1 and 500.', flags: 64 });
    }

    // Send animated loading emoji message
    const loadingMsg = await interaction.reply({ content: '<a:loading:1394342548180304022> Deleting messages...', flags: 64, fetchReply: true });

    try {
      let totalDeleted = 0;
      let lastId;
      const now = Date.now();

      while (totalDeleted < amount) {
        const fetchLimit = Math.min(amount - totalDeleted, 100); // fetch max 100 at a time
        const options = { limit: fetchLimit };
        if (lastId) options.before = lastId;

        const messages = await interaction.channel.messages.fetch(options);
        if (!messages.size) break;

        // Filter messages
        const filtered = messages.filter(msg => {
          if (member && msg.author.id !== member.id) return false;
          if (member && deleteSeconds > 0) return (now - msg.createdTimestamp) / 1000 <= deleteSeconds;
          return true;
        });

        if (!filtered.size) break;

        const deleted = await interaction.channel.bulkDelete(filtered, true);
        totalDeleted += deleted.size;
        lastId = messages.last().id;
      }

      const embed = new EmbedBuilder()
        .setTitle('Messages Purged')
        .setColor('#bbd8ff')
        .setDescription(`Deleted ${totalDeleted} message(s)${member ? ` from <@${member.id}>` : ''}.`)
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Time Range', value: deleteLabel, inline: false }
        )
        .setFooter({ text: '(© Friston Systems • 2025)', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      await interaction.editReply({ content: null, embeds: [embed] });

    } catch (error) {
      console.error('Purge Error:', error);
      await interaction.editReply({ content: 'There was an error trying to delete messages. Messages older than 14 days cannot be deleted.' });
    }
  }
};
