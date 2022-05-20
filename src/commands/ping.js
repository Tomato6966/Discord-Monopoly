module.exports = {
    async runCommand(client, i) {
        return i.reply({
            content: `**PONG!**\n> Websocket PING: \`${client.ws.ping}ms\``,
            ephemeral: true,
        
        })
    },
    cmdData: {
        name: 'ping',
        description: 'Shows the Bot Ping',
        default_permission: undefined
    }
}