const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

const OWNER_ID = process.env.OWNER_ID;

const DELETE_CHOICES = [
  { name: "Don't delete any", value: 0 },
  { name: 'Previous hour', value: 3600 },
  { name: 'Previous 6 hrs', value: 21600 },
  { name: 'Previous 1 days', value: 86400 },
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
    .setName('massban')
    .setDescription('Ban multiple users using IDs, usernames, or mentions.')
    .addStringOption(option =>
      option.setName('input')
        .setDescription('Usernames, mentions, or IDs separated by comma or space')
        .setRequired(true)
    )
    .addIntegerOption(option => {
      let opt = option.setName('delete_messages')
        .setDescription('Delete how much message history of the banned users?')
        .setRequired(true);
      DELETE_CHOICES.forEach(choice => opt.addChoices(choice));
      return opt;
    })
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for banning (optional)')
        .setRequired(false)
    ),

  async execute(interaction) {
    // Permission check: only bot owner or guild owner allowed
    if (interaction.user.id !== OWNER_ID && interaction.user.id !== interaction.guild.ownerId) {
      return interaction.reply({
        content: 'Seriously? You think you\'re allowed to do that? Aww..Cute',
        flags: 64
      });
    }

    const input = interaction.options.getString('input');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    const deleteSeconds = interaction.options.getInteger('delete_messages');
    const deleteLabel = getDeleteLabel(deleteSeconds);

    const identifiers = input
      .replace(/<@!?(\d+)>/g, '$1')
      .split(/[\s,]+/)
      .filter(Boolean);

    if (identifiers.length > 25) {
      return interaction.reply({
        content: 'Ehh~ senpai, I can only handle 25 bans at once or Discord might get mad at me… let’s stay safe, okay?',
        flags: 64
      });
    }

    await interaction.deferReply();

    const failed = [];
    const success = [];

    for (const idOrName of identifiers) {
      let user;

      if (/^\d{17,20}$/.test(idOrName)) {
        try {
          user = await interaction.client.users.fetch(idOrName);
        } catch {
          failed.push(`${idOrName} (Invalid ID)`);
          continue;
        }
      }

      if (!user) {
        const match = interaction.guild.members.cache.find(m =>
          m.user.username.toLowerCase() === idOrName.toLowerCase() ||
          m.displayName.toLowerCase() === idOrName.toLowerCase()
        );
        if (match) user = match.user;
      }

      if (user) {
        try {
          const member = await interaction.guild.members.fetch(user.id).catch(() => null);
          if (member) {
            const executorHighest = interaction.member.roles.highest.position;
            const targetHighest = member.roles.highest.position;

            if (executorHighest <= targetHighest) {
              failed.push(`${user.tag} (Role hierarchy prevents ban)`);
              continue;
            }
          }

          await interaction.guild.members.ban(user.id, {
            deleteMessageSeconds: deleteSeconds,
            reason: `Banned by ${interaction.user.tag} - ${reason}`
          });

          success.push(`<@${user.id}> (${user.tag})`);

        } catch (err) {
          failed.push(`${user?.tag || idOrName} - ${err.message}`);
        }
      } else {
        failed.push(`${idOrName} (User not found)`);
      }
    }

    const resultEmbeds = [];

    if (success.length) {
      const successEmbed = new EmbedBuilder()
        .setTitle('Successfully Banned Users')
        .setColor('#bbd8ff')
        .setDescription(success.join('\n').slice(0, 4096))
        .addFields(
          { name: 'Executor', value: `<@${interaction.user.id}>`, inline: false },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Deleted Messages', value: deleteLabel, inline: false }
        )
        .setFooter({ text: '(© Friston Systems • 2025)', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      resultEmbeds.push(successEmbed);
    }

    if (failed.length) {
      const failEmbed = new EmbedBuilder()
        .setTitle('Failed to Ban Some Users')
        .setColor('#bbd8ff')
        .setDescription(failed.join('\n').slice(0, 4096))
        .setFooter({ text: '(© Friston Systems • 2025)', iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp();

      resultEmbeds.push(failEmbed);
    }

    await interaction.followUp({ embeds: resultEmbeds });
  }
};
