const { EmbedBuilder } = require('discord.js');
require('dotenv').config();

const OWNER_ID = process.env.OWNER_ID || 'your_discord_user_id_here'; // Replace with your actual Discord ID

module.exports = {
  name: 'eval',
  description: 'Evaluate JavaScript code (Owner only)',
  async execute(message, args) {
    if (message.author.id !== OWNER_ID) {
      return message.reply('Only the owner can use this command!');
    }

    const code = args.join(' ');
    if (!code) {
      return message.reply('Please provide some code to evaluate.');
    }

    try {
      let evaled = eval(code);
      if (evaled instanceof Promise) evaled = await evaled;

      if (typeof evaled !== 'string') {
        evaled = require('util').inspect(evaled, { depth: 0 });
      }

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Eval Result')
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\`` },
          { name: 'Output', value: `\`\`\`js\n${evaled}\n\`\`\`` },
        )
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#95d9f6')
        .setTitle('Eval Error')
        .setDescription(`\`\`\`js\n${err.toString()}\n\`\`\``)
        .setTimestamp();

      await message.channel.send({ embeds: [errorEmbed] });
    }
  },
};
