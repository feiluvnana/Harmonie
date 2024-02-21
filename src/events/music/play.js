const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");
const { QueryType } = require("discord-player");
const { getTrackDesc, getTrackListDuration } = require("../../utils/string");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a song or a playlist from Youtube.")
    .addSubcommand(sub => sub
      .setName("song")
      .setDescription("Play a song.")
      .addStringOption(option => option
        .setName("keyword")
        .setDescription("This is either a search term or a URL.")
        .setRequired(true)))
    .addSubcommand(sub => sub
      .setName("playlist")
      .setDescription("Play a playlist.")
      .addStringOption(option => option
        .setName("url")
        .setDescription("This is the playlist URL.")
        .setRequired(true))),
  run: async ({ client, interaction }) => {
    await interaction.deferReply();
    if (!interaction.member.voice.channel) return interaction.editReply("You need to be in a Voice Channel to use this command.");

    const queue =
      (await client.player.nodes.get(interaction.guild)) ||
      (await client.player.nodes.create(interaction.guild));
    if (!queue.connection) await queue.connect(interaction.member.voice.channel);

    switch (interaction.options.getSubcommand()) {
      case "song":
        await handleSongSubcommand({ player: client.player, queue, interaction });
        break;
      case "playlist":
        await handlePlaylistSubcommand({ player: client.player, queue, interaction });
        break;
    }
  },
};

async function handleSongSubcommand({ player, queue, interaction }) {
  let embed = new EmbedBuilder();
  let keyword = interaction.options.getString("keyword");

  const result = await player.search(keyword, {
    requestedBy: interaction.user,
    searchEngine: QueryType.YOUTUBE,
  });
  if (result.tracks.length === 0) return interaction.editReply("Harmonie can't find any song for this keyword. Gomennasai~");

  const song = result.tracks[0];
  await queue.addTrack(song);
  embed
    .setDescription(`**[${song.title}](${song.url})** has been added to the queue.`)
    .setThumbnail(song.thumbnail)
    .setFooter({ text: `Duration: ${song.duration}` });
  await interaction.editReply({ embeds: [embed] });

  if (!queue.playing) await queue.play(song)
}

async function handlePlaylistSubcommand({ player, queue, interaction }) {
  let embed = new EmbedBuilder();
  let url = interaction.options.getString("url");

  const result = await player.search(url, {
    requestedBy: interaction.user,
    searchEngine: QueryType.YOUTUBE_PLAYLIST,
  });
  if (result.tracks.length === 0) return interaction.editReply("Harmonie can't find any playlist for this url. Gomennasai~");
  await queue.addTrack(result.tracks);
  console.log(result)
  embed
    .setDescription(`<@${result.requestedBy.id}> has added *${result.tracks.length}* tracks from **[${result.playlist.title}](${result.playlist.url})** to the queue.`)
    .setThumbnail(result.tracks[0].thumbnail)
    .setFooter({ text: `Total duration: ${getTrackListDuration(result.tracks)}` });
  await interaction.editReply({ embeds: [embed] });

  if (!queue.playing) await queue.play(result.tracks[0])
}
