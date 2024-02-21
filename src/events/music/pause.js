const { SlashCommandBuilder } = require("@discordjs/builders")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Stop the current playback.")
    ,
    run: async ({ client, interaction }) => {
        if (!interaction.member.voice.channel) return interaction.reply("You need to be in a Voice Channel to use this command.");
        const queue = await client.player.nodes.get(interaction.guild) || await client.player.nodes.create(interaction.guild);

        if (!queue.playing) {
            await interaction.reply("⚠️ The player is not currently playing.");
            return;
        }

        queue.node.pause();
        await interaction.reply("⏸️ The playback has been paused.")
    },
}