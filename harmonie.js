require('dotenv').config();

const { Client, Intents, Collection, Routes, REST } = require('discord.js');
const { Player } = require("discord-player")

const fs = require('fs');
const path = require('path');
const { GatewayIntentBits } = require('discord-api-types/v10');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]
});

// List of all commands
const commands = [];
client.commands = new Collection();

const cmdDir = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(cmdDir).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(path.join(cmdDir, file));
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

// Add the player on the client
client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});
client.player.extractors.loadDefault();

client.on("ready", () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);
    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log('Successfully updated commands for guild ' + guildId))
            .catch(console.error);
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.run({ client, interaction });
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: "There was an error executing this command" });
    }
});

client.login(process.env.TOKEN);