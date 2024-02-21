const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { getQueueString } = require("../../utils/string");

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

        const queueString = getQueueString(queue)
        const currentSong = queue.currentTrack
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**Currently Playing**\n` +
                        (currentSong ? `\`[${currentSong.duration}]\` ${currentSong.title} - <@${currentSong.requestedBy.id}>` : "None") +
                        `\n\n**Queue**\n${queueString}`
                    )
                    .setThumbnail(currentSong.thumbnail)
            ]
        })
    },
}