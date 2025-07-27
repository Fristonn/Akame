const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const allActions = [
  "kiss", "hug", "cuddle", "lick", "nom", "pat", "poke", "slap", "stare",
  "highfive", "bite", "greet", "punch", "handholding", "tickle",
  "hold", "wave", "boop", "snuggle", "bully",
  // Emote-based fallbacks
  "blush", "cry", "dance", "lewd", "pout", "shrug", "sleepy", "smile",
  "smug", "thumbsup", "wag", "thinking", "triggered", "teehee", "deredere",
  "thonking", "scoff", "happy", "thumbs", "grin"
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('actions')
    .setDescription('Displays all available action commands'),

  async execute(interaction) {
    const mainActions = allActions.slice(0, 21);
    const fallbackActions = allActions.slice(21);

    const embed = new EmbedBuilder()
      .setTitle('Here are all Available Actions')
      .setColor('#bbd8ff')
      .addFields(
        { name: 'Main Actions', value: mainActions.map(a => `\`${a}\``).join(', '), inline: false },
        { name: 'Emote-based Fallbacks', value: fallbackActions.map(a => `\`${a}\``).join(', '), inline: false }
      )
      .setFooter({ 
        text: '(© Friston Systems • 2025)', 
        iconURL: interaction.client.user.displayAvatarURL() 
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: 0 });
  }
};
