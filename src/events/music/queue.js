const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { getQueueString, getTrackListDuration, getQueueRemainingDuration } = require("../../utils/string");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Get the current queue.")
    ,
    run: async ({ client, interaction }) => {
        await interaction.deferReply();

        if (!interaction.member.voice.channel) return interaction.editReply("You need to be in a Voice Channel to use this command.");

        const queue = await client.player.nodes.get(interaction.guild);
        if (!queue || queue.tracks.size === 0) return interaction.editReply("The current queue is empty.");

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(getQueueString(queue))
                    .setThumbnail(queue.currentTrack.thumbnail)
                    .setFooter({ text: `Number of tracks: ${queue.tracks.size}\nRemaining duration: ${getQueueRemainingDuration(queue)}` })
            ]
        })
    },
}