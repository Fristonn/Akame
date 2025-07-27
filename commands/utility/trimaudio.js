const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const ffmpegPath = require('ffmpeg-static');

ffmpeg.setFfmpegPath(ffmpegPath);

const TEMP_DIR = path.join(process.cwd(), 'temp');
const MAX_SIZE_MB = 8;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

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
    .setName('trim-audio')
    .setDescription('Trim audio from a file — even from a video.')
    .addAttachmentOption(option =>
      option.setName('file')
        .setDescription('Upload an audio or video file')
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
          { name: 'mp3', value: 'mp3' },
          { name: 'wav', value: 'wav' },
          { name: 'ogg', value: 'ogg' }
        ))
    .addStringOption(option =>
      option.setName('quality')
        .setDescription('Choose audio quality preset')
        .setRequired(false)
        .addChoices(
          { name: 'Low Quality (96 kbps)', value: '96' },
          { name: 'Medium Quality (192 kbps)', value: '192' },
          { name: 'Studio Quality (320 kbps)', value: '320' }
        )),

  async execute(interaction) {
    const file = interaction.options.getAttachment('file');
    const startStr = interaction.options.getString('start');
    const endStr = interaction.options.getString('end');
    const filenameInput = interaction.options.getString('filename');
    const selectedFormat = interaction.options.getString('format') || 'mp3';
    const qualityStr = interaction.options.getString('quality');
    const bitrate = qualityStr ? parseInt(qualityStr) : null;

    if (!file.contentType.startsWith('audio/') && !file.contentType.startsWith('video/')) {
      return interaction.reply({
        content: 'I can only work with audio or video files. Please upload a valid one.',
        flags: 64
      });
    }

    const start = parseTimeToSeconds(startStr);
    const end = parseTimeToSeconds(endStr);

    if (start === null) {
      return interaction.reply({
        content: `Start time "${startStr}" is invalid. Use seconds or mm:ss format.`,
        flags: 64
      });
    }
    if (end === null) {
      return interaction.reply({
        content: `End time "${endStr}" is invalid. Use seconds or mm:ss format.`,
        flags: 64
      });
    }
    if (end <= start) {
      return interaction.reply({
        content: 'End time must be greater than start time.',
        flags: 64
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
      if (sanitized.length > 32) {
        sanitized = sanitized.substring(0, 32).trim();
      }
      baseName = sanitized;
    } else {
      baseName = path.basename(cleanFileName, path.extname(cleanFileName)).trim();
      if (baseName.length > 32) {
        baseName = baseName.substring(0, 32).trim();
      }
    }

    const outputFileName = `${baseName}.${selectedFormat}`;
    const outputPath = path.join(TEMP_DIR, outputFileName);

    try {
      const res = await fetch(file.url);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(inputPath, buffer);

      await new Promise((resolve, reject) => {
        const command = ffmpeg(inputPath)
          .setStartTime(start)
          .setDuration(end - start)
          .noVideo()
          .audioCodec(
            selectedFormat === 'mp3' ? 'libmp3lame' :
            selectedFormat === 'ogg' ? 'libvorbis' :
            'pcm_s16le'
          )
          .format(selectedFormat)
          .output(outputPath)
          .on('end', resolve)
          .on('error', reject);

        if (bitrate && selectedFormat !== 'wav') {
          command.audioBitrate(bitrate);
        } else if (!bitrate && selectedFormat === 'mp3') {
          command.audioBitrate(192);
        }

        command.run();
      });

      const trimmedStat = fs.statSync(outputPath);
      if (trimmedStat.size > MAX_SIZE_BYTES) {
        await interaction.editReply(`The trimmed file exceeds ${MAX_SIZE_MB}MB. Try trimming a shorter segment or lowering the quality.`);
      } else {
        const trimmed = new AttachmentBuilder(outputPath).setName(outputFileName);
        await interaction.editReply({
          content: `Here’s your trimmed audio from ${startStr} to ${endStr} (${selectedFormat.toUpperCase()}${bitrate ? ` @ ${bitrate}kbps` : ''}).`,
          files: [trimmed],
        });
      }
    } catch (err) {
      console.error(err);
      await interaction.editReply('Something went wrong while trimming the file.');
    } finally {
      try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath); } catch {}
      try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch {}
    }
  }
};
