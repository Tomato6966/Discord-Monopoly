module.exports = async (client, interaction) => {
    if (!interaction?.isCommand()) return;
    
    const slashCommand = client.slashCommands.get(interaction.commandName);
    if(!slashCommand) return;

    if(!interaction.member || !interaction.member.guild) {
        return interaction.reply({
            ephemeral: true,
            content: `❌ **This Command only works in a Guild!**`
        }).catch(console.warn)
    }

    const { guild } = interaction.member;

    const channel = interaction.channel || guild.channels.cache.get(interaction.channelId) || await guild.channels.fetch(interaction.channelId).catch(() => {}) || false
    if(!channel.permissionsFor(guild.me).has(`EMBED_LINKS`)){
        return interaction.reply({
            ephemeral: true,
            content: `❌ **Missing permissions to EMBED_LINKS**`
        }).catch(console.warn)
    }
    
    await slashCommand.runCommand(client, interaction).catch(e => {
        console.error(e);
        return interaction.reply({
            ephemeral: true,
            content: `❌ **Something went wrong**`
        }).catch(console.warn);
    });
}