const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song from YouTube.")
    .addStringOption((option) =>
      option
        .setName("url")
        .setDescription("Youtube's URL of the song")
        .setRequired(true)
    ),
  run: async ({ client, interaction }) => {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.member.voice.channel)
      return interaction.reply(
        "You need to be in a Voice Channel to play a song."
      );
    const queue =
      (await client.player.nodes.get(interaction.guild)) ||
      (await client.player.nodes.create(interaction.guild));
    if (!queue.connection)
      await queue.connect(interaction.member.voice.channel);
    let embed = new EmbedBuilder();
    if (interaction.options.getString("url") !== undefined) {
      let url = interaction.options.getString("url");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE,
      });
      if (result.tracks.length === 0) return interaction.reply("No results");
      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the queue`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
      try {
        if (!queue.playing) await queue.play(song);
      } catch (err) {
        console.log(`Err: ${err}`);
      }
    }

    if (interaction.options.getString("url") !== undefined) {
      let url = interaction.options.getString("url");
      const result = await client.player.search(url, {
        requestedBy: interaction.user,
        searchEngine: QueryType.YOUTUBE,
      });
      if (result.tracks.length === 0) return interaction.reply("No results");
      const song = result.tracks[0];
      await queue.addTrack(song);
      embed
        .setDescription(
          `**[${song.title}](${song.url})** has been added to the queue.`
        )
        .setThumbnail(song.thumbnail)
        .setFooter({ text: `Duration: ${song.duration}` });
      try {
        if (!queue.playing) await queue.play(song);
      } catch (err) {
        console.log(`Err: ${err}`);
      }
    }

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
