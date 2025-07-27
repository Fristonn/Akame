const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const fs = require('fs');

function getLinuxDistro() {
  try {
    const osRelease = fs.readFileSync('/etc/os-release', 'utf8');
    const prettyNameLine = osRelease
      .split('\n')
      .find(line => line.startsWith('PRETTY_NAME='));
    if (prettyNameLine) {
      return prettyNameLine.split('=')[1].replace(/"/g, '');
    }
  } catch {
    return 'Unknown Linux Distro';
  }
  return 'Unknown Linux Distro';
}

function getCpuModel() {
  const cpus = os.cpus();
  return cpus && cpus.length ? cpus[0].model : 'N/A';
}

function isLikelyVps(hostname, platform) {
  // Basic VPS detection logic
  const lowered = hostname.toLowerCase();
  const commonVpsIndicators = ['vps', 'docker', 'virtual', 'linode', 'digitalocean', 'amazon', 'aws', 'azure', 'gcp', 'google', 'hetzner', 'scaleway', 'ovh'];

  if (platform !== 'linux') return false;

  return commonVpsIndicators.some(indicator => lowered.includes(indicator));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('evaltools')
    .setDescription('Owner-only tools for eval/debugging.'),

  async execute(interaction) {
    const ownerId = process.env.OWNER_ID;
    if (interaction.user.id !== ownerId) {
      return interaction.reply({
        content: 'Seriously? You thought that was gonna work? Baka',
        flags: 64
      });
    }

    const platform = os.platform();
    const osType = os.type();
    const hostname = os.hostname();
    const uptimeMinutes = Math.floor(os.uptime() / 60);
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(2);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(2);
    const cpuModel = getCpuModel();
    const linuxDistro = platform === 'linux' ? getLinuxDistro() : 'N/A';
    const likelyVps = isLikelyVps(hostname, platform);

    const embed = new EmbedBuilder()
      .setTitle('Eval Tools')
      .setDescription('Owner-only debug information and runtime environment for the bot.')
      .addFields(
        {
          name: 'Client Debug Snippets',
          value: [
            '`this.client.guilds.cache.size`',
            '`this.client.users.cache.size`',
            '`Object.keys(require.cache)`',
            '`process.memoryUsage()`',
            '`interaction.client.commands.map(c => c.data.name)`',
            '`interaction.channel.send("message text")`'
          ].join('\n')
        },
        {
          name: 'System Information',
          value: [
            `Platform        : ${platform} (${osType})`,
            `Linux Distro    : ${linuxDistro}`,
            `Hostname        : ${hostname}`,
            `Likely VPS      : ${likelyVps ? 'Yes' : 'No'}`,
            `Uptime          : ${uptimeMinutes} minutes`,
            `CPU Cores       : ${os.cpus().length} (${cpuModel})`,
            `Memory (free)   : ${freeMem} MB`,
            `Memory (total)  : ${totalMem} MB`,
            `Node.js Version : ${process.version}`,
            `Process PID     : ${process.pid}`
          ].join('\n')
        }
      )
      .setColor('Blurple')
      .setFooter({ text: '(© Friston Systems • 2025)' });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
