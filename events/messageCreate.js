const config = require('../config.js');
const handlePrefixCommand = require('../handlePrefixCommand');
const actionHandler = require('../prefixCommands/actions/action');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase().trim();
    const prefixLower = config.prefix.toLowerCase();

    // --- AFK removal ---
    const afkData = client.afk.get(message.author.id);
    if (afkData) {
      client.afk.delete(message.author.id);
      const reply = await message.channel.send(`${message.author} you are no longer AFK.`);
      setTimeout(() => reply.delete().catch(() => {}), 15000);
    }

    // --- Only the prefix (e.g., "akame") ---
    if (content === prefixLower) {
      const isOwner = message.author.id === process.env.OWNER_ID;

      const responses = isOwner
        ? [
            "Did you say my name? <:jett_love:1377994902410887309>",
            "You called me?",
            "Yes? I'm here.",
            "That’s cute. Try again.",
            "<:yes:1385894588665040967> That's your one free summon, use it wisely",
            "What's up?",
            "Do I look like your Google?",
            "Did you actually need me or just like my name?",
            "Speak, I'm listening."
          ]
        : [
            "Umm... you forgot the *actual* command, silly! <:Baka:1377996881870848082>",
            "Commands, darling. You know, those things that actually do stuff?",
            "You rang? For what exactly?",
            "Calling me without a reason? Such a spoiled little thing.",
            "Did you just call me for attention again?",
            "I expected so much more from you. Mildly disappointed.",
            "That’s not how this works, you know?",
            "Darling, if you wanted my attention, you could’ve just asked properly.",
            "Mmm, quiet again? I do love a good obedient boy",
          ];

      const key = isOwner ? 'lastNameResponseIndex' : 'lastDummyResponseIndex';
      if (client[key] === undefined) client[key] = -1;

      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * responses.length);
      } while (randomIndex === client[key]);

      client[key] = randomIndex;

      return message.channel.send(responses[randomIndex]);
    }

    // --- Ignore messages not starting with prefix ---
    if (!content.startsWith(prefixLower + ' ')) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    // --- Supported action commands ---
    const allActions = [
      "kiss", "hug", "cuddle", "lick", "nom", "pat", "poke", "slap", "stare",
      "highfive", "bite", "greet", "punch", "handholding", "tickle",
      "hold", "wave", "boop", "snuggle", "bully",
      "blush", "cry", "dance", "lewd", "pout", "shrug", "sleepy", "smile",
      "smug", "thumbsup", "wag", "thinking", "triggered", "teehee", "deredere",
      "thonking", "scoff", "happy", "thumbs", "grin"
    ];

    if (allActions.includes(command)) {
      return actionHandler.execute(message, [command, ...args]);
    }

    // --- All other prefix commands ---
    await handlePrefixCommand(message, client);
  }
};
