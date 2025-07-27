const { EmbedBuilder } = require("discord.js");
const axios = require("axios");

const actions = {
  kiss: "kiss",
  hug: "hug",
  cuddle: "cuddle",
  lick: "kiss",
  nom: "bite",
  pat: "pat",
  poke: "poke",
  slap: "slap",
  stare: "stare",
  highfive: "highfive",
  bite: "bite",
  greet: "wave",
  punch: "slap",
  handholding: "handhold",
  tickle: "tickle",
  hold: "hug",
  wave: "wave",
  boop: "poke",
  snuggle: "cuddle",
  bully: "slap",

  // Emote-based fallbacks
  blush: "wave",
  cry: "stare",
  dance: "wave",
  lewd: "stare",
  pout: "wave",
  shrug: "stare",
  sleepy: "cuddle",
  smile: "wave",
  smug: "stare",
  thumbsup: "highfive",
  wag: "wave",
  thinking: "stare",
  triggered: "slap",
  teehee: "wave",
  deredere: "hug",
  thonking: "stare",
  scoff: "stare",
  happy: "hug",
  thumbs: "highfive",
  grin: "wave"
};

module.exports = {
  name: "actionHandler",
  async execute(message, args) {
    const action = args[0]?.toLowerCase();
    const user = message.mentions.users.first();

    // If no valid action, list them
    if (!action || !actions[action]) {
      return message.reply(
        `Invalid action.\nAvailable actions:\n\`${Object.keys(actions).join("`, `")}\``
      );
    }

    const endpoint = actions[action];

    try {
      const response = await axios.get(`https://nekos.best/api/v2/${endpoint}`);
      const gif = response.data.results[0].url;

      const embed = new EmbedBuilder()
        .setColor(0xbbd8ff)
        .setDescription(user
          ? `**${message.member.displayName}** ${action}s **${user.username}**`
          : `Uhh **${message.member.displayName}** ${action}s into the void...`)
        .setImage(gif)
        .setFooter({
          text: `Use /actions to see all my actions`,
          iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

      await message.channel.send({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return message.reply(`Couldn't fetch a gif for **${action}**.`);
    }
  },
};
