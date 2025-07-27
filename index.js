const {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes,
  ActivityType,
  EmbedBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const config = require('./config');
const mongoose = require('mongoose');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

client.commands = new Collection();
client.prefixCommands = new Collection();
client.afk = new Map();
client.restoreCollectors = new Map();

const commands = [];
const commandsPath = path.join(__dirname, 'commands');

function readCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      readCommands(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      try {
        const command = require(fullPath);
        if (!command || !command.data || typeof command.data.name !== 'string') {
          console.warn(`Invalid slash command format in ${fullPath}`);
          continue;
        }
        client.commands.set(command.data.name, command);
        commands.push(command.data.toJSON());
        console.log(`Loaded slash command: ${command.data.name}`);
      } catch (error) {
        console.error(`Failed to load command file ${fullPath}:`, error);
      }
    }
  }
}

readCommands(commandsPath);

// Load prefix commands
const prefixCommandsPath = path.join(__dirname, 'prefixCommands');
if (fs.existsSync(prefixCommandsPath)) {
  const prefixCommandFiles = fs.readdirSync(prefixCommandsPath).filter(file => file.endsWith('.js'));
  for (const file of prefixCommandFiles) {
    const filePath = path.join(prefixCommandsPath, file);
    const prefixCommand = require(filePath);
    client.prefixCommands.set(prefixCommand.name, prefixCommand);
    console.log(`Loaded prefix command: ${prefixCommand.name}`);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
  const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

client.once('ready', async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
    // Chatbot handler
  require('./ai-chat/handler')(client);

  // Dynamic presence rotation
  let index = 0;
  async function setPresence() {
    try {
      const totalServers = client.guilds.cache.size;
      const totalMembers = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

      const statuses = [
        { name: 'Friston', type: ActivityType.Watching },
        { name: 'console.log("Akame")', type: ActivityType.Playing },
        { name: `in ${totalServers} servers`, type: ActivityType.Watching },
        { name: `over ${totalMembers} members`, type: ActivityType.Watching },
        { name: 'After Effects', type: ActivityType.Playing },
        { name: 'Davinci Resolve', type: ActivityType.Playing },
      ];

      await client.user.setPresence({
        activities: [statuses[index]],
        status: 'dnd',
      });

      index = (index + 1) % statuses.length;
    } catch (err) {
      console.error('Error setting presence:', err);
    }
  }

  await setPresence();
  setInterval(setPresence, 10000); // every 10 seconds

  console.log(`Ready! Logged in as ${client.user.tag}`);
});

if (!process.env.MongoDb) {
  console.error('MongoDb environment variable not set!');
  process.exit(1);
}

mongoose.connect(process.env.MongoDb)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => {
    console.error('Failed to connect MongoDB:', err);
    process.exit(1);
  });

client.login(process.env.DISCORD_TOKEN)
  .catch(err => {
    console.error('Failed to login:', err);
    process.exit(1);
  });
