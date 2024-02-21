const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Get the current queue.")
    ,
    run: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel) return interaction.reply("You need to be in a Voice Channel to use this command.");
        const queue = await client.player.nodes.get(interaction.guild) || await client.player.nodes.create(interaction.guild);

        console.log(queue)

        if (queue.tracks.size === 0) {
            await interaction.reply("The current queue is empty.");
            return;
        }

        const queueString = queue.tracks.data.slice(0, 10).map((song, i) => {
            return `${i + 1}. [${song.duration}] ${song.title} - <@${song.requestedBy.id}>`
        }).join("\n")

        // Get the current song
        const currentSong = queue.currentTrack

        await interaction.reply({
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