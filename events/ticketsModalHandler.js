const {
    ChannelType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    PermissionsBitField,
    AttachmentBuilder
} = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(process.cwd(), 'data/ticket-config.json');
const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath)) : {};

module.exports = {
    name: 'interactionCreate',

    async execute(interaction) {

        // Handle ticket select menu -> show modal
        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            const selected = interaction.values[0];

            const existing = interaction.guild.channels.cache.find(c => c.topic?.startsWith(`${interaction.user.id}|`));
            if (existing) return interaction.reply({ content: `Umm.. I guess you already have an open ticket: ${existing}`, flags: 64 });

            const titles = {
                general: 'Support Request',
                apply: 'Application Info',
                partner: 'Partnership Request',
                sponsor: 'Sponsorship Inquiry'
            };

            const labels = {
                general: 'What is your issue?',
                apply: 'Why are you applying?',
                partner: 'Why do you want to partner?',
                sponsor: 'What kind of sponsorship?'
            };

            const placeholders = {
                general: 'Please describe your problem in detail...',
                apply: 'Tell us about your qualifications...',
                partner: 'Describe your server and goals...',
                sponsor: 'What kind of sponsorship you need...'
            };

            const modal = new ModalBuilder()
                .setCustomId(`ticket_modal_${selected}`)
                .setTitle(titles[selected])
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('user_issue')
                            .setLabel(labels[selected])
                            .setStyle(TextInputStyle.Paragraph)
                            .setPlaceholder(placeholders[selected])
                            .setRequired(true)
                    )
                );

            return await interaction.showModal(modal);
        }

        //  Handle ticket modal submit -> create ticket channel
        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_modal_')) {
            await interaction.deferReply({ flags: 64 });

            const type = interaction.customId.replace('ticket_modal_', '');
            const userIssue = interaction.fields.getTextInputValue('user_issue');

            const reasonMap = {
                general: 'General Support',
                apply: 'Application',
                partner: 'Partnership',
                sponsor: 'Sponsorship'
            };

            const descriptionMap = {
                general: 'Please explain your issue in detail so our support team can assist you.',
                apply: 'Please list your qualifications and why you’re applying.',
                partner: 'Please explain your server’s details and why you’d like to partner.',
                sponsor: 'Please tell us what kind of sponsorship you are looking for.'
            };

            const reason = reasonMap[type] || 'General Support';
            const description = descriptionMap[type] || descriptionMap.general;
            const name = `ticket-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, '');

            const staffRole = await interaction.guild.roles.fetch(config.staffRoleId).catch(() => null);
            const category = await interaction.guild.channels.fetch(config.categoryId).catch(() => null);

            if (!staffRole || !category)
                return interaction.editReply({ content: 'Missing staff role or category. Check your config.' });

            const permissionOverwrites = [
                { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles] },
                { id: staffRole.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.UseExternalEmojis] }
            ];

            const channel = await interaction.guild.channels.create({
                name,
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites,
                topic: `${interaction.user.id}|${reason}`
            });

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${interaction.guild.name} • Tickets`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTitle(`Welcome to your ticket, ${interaction.user.username}`)
                .setDescription(`Thank you, <@${interaction.user.id}>\n\n${description}`)
                .addFields(
                    { name: 'Reason to open', value: reason, inline: true },
                    { name: 'User Message', value: `**${userIssue}**`, inline: false }
                )
                .setFooter({ text: `© Friston Systems 2025`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp()
                .setColor('#bbd8ff')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }) || interaction.client.user.displayAvatarURL());

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Close').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('rename_ticket').setLabel('Rename').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('claim_ticket').setLabel('Claim').setStyle(ButtonStyle.Primary)
            );

            await channel.send({
                content: `<@${interaction.user.id}>\n<@&${staffRole.id}>`,
                embeds: [embed],
                components: [buttons],
                allowedMentions: { roles: [staffRole.id], users: [interaction.user.id] }
            });

            await interaction.editReply({ content: `Ticket created: ${channel}` });
        }

        //  Button Interactions (Claim, Rename, Close)
        if (interaction.isButton()) {
            const member = interaction.member;
            const staffRoleId = config.staffRoleId;
            const isStaff = member.roles.cache.has(staffRoleId);

            if (interaction.customId === 'claim_ticket') {
                if (!isStaff) return interaction.reply({ content: 'Only staff can claim tickets.', flags: 64 });

                const oldRow = interaction.message.components[0];
                const newRow = new ActionRowBuilder().addComponents(
                    oldRow.components.map(btn =>
                        btn.customId === 'claim_ticket'
                            ? ButtonBuilder.from(btn).setDisabled(true)
                            : ButtonBuilder.from(btn)
                    )
                );

                const topicParts = interaction.channel.topic?.split('|') || [];
                const newTopic = `${topicParts[0]}|${topicParts[1]}|${interaction.user.id}`;
                await interaction.channel.setTopic(newTopic);

                await interaction.message.edit({ components: [newRow] });
                return interaction.reply({ content: `Ticket claimed by <@${interaction.user.id}>.` });
            }

            if (interaction.customId === 'rename_ticket') {
                if (!isStaff) return interaction.reply({ content: 'Only staff can rename tickets.', flags: 64 });

                const modal = new ModalBuilder()
                    .setCustomId('rename_modal')
                    .setTitle('Rename Ticket')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('new_name')
                                .setLabel('New Ticket Name')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                return interaction.showModal(modal);
            }

            if (interaction.customId === 'close_ticket') {
                const confirmEmbed = new EmbedBuilder()
                    .setTitle('Confirm Ticket Closure')
                    .setDescription(`Click the button below to confirm ticket closure.`)
                    .setColor('Red');

                const confirmRow = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('confirm_close').setLabel('Confirm Close').setStyle(ButtonStyle.Danger)
                );

                return interaction.reply({
                    embeds: [confirmEmbed],
                    content: `<@&${staffRoleId}>`,
                    components: [confirmRow],
                    allowedMentions: { roles: [staffRoleId] }
                });
            }

            //  Confirm + Generate Transcript + Countdown
            if (interaction.customId === 'confirm_close') {
                const topicParts = interaction.channel.topic?.split('|') || [];
                const opener = await interaction.guild.members.fetch(topicParts[0]).catch(() => null);

                const loadingEmbed = new EmbedBuilder()
                    .setColor('#bbd8ff')
                    .setAuthor({ name: `${interaction.guild.name} | Tickets`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTitle('Ticket Closed')
                    .setDescription('<a:loading:1394342548180304022> Generating Transcripts...')
                    .setFooter({ text: `© Friston Systems 2025`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                const statusMsg = await interaction.channel.send({ embeds: [loadingEmbed] });

                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const sorted = [...messages.values()].reverse();

                let html = `<!doctype html><html><head><meta charset="utf-8"><title>Transcript</title>
<style>body{background:#2a2a2a;color:#9c9c9c;font-family:sans-serif;}#core{overflow-y:auto;display:flex;flex-direction:column-reverse;}</style>
<script src="https://twemoji.maxcdn.com/v/latest/twemoji.min.js"></script></head><body>
<discord-header channel="${interaction.channel.name}" icon="${interaction.guild.iconURL({ dynamic: true })}" guild="${interaction.guild.name}"></discord-header>
<discord-messages id="core">\n`;

                for (const msg of sorted) {
                    if (!msg.author) continue;
                    const author = msg.author.username;
                    const avatar = msg.author.displayAvatarURL();
                    const timestamp = msg.createdAt.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
                    const content = msg.cleanContent?.replace(/\n/g, "<br>") || "*No content*";
                    html += `<discord-message author="${author}" avatar="${avatar}" timestamp="${timestamp}">${content}</discord-message>\n`;
                }

                html += `</discord-messages></body></html>
<script>twemoji.parse(document.body);document.getElementById('core').style.maxHeight = window.innerHeight - 120 + "px";</script>`;

                const filePath = path.resolve(process.cwd(), `temp-${interaction.channel.id}.html`);
                fs.writeFileSync(filePath, html);

                const file = new AttachmentBuilder(filePath, { name: `${interaction.channel.name}-transcript.html` });
                const claimer = topicParts[2] ? await interaction.guild.members.fetch(topicParts[2]).catch(() => null) : null;

                const logEmbed = new EmbedBuilder()
                    .setTitle('Ticket Closed')
                    .setColor('#bbd8ff')
                    .setAuthor({ name: `${interaction.guild.name} | Tickets`, iconURL: interaction.client.user.displayAvatarURL() })
                    .addFields(
                        { name: '• Ticket ID', value: `${interaction.channel.name}`, inline: true },
                        { name: '• Opened By', value: opener ? `<@${opener.id}>` : 'Unknown', inline: true },
                        { name: '• Closed By', value: `<@${interaction.user.id}>`, inline: true },
                        { name: '• Open Time', value: `<t:${Math.floor(interaction.channel.createdTimestamp / 1000)}:f>`, inline: true },
                        { name: '• Claimed By', value: claimer ? `<@${claimer.id}>` : 'Not Claimed', inline: true }
                    )
                    .setThumbnail(opener?.user?.displayAvatarURL({ dynamic: true }) || interaction.client.user.displayAvatarURL())
                    .setFooter({ text: `© Friston Systems 2025`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                const logChannel = interaction.guild.channels.cache.get(config.transcriptChannelId);
                if (logChannel?.isTextBased()) {
                    await logChannel.send({
                        content: `Transcript from **${interaction.channel.name}**`,
                        files: [file],
                        embeds: [logEmbed]
                    });
                }

                fs.unlinkSync(filePath);

                //  Countdown to delete ticket
                let countdown = 5;
                const countdownEmbed = EmbedBuilder.from(loadingEmbed)
                    .setDescription(`Closing this ticket in **${countdown}** seconds...`);

                await statusMsg.edit({ embeds: [countdownEmbed] });

                const interval = setInterval(async () => {
                    countdown--;
                    if (countdown > 0) {
                        countdownEmbed.setDescription(`Closing this ticket in **${countdown}** seconds...`);
                        await statusMsg.edit({ embeds: [countdownEmbed] });
                    } else {
                        clearInterval(interval);
                        const ch = await interaction.guild.channels.fetch(interaction.channelId).catch(() => null);
                        if (ch) ch.delete().catch(() => {});
                    }
                }, 1000);

                return interaction.reply({ content: 'Ticket closed and transcript sent.', flags: 64 });
            }
        }

        //  Handle rename modal submission
        if (interaction.isModalSubmit() && interaction.customId === 'rename_modal') {
            const newName = interaction.fields.getTextInputValue('new_name');
            await interaction.channel.setName(newName);
            return interaction.reply({ content: `Renamed to **${newName}**`, flags: 64 });
        }
    }
};
