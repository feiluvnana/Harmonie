function getQueueString(queue) {
    return queue.tracks.data.slice(0, 10).map((song, i) => {
        return `${i + 1}. [${song.duration}] ${song.title} - <@${song.requestedBy.id}>`
    }).join("\n")
}

function getTrackListDuration(tracks) {
    let totalS = tracks.map((track) => track.durationMS).reduce((prev, curr) => prev + curr) / 1000;
    if (totalS >= 3600) return `${Math.floor(totalS / 3600)}:${Math.floor(totalS % 3600 / 60)}:${totalS % 60}`
    return `${Math.floor(totalS / 60)}:${totalS % 60}`;
}

module.exports = {
    getQueueString,
    getTrackListDuration
}