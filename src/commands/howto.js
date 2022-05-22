module.exports = {
    async runCommand(client, i) {
        return i.reply({
            content: `**How to use ${client.user.username}**\n> 1. Make sure to \`/invite\` me, to the place you wanna play!\n> 2. Have your Friends / Players ready!\n> 3. Type /monopoly\n> 4. If I have all Permissions (\`MANAGE_CHANNELS\`, \`MANAGE_MESSAGES\`), then a new Game will start\n> 5. Everyone can join it with \`/monopoly join_key: <thekey_you_got>\`\n> 6. Once the join, they can see the game in the CHANNEL\n\n**How to play a Game**\n> If it's your turn, use the BUTTON to "roll the dices"\n> Your player will move to the next place\n> Then you have 30 Seconds, to decide what to do: \`Buy place\`, \`Buy House\`, \`Pay Rent\`, \`Do Nothing\`, \`...\`\n> After that, wait until it's your turn again!\n> The Game will end, once some1 doesn't have money anymore`,
            ephemeral: true,
        
        })
    },
    cmdData: {
        name: 'howto',
        description: 'Exlains how to use the Bot',
        default_permission: undefined
    }
}