const config = require('./config.js');

async function handlePrefixCommand(message, client) {
  if (!message.guild) {
    return message.reply("You can't use bot commands in DMs.\nJoin Friston's server to use them.");
  }

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.prefixCommands.has(commandName)) {
    return message.reply('That command does not exist!');
  }

  const command = client.prefixCommands.get(commandName);

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
}

module.exports = handlePrefixCommand;
