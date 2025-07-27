const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config(); // Optional: For storing OWNER_ID in .env

const OWNER_ID = process.env.OWNER_ID || 'your_discord_user_id_here'; // Fallback if .env not used

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('Evaluate JavaScript code (Owner only)')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('JavaScript code to evaluate')
        .setRequired(true)
    ),

  async execute(interaction) {
    // Check if the user is the bot owner
    if (interaction.user.id !== OWNER_ID) {
      return interaction.reply({
        content: 'Seriously? You think you’re allowed to do that? Aww..Cute',
        flags: 64,
      });
    }

    const code = interaction.options.getString('code');

    try {
      let evaled = eval(code);
      if (typeof evaled !== 'string') {
        evaled = require('util').inspect(evaled);
      }

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Eval Result')
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\`` },
          { name: 'Output', value: `\`\`\`js\n${evaled}\n\`\`\`` },
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], flags: 64 });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Eval Error')
        .setDescription(`\`\`\`js\n${err.toString()}\n\`\`\``)
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], flags: 64 });
    }
  },
};
