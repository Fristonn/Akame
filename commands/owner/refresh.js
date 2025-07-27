const { SlashCommandBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_TOKEN;
const ownerId = process.env.OWNER_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('refresh')
    .setDescription('Reload slash commands without restarting the bot'),

  async execute(interaction) {
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: 'Seriously? You think you’re allowed to do that? Aww..Cute',
        flags: 64,
      });
    }

    const commands = [];
    const commandsPath = path.join(__dirname);
    const commandFiles = fs
      .readdirSync(commandsPath)
      .filter(file => file.endsWith('.js') && file !== path.basename(__filename));

    for (const file of commandFiles) {
      delete require.cache[require.resolve(`./${file}`)];
      const command = require(`./${file}`);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      }
    }

    const rest = new REST({ version: '10' }).setToken(token);

    try {
      // defer reply to avoid interaction timeout & to allow editReply later
      await interaction.deferReply({ flags: 64 });

      await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );

      await interaction.editReply('Slash commands refreshed!');
    } catch (error) {
      console.error(error);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({ content: 'Failed to refresh commands.', flags: 64 });
      } else {
        await interaction.reply({ content: 'Failed to refresh commands.', flags: 64 });
      }
    }
  },
};
