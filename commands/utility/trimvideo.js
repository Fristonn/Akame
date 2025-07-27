const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const TEMP_DIR = path.join(process.cwd(), 'temp');
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// Boost level to upload limit map
const BOOST_LIMITS = {
  0: 8 * 1024 * 1024,
  1: 50 * 1024 * 1024,
  2: 100 * 1024 * 1024,
  3: 500 * 1024 * 1024,
};

function parseTimeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(p => p.trim());
  if (parts.length === 1) {
    const s = Number(parts[0]);
    return isNaN(s) || s < 0 ? null : s;
  } else if (parts.length === 2) {
    const m = Number(parts[0]);
    const s = Number(parts[1]);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    return m * 60 + s;
  }
  return null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trim-video')
    .setDescription('Trim a video file and export a short clip.')
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('Upload a video file')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('start')
        .setDescription('Start time (seconds or mm:ss)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('end')
        .setDescription('End time (seconds or mm:ss)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('filename')
        .setDescription('Optional: Rename your file (no extension)')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('format')
        .setDescription('Choose output format')
        .setRequired(false)
        .addChoices(
          { name: 'mp4', value: 'mp4' },
          { name: 'webm', value: 'webm' },
          { name: 'mov', value: 'mov' }
        )),

  async execute(interaction) {
    const file = interaction.options.getAttachment('file');
    const startStr = interaction.options.getString('start');
    const endStr = interaction.options.getString('end');
    const filenameInput = interaction.options.getString('filename');
    const selectedFormat = interaction.options.getString('format') || 'mp4';

    if (!file.contentType.startsWith('video/')) {
      return interaction.reply({
        content: 'Please upload a valid video file.',
        ephemeral: true
      });
    }

    const start = parseTimeToSeconds(startStr);
    const end = parseTimeToSeconds(endStr);

    if (start === null) {
      return interaction.reply({
        content: `Start time "${startStr}" is invalid. Use seconds or mm:ss format.`,
        ephemeral: true
      });
    }
    if (end === null) {
      return interaction.reply({
        content: `End time "${endStr}" is invalid. Use seconds or mm:ss format.`,
        ephemeral: true
      });
    }
    if (end <= start) {
      return interaction.reply({
        content: 'End time must be greater than start time.',
        ephemeral: true
      });
    }

    await interaction.deferReply();

    const cleanFileName = file.name.replace(/\s/g, '_');
    const inputPath = path.join(TEMP_DIR, cleanFileName);

    let baseName;
    if (filenameInput) {
      let sanitized = filenameInput.replace(/[^a-zA-Z0-9 \-_]/g, '').trim();
      if (sanitized.length === 0) {
        return interaction.editReply({
          content: 'Filename became empty after removing special characters.',
        });
      }
      baseName = sanitized.substring(0, 32).trim();
    } else {
      baseName = path.basename(cleanFileName, path.extname(cleanFileName)).trim().substring(0, 32);
    }

    const outputFileName = `${baseName}.${selectedFormat}`;
    const outputPath = path.join(TEMP_DIR, outputFileName);

    try {
      const res = await fetch(file.url);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(inputPath, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(inputPath)
          .setStartTime(start)
          .setDuration(end - start)
          .format(selectedFormat)
          .outputOptions('-preset ultrafast')
          .on('end', resolve)
          .on('error', reject)
          .save(outputPath);
      });

      const trimmedStat = fs.statSync(outputPath);
      const serverBoostLevel = interaction.guild?.premiumTier || 0;
      const maxAllowedSize = BOOST_LIMITS[serverBoostLevel];

      if (trimmedStat.size > maxAllowedSize) {
        let requiredLevel = Object.entries(BOOST_LIMITS).find(([tier, size]) => trimmedStat.size <= size);
        const levelNeeded = requiredLevel ? requiredLevel[0] : '3';

        return interaction.editReply(`Your trimmed video is ${(trimmedStat.size / 1024 / 1024).toFixed(2)}MB, which exceeds the **${(maxAllowedSize / 1024 / 1024)}MB** limit for your server (Boost Level ${serverBoostLevel}).\n\n To send this file, your server must be boosted to at least **Level ${levelNeeded}** or trim a shorter segment.`);
      }

      const trimmed = new AttachmentBuilder(outputPath).setName(outputFileName);
      await interaction.editReply({
        content: `Here’s your trimmed video from ${startStr} to ${endStr} (${selectedFormat.toUpperCase()}).`,
        files: [trimmed],
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply('Something went wrong while trimming the video.');
    } finally {
      try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
      try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
    }
  }
};
