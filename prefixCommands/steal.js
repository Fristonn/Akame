const fetch = require('node-fetch');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const OWNER_ID = process.env.OWNER_ID;

module.exports = {
  name: 'steal',
  description: 'Steal a custom emoji or sticker from a replied message',
  usage: '<emoji|sticker> (reply to message)',
  async execute(message, args) {
    if (
      message.author.id !== OWNER_ID &&
      message.author.id !== message.guild.ownerId &&
      !message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)
    ) {
      return message.reply('You need the **Manage Emojis and Stickers** permission.');
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
      return message.reply('I need the **Manage Emojis and Stickers** permission to do that.');
    }

    if (!message.reference) {
      return message.reply('Please reply to a message containing the emoji or sticker you want to steal.');
    }

    let targetMessage;
    try {
      targetMessage = await message.channel.messages.fetch(message.reference.messageId);
    } catch {
      return message.reply('Could not fetch the replied message.');
    }

    const subcommand = args[0]?.toLowerCase();
    if (!['emoji', 'sticker'].includes(subcommand)) {
      return message.reply('Specify whether to steal "emoji" or "sticker". Usage: `!steal emoji` or `!steal sticker`');
    }

    if (subcommand === 'emoji') {
      const matches = [...targetMessage.content.matchAll(/<(a?):([^:]+):(\d+)>/g)];
      if (!matches.length) {
        return message.reply('No custom emoji found in the replied message.');
      }

      const results = [];

      for (const match of matches) {
        const isAnimated = match[1] === 'a';
        const emojiName = match[2];
        const emojiId = match[3];
        const safeName = emojiName.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
        const extensions = isAnimated ? ['gif', 'webp'] : ['png', 'webp'];

        let emojiUrl = null;
        for (const ext of extensions) {
          const url = `https://cdn.discordapp.com/emojis/${emojiId}.${ext}`;
          try {
            const res = await fetch(url);
            if (res.ok) {
              emojiUrl = url;
              break;
            }
          } catch {
            continue;
          }
        }

        if (!emojiUrl) {
          results.push(`\`${emojiName}\` — *Could not fetch image*`);
          continue;
        }

        try {
          const addedEmoji = await message.guild.emojis.create({ attachment: emojiUrl, name: safeName });
          results.push(`${addedEmoji} \`${addedEmoji.name}\``);
        } catch (err) {
          console.error(err);
          results.push(`\`${emojiName}\` — *Failed to add (limit or error)*`);
        }
      }

      const embed = new EmbedBuilder()
        .setColor('#bbd8ff')
        .setTitle('Emoji Stealer Report')
        .setDescription(results.join('\n'))
        .addFields({ name: 'Executor', value: `<@${message.author.id}>` })
        .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
        .setTimestamp();

      const sent = await message.channel.send({ embeds: [embed] });
      setTimeout(() => sent.delete().catch(() => {}), 15000);
      return;
    }

    if (subcommand === 'sticker') {
      if (!targetMessage.stickers || targetMessage.stickers.size === 0) {
        return message.reply('No stickers found in the replied message.');
      }

      const sticker = targetMessage.stickers.first();
      const allowedFormats = [1, 2]; // PNG/APNG only

      if (!allowedFormats.includes(sticker.format)) {
        return message.reply('This sticker format is not supported.');
      }

      try {
        const response = await fetch(sticker.url);
        const buffer = await response.buffer();

        const addedSticker = await message.guild.stickers.create({
          file: buffer,
          name: sticker.name,
          description: sticker.description || 'Added by Akame',
          tags: sticker.tags || 'sticker',
        });

        const embed = new EmbedBuilder()
          .setColor('#bbd8ff')
          .setTitle('Sticker Stolen')
          .setDescription(`Successfully added sticker: \`${addedSticker.name}\``)
          .addFields({ name: 'Executor', value: `<@${message.author.id}>` })
          .setFooter({ text: '(© Friston Systems • 2025)', iconURL: message.client.user.displayAvatarURL() })
          .setTimestamp();

        const sent = await message.channel.send({ embeds: [embed] });
        setTimeout(() => sent.delete().catch(() => {}), 15000);
      } catch (err) {
        console.error(err);
        return message.reply('Failed to add sticker. It may exceed limits or be invalid.');
      }
    }
  }
};
