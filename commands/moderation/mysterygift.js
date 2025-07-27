const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const activeBoxes = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mysterybox')
    .setDescription('Drop a mysterious gift for your server.')
    .addStringOption(option =>
      option.setName('trigger')
        .setDescription('The word or mention users must type to claim the gift')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('link')
        .setDescription('The gift download/view link')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('title')
        .setDescription('The title/name of the gift (shown if no one claims it)')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('timer')
        .setDescription('Claim time limit in seconds (default 30)')
        .setRequired(false)),

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    if (interaction.user.id !== ownerId) {
      return interaction.reply({ content: 'Only the bot owner can use this command.', flags: 64 });
    }

    const channel = interaction.channel;
    if (activeBoxes.has(channel.id)) {
      return interaction.reply({ content: 'A mystery box is already active in this channel.', flags: 64 });
    }

    
    await interaction.reply({ content: 'Mystery box has been dropped anonymously.', flags: 64 });

    activeBoxes.set(channel.id, true);

    let triggerWord = interaction.options.getString('trigger');
    const giftLink = interaction.options.getString('link');
    const giftTitle = interaction.options.getString('title');
    const timer = interaction.options.getInteger('timer') ?? 30;

    let triggerDisplay = triggerWord;

    if (triggerWord.match(/^<@&\d+>$/)) {
      const roleId = triggerWord.match(/\d+/)[0];
      const role = channel.guild.roles.cache.get(roleId);
      if (role) {
        triggerDisplay = `<@&${role.id}>`;
        triggerWord = role.name.toLowerCase();
      }
    } else if (triggerWord.match(/^<@!?(\d+)>$/)) {
      const userId = triggerWord.match(/\d+/)[0];
      const member = channel.guild.members.cache.get(userId);
      if (member) {
        triggerDisplay = `<@${member.id}>`;
        triggerWord = member.user.username.toLowerCase();
      }
    }

    const getFooter = (client) => ({
      text: '(© Friston Systems • 2025)',
      iconURL: client.user.displayAvatarURL()
    });

    let timeLeft = timer;
    const originalTimer = timer;

    const dropEmbed = new EmbedBuilder()
      .setTitle('🎁 A mysterious gift has appeared!')
      .setDescription(`An anonymous gift has arrived...\n\nThe first one to type **${triggerDisplay}** will receive it.\n\nTime left: **${timeLeft} seconds**`)
      .setColor('#bbd8ff')
      .setFooter(getFooter(interaction.client))
      .setTimestamp();

  
    const replyMessage = await channel.send({ embeds: [dropEmbed] });

    const updateInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) return;
      dropEmbed.setDescription(`An anonymous gift has arrived...\n\nThe first one to type **${triggerDisplay}** will receive it.\n\nTime left: **${timeLeft} seconds**`);
      replyMessage.edit({ embeds: [dropEmbed] }).catch(() => {});
    }, 1000);

    const filter = msg => {
      if (msg.author.bot || msg.channel.id !== channel.id) return false;
      return msg.content.toLowerCase() === triggerWord;
    };

    const collector = channel.createMessageCollector({ filter, time: timer * 1000 });

    collector.on('collect', async (msg) => {
      collector.stop();
      clearInterval(updateInterval);
      activeBoxes.delete(channel.id);

      const secondsTaken = originalTimer - timeLeft;

      const claimedEmbed = new EmbedBuilder()
        .setTitle('🎁 Mystery box claimed!')
        .setDescription(`Mystery box was claimed by <@${msg.author.id}> in **${secondsTaken} seconds** after it dropped!\n\nTrigger word: **${triggerDisplay}**\nGift: **${giftTitle}**`)
        .setColor('#bbd8ff')
        .setFooter(getFooter(interaction.client))
        .setTimestamp();

      await replyMessage.edit({ embeds: [claimedEmbed] }).catch(() => {});

      const rewardEmbed = new EmbedBuilder()
        .setTitle('🎁 You claimed the mystery box!')
        .setColor('#bbd8ff')
        .setDescription(`Here is your anonymous gift:\n\n**${giftTitle}**`)
        .addFields(
          { name: 'Gift From', value: `<@${ownerId}>`, inline: true },
          { name: 'Claimed By', value: `<@${msg.author.id}>`, inline: true },
          { name: 'Gift Link', value: `<${giftLink}>` } // disables preview
        )
        .setFooter(getFooter(interaction.client))
        .setTimestamp();

      try {
        await msg.author.send({ embeds: [rewardEmbed] });
        await channel.send({ content: `<@${msg.author.id}> has claimed the gift! Check your DMs.` });
      } catch (err) {
        await channel.send(`Could not DM <@${msg.author.id}>. Make sure your DMs are open.`);
      }
    });

    collector.on('end', async (collected) => {
      clearInterval(updateInterval);
      activeBoxes.delete(channel.id);

      if (collected.size === 0) {
        const expiredEmbed = new EmbedBuilder()
          .setTitle('🎁 Mystery box expired')
          .setColor('#f5b7b1')
          .setDescription(`Time's up! Nobody claimed the mystery box.\n\nGift: **${giftTitle}**`)
          .setFooter(getFooter(interaction.client))
          .setTimestamp();

        await replyMessage.edit({ embeds: [expiredEmbed] }).catch(() => {});
        await channel.send(`No one claimed the gift **${giftTitle}**. Better luck next time!`);
      }
    });
  }
};
