const { Collection, Permissions, MessageActionRow, MessageAttachment, MessageEmbed, MessageButton } = require("discord.js");
const { randomBytes } = require("crypto");
const Canvas = require("canvas");
// https://howdoyouplayit.com/monopoly-rules-play-monopoly
module.exports = {
    /**
     * Slash-Command-Data
     */
    cmdData: {
        name: 'monopoly',
        options:  [
            {
                name: `join_key`,
                description: `Wanna join a game? - Enter a Key!`,
                required: false, 
                autocomplete: undefined,
                type: 3
            }
        ],
        description: 'Start / Join a Monopoly Game',
        default_permission: undefined
    },

    /**
     * Asynchronous Executive Function to handle the Command
     * @param {*} client Discord Client 
     * @param {*} i Interaction
     * @returns Boolean
     */
    async runCommand(client, i) {
        const { options, guild } = i;
        const join_key = options ? options.getString("join_key") : null;
        
        // ensure the variables of the gameMap
        let players = client.gameMap.get("playergames");
        if(!players) {
            client.gameMap.set("playergames", new Collection());
            players = client.gameMap.get("playergames");
        }
        
        // if the player is already playing a game of monopoly return
        if(players.has(i.user.id)) {
            const gameChannelId = players.get(i.user.id).channel;
            const gameChannel = guild.channels.cache.get(gameChannelId) || await guild.channels.fetch(gameChannelId).catch(() => null);
            if(gameChannel) {
                return i.reply({
                    content: `❌ **You already have an ongoing Game in ${gameChannel} with the key: \`${players.get(i.user.id).key}\`!**`,
                    ephemeral: true,
                }).catch(console.warn);
            } else {
                players.delete(i.user.id);
            }
        }

        if(!join_key) {
            await i.reply({
                content: `... Now starting a Game of Monopoly!`,
                ephemeral: true
            }).catch(console.warn);
            return this.startAGame(client, i);
        } else {
            // get the game
            const game = client.gameMap.get(join_key);
            if(!game) {
                return i.reply({
                    ephemeral: true,
                    content: `❌ **This Game does not exist!**`,
                }).catch(console.warn);
            }
            if(game.joinedPlayers.length > 4) {
                return i.reply({
                    ephemeral: true,
                    content: `❌ **This Game is full!**`,
                }).catch(console.warn);
            }
            
            if(game.started) {
                return i.reply({
                    ephemeral: true,
                    content: `❌ **This Game started already!**`,
                }).catch(console.warn);
            }
            
            if(game.guild != i.guild.id) {
                return i.reply({
                    ephemeral: true,
                    content: `❌ **This Game is not running in this Server!**`,
                }).catch(console.warn);
            }
            
            if(game.joinedPlayers.some(d => d.id == i.user.id)) {
                return i.reply({
                    ephemeral: true,
                    content: `❌ **You already joined this Game!**`,
                }).catch(console.warn);
            }

            await i.reply({
                content: `... Now joining the Game!`,
                ephemeral: true,
            }).catch(console.warn);

            return this.joinAGame(client, game, i);
        }
    },

    /**
     * Static GameData like: "Emojis", "Strings", "Values", "Images" and "Attachment(s)"
     */
    gameData: {
        fields: {
            0: { cat: "", owned: { x: 0, y: 0 }, x: 1515, y: 1515, card: "Go - Start Field", price: 200, image: "", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400} }, // GO-Field
            1: { cat: "brown", owned: { x: 1315, y: 1350 }, x: 1275, y: 1515, card: "Old Kent Road", price: 60, houses_price: 50, image: "https://imgur.com/N2lyqnW.png", costs: { 0: 2, 1: 10, 2: 30, 3: 90, 4: 160 } }, // Old Kent Road
            2: { cat: "chest", owned: { x: 1190, y: 1350 }, x: 1150, y: 1515, card: "Community Chest", price: false, image: "https://static.wikia.nocookie.net/monopoly/images/a/ae/CommunittyChessst.jpg", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Community Chest
            3: { cat: "brown", owned: { x: 1055, y: 1350 }, x: 1015, y: 1515, card: "Whitechapel Road", price: 60, houses_price: 50, image: "https://imgur.com/hlf6bQc.png", costs: { 0: 4, 1: 20, 2: 60, 3: 180, 4: 320 } }, // Whitechapel Road
            4: { cat: "", owned: { x: 925, y: 1350 }, x: 885, y: 1515, card: "Income Tax", price: 200, image: "https://imgur.com/i7whHmi.png", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Income Tax
            5: { cat: "station", owned: { x: 795, y: 1350 }, x: 755, y: 1515, card: "Kings Cross Station", price: 200, image: "https://imgur.com/uaGVrem.png", costs: { 0: 25, 1: 25, 2: 50, 3: 100, 4: 200 } }, // Kings Cross Station
            6: { cat: "light_blue", owned: { x: 665, y: 1350 }, x: 625, y: 1515, card: "The Angel Islington", price: 100, houses_price: 50, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8765.jpg", costs: { 0: 6, 1: 30, 2: 90, 3: 270, 4: 400 } }, // The Angel Islington
            7: { cat: "", owned: { x: 530, y: 1350 }, x: 490, y: 1515, card: "Chance", price: false, image: "https://imgur.com/kgrrPqS.png", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Chance
            8: { cat: "light_blue", owned: { x: 405, y: 1350 }, x: 365, y: 1515, card: "Euston Road", price: 100, houses_price: 50, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8769.jpg", costs: { 0: 6, 1: 30, 2: 90, 3: 270, 4: 400 } }, // Euston Road
            9: { cat: "light_blue", owned: { x: 275, y: 1350 }, x: 235, y: 1515, card: "Pentonville Road", price: 120, houses_price: 50, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8759.jpg", costs: { 0: 8, 1: 40, 2: 100, 3: 300, 4: 450 } }, // Pentonville Road
            10: { cat: "", owned: { x: 0, y: 0 }, x: 75, y: 1425, card: "Jail - Just Visiting", price: false, image: "", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Jail
            11: { cat: "pink", owned: { x: 215, y: 1315 }, x: 75, y: 1275, card: "Pall Mall", price: 140, houses_price: 100, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8789.jpg", costs: { 0: 10, 1: 50, 2: 150, 3: 450, 4: 625 } }, // Pall Mall
            12: { cat: "", owned: { x: 215, y: 1190 }, x: 75, y: 1150, card: "Electric Company", price: 150, image: "https://m.media-amazon.com/images/I/61hl40f2U9L._SL1334_.jpg", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Electric Company
            13: { cat: "pink", owned: { x: 215, y: 1055 }, x: 75, y: 1015, card: "Whitehall", price: 140, houses_price: 100, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8776.jpg", costs: { 0: 10, 1: 50, 2: 150, 3: 450, 4: 625 } }, // Whitehall
            14: { cat: "pink", owned: { x: 215, y: 925 }, x: 75, y: 885, card: "Northurmrl'D Avenue", price: 160, houses_price: 100, image: "", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Northurmrl'D Avenue
            15: { cat: "station", owned: { x: 215, y: 795 }, x: 75, y: 755, card: "Marylebone Station", price: 200, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8660.jpg", costs: { 0: 25, 1: 25, 2: 50, 3: 100, 4: 200 } }, // Marylebone Station
            16: { cat: "orange", owned: { x: 215, y: 665 }, x: 75, y: 625, card: "Bow Street", price: 180, houses_price: 100, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8753.jpg", costs: { 0: 14, 1: 70, 2: 200, 3: 550, 4: 750 } }, // Bow Street
            17: { cat: "chest", owned: { x: 215, y: 530 }, x: 75, y: 490, card: "Community Chest", price: false, image: "https://static.wikia.nocookie.net/monopoly/images/a/ae/CommunittyChessst.jpg", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Community Chest
            18: { cat: "orange", owned: { x: 215, y: 405 }, x: 75, y: 365, card: "Marlborough Street", price: 180, houses_price: 100, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8742.jpg", costs: { 0: 14, 1: 70, 2: 200, 3: 550, 4: 750 } }, // Marlborough Street
            19: { cat: "orange", owned: { x: 215, y: 275 }, x: 75, y: 235, card: "Vine Street", price: 200, houses_price: 100, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8746.jpg", costs: { 0: 16, 1: 80, 2: 220, 3: 600, 4: 800 } }, // Vine Street
            20: { cat: "", owned: { x: 0, y: 0 }, x: 75, y: 75, card: "Free Parking", price: false, image: "", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Free Parking
            21: { cat: "red", owned: { x: 275, y: 215 }, x: 235, y: 75, card: "Strand", price: 220, houses_price: 150, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8735-300x470.jpg", costs: { 0: 18, 1: 90, 2: 250, 3: 700, 4: 875 } }, // Strand
            22: { cat: "", owned: { x: 405, y: 215 }, x: 365, y: 75, card: "Chance", price: false, image: "https://imgur.com/kgrrPqS.png", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Chance
            23: { cat: "red", owned: { x: 530, y: 215 }, x: 490, y: 75, card: "Fleet Street", price: 220, houses_price: 150, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8735.jpg", costs: { 0: 18, 1: 90, 2: 250, 3: 700, 4: 875 } }, // Fleet Street
            24: { cat: "red", owned: { x: 665, y: 215 }, x: 625, y: 75, card: "Trafalgar Square", price: 240, houses_price: 150, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8728.jpg", costs: { 0: 20, 1: 100, 2: 300, 3: 750, 4: 925 } }, // Trafalgar Square
            25: { cat: "station", owned: { x: 795, y: 215 }, x: 755, y: 75, card: "Fenchurch St. Station", price: 200, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8667.jpg", costs: { 0: 25, 1: 25, 2: 50, 3: 100, 4: 200 } }, // Fenchurch st. Station
            26: { cat: "yellow", owned: { x: 925, y: 215 }, x: 885, y: 75, card: "Leicester Square", price: 260, houses_price: 150, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8713.jpg", costs: { 0: 22, 1: 110, 2: 330, 3: 800, 4: 975 } }, // Leicester Square
            27: { cat: "yellow", owned: { x: 1055, y: 215 }, x: 1015, y: 75, card: "Coventry Street", price: 260, houses_price: 150, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8718.jpg", costs: { 0: 22, 1: 110, 2: 330, 3: 800, 4: 975 } }, // Coventry Street
            28: { cat: "", owned: { x: 1190, y: 215 }, x: 1150, y: 75, card: "Water Works", price: 150, image: "https://m.media-amazon.com/images/I/61hl40f2U9L._SL1334_.jpg", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Water Works
            29: { cat: "yellow", owned: { x: 1315, y: 215 }, x: 1275, y: 75, card: "Piccadilly", price: 280, houses_price: 150, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8707.jpg", costs: { 0: 24, 1: 120, 2: 360, 3: 850, 4: 1025 } }, // Piccadilly
            30: { cat: "", owned: { x: 0, y: 0 }, x: 1425, y: 75, card: "Go to Jail", price: false, image: "", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // go to jail
            31: { cat: "green", owned: { x: 1350, y: 275 }, x: 1515, y: 235, card: "Regent Street", price: 300, houses_price: 200, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8703.jpg", costs: { 0: 26, 1: 130, 2: 390, 3: 900, 4: 1100 } }, // Regent street
            32: { cat: "green", owned: { x: 1350, y: 405 }, x: 1515, y: 365, card: "Oxford Street", price: 300, houses_price: 200, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8698.jpg", costs: { 0: 26, 1: 130, 2: 390, 3: 900, 4: 1100 } }, // Oxfor Street
            33: { cat: "chest", owned: { x: 1350, y: 540 }, x: 1515, y: 490, card: "Community Chest", price: false, image: "https://static.wikia.nocookie.net/monopoly/images/a/ae/CommunittyChessst.jpg", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Community Chest
            34: { cat: "green", owned: { x: 1350, y: 665 }, x: 1515, y: 625, card: "Bond Street", price: 320, houses_price: 200, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8692.jpg", costs: { 0: 28, 1: 150, 2: 450, 3: 1000, 4: 1200 } }, // Bond Street
            35: { cat: "station", owned: { x: 1350, y: 795 }, x: 1515, y: 755, card: "Liverpool St. Station", price: 200, image: "https://www.teamtoyboxes.com.au/wp-content/uploads/2020/03/IMG_8673.jpg", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Liverpool St. Station
            36: { cat: "", owned: { x: 1350, y: 925 }, x: 1515, y: 885, card: "Chance", price: false, image: "https://imgur.com/kgrrPqS.png", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Chance
            37: { cat: "dark_blue", owned: { x: 1350, y: 1055 }, x: 1515, y: 1015, card: "Park Lane", price: 350, houses_price: 200, image: "https://imgur.com/GkG9KqB.png", costs: { 0: 35, 1: 175, 2: 500, 3: 1100, 4: 1300 } }, // Park Lane
            38: { cat: "", owned: { x: 1350, y: 1190 }, x: 1515, y: 1150, card: "Super Tax", price: 100, image: "https://imgur.com/ewprXnv.png", costs: { 0: 50, 1: 100, 2: 200, 3: 300, 4: 400 } }, // Super Tax
            39: { cat: "dark_blue", owned: { x: 1350, y: 1315 }, x: 1515, y: 1275, card: "Mayfair", price: 400, houses_price: 200, image: "https://imgur.com/c51x6We.png", costs: { 0: 50, 1: 200, 2: 600, 3: 1400, 4: 1700 } }, // Mayfair
        },
        numberEmojis: {
            1: "1️⃣",
            2: "2️⃣",
            3: "3️⃣",
            4: "4️⃣",
            5: "5️⃣",
            6: "6️⃣",
        },
        playerEmojis : [
            "🔴",
            "🟡",
            "🟢",
            "🔵"
        ],
        playerImages: [
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/large-red-circle_1f534.png",
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/large-yellow-circle_1f7e1.png",
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/large-green-circle_1f7e2.png",
            "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/google/313/large-blue-circle_1f535.png"
        ],
        houseImage: "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/au-kddi/190/house-building_1f3e0.png",
        monopolyEmoji: "<:Monopoly:977910591626805298>",
        moneyEmoji: "💶",
        startGameEmoji: "977910591626805298", // <:Monopoly:977910591626805298>
        diceEmoji: "🎲",
        embedColor: "BLURPLE",
        boardImage: "https://imgur.com/8tsGT7E.png"
    },

    /**
     * Asynchronous Function, to handle when a Game should be started
     * @param {*} client Discord Client 
     * @param {*} i Interaction
     * @returns replied Interaction
     */
    async startAGame(client, i) {
        const players = client.gameMap.get("playergames");
        const newGameKey = this.getRandomUniqueKey(client, 5);
        
        // If the Bot is missing permissions stop
        const toCheckPerms = [ Permissions.FLAGS.MANAGE_CHANNELS, Permissions.FLAGS.MANAGE_MESSAGES, Permissions.FLAGS.EMBED_LINKS ];
        const missingPerms = toCheckPerms.filter(perm => !i.guild.me.permissions.has(perm));
        if(missingPerms.length > 0){
            return i.editReply({
                content: `❌ **I am missing the ${missingPerms.map(p => `\`${p}\``).join(", ")} Permission${missingPerms.length > 1 ? "s" : ""}!**`,
                ephemeral: true,
            }).catch(console.warn);
        }
        
        const gameChannel = await i.guild.channels.create(`monopoly-${newGameKey}`.substring(0, 32), { 
            reason : "New Game", 
            type: "GUILD_TEXT",
            permissionOverwrites: [
                {
                  id: i.guild.id,
                  deny: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ],
                },
                {
                  id: i.user.id,
                  allow: [ Permissions.FLAGS.VIEW_CHANNEL ],
                  deny: [ Permissions.FLAGS.SEND_MESSAGES ],
                },
             ],
        }).catch(console.warn);
    
        if(!gameChannel) {
            return i.editReply({
                content: `❌ **Failed to Create a new Game-Channel!**`,
                ephemeral: true,
            }).catch(console.warn);
        }
        
        // joined Players Variable
        const joinedPlayers = [ {
            id: i.user.id,
            ownedFields: [],
            currentFieldPosition: 0,
            doubleThrows: 0,
            movedStart: false,
            money: 1500 
        } ]

        // The game-Data Object
        const game = {
            key: newGameKey,
            guild: i.guild.id,
            gameChannel,
            started: false,
            starter: i.user,
            currentPlayerIndex: 0,
            joinedPlayers,
            collector: false,
            oldboard: false,
            canvasImages: {
                board: false,
                oldboard: false,
                players: {
                    0: false,
                    1: false,
                    2: false,
                    3: false
                }
            }
        };

        // Send the New Game Message
        const gameMessage = await gameChannel.send(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
        
        if(!gameMessage) {
            return i.editReply({
                content: `❌ **Failed to send the new Game-Message!**`,
                ephemeral: true,
            }).catch(console.warn);
        }

        // add the game message to the game-Data Object
        game.gameMessage = gameMessage;
        
        // create the Game Property
        client.gameMap.set(newGameKey, game);
    
        // make the player to be "joined" to any Game
        players.set(i.user.id, { key: newGameKey, channel: gameChannel.id });

        // Initialize the Collector, so that it's able to start/cancel the game
        this.ManageGameCollector(client, game);
        
        //Edit the loading interaction
        return i.editReply({
            content: `✅ Started the Game with the Key: \`${newGameKey}\` in ${gameChannel}\n> You can start it anytime, by pressing the **STARTBUTTON** in that Channel\n> To Invite Friends, send them this Code or tell them to type the SLASH_COMMAND: \n\`\`\`/monopoly join_key:${newGameKey}\`\`\``,
            ephemeral: true
        }).catch(console.warn);
    },

    /**
     * Asynchronous Function, to handle when a User joins a Game
     * @param {*} client Discord Client
     * @param {*} game Game-Data
     * @param {*} i Interaction
     * @returns replied-interaction
     */
    async joinAGame(client, game, i) {
        const players = client.gameMap.get("playergames");
        game.joinedPlayers.push({
            id: i.user.id,
            ownedFields: [],
            currentFieldPosition: 0,
            movedStart: false,
            money: 1500 
        });

        // Add the User to the Game-Channel
        const perms = await game.gameChannel.permissionOverwrites.edit(i.user, { VIEW_CHANNEL: true }).catch(console.error);
        if(!perms) {
            return i.editReply({
                ephemeral: true,
                content: `❌ **Could not join the Game!**\n> I could not give you \`VIEW_CHANNEL\` Permissions..`
            }).catch(console.warn);
        }
        
        // Update the Game-Message
        const msgEdit = await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
        if(!msgEdit) {
            return i.editReply({
                ephemeral: true,
                content: `❌ **Could not join the Game!**\n> I could not edit the Game-Message..`
            }).catch(console.warn);
        }
        
        // make the player to be "joined" to the game
        players.set(i.user.id, {
            key: game.key,
            channel: game.gameChannel.id
        });
        
        return i.editReply({
            ephemeral: true,
            content: `✅ **Successfully joined the Game in ${game.gameChannel}!**`
        }).catch(console.warn);
    },

    /**
     * Collector to handle the Game
     * @param {*} client Discord Client
     * @param {*} game Game-Data
     */
    async ManageGameCollector(client, game) {
        game.collector = game.gameMessage.createMessageComponentCollector({ filter: (i) => !i.user.bot });
        game.collector.on("collect", async (interaction) => {
            switch(interaction.customId) {
                // Cancelling a Game
                case "monopoly_cancel": {
                    if(interaction.user.id != game.starter.id) {
                        return interaction.reply({
                            ephemeral: true,
                            content: `❌ I'm sorry, but only the Game-Creator is allowed to cancel the Game!`
                        }).catch(console.warn);
                    }
                    
                    await interaction.reply({
                        content: `✅ Cancelled the Game, this Channel will be deleted <t:${Math.floor((Date.now() + 60_000) / 1000)}:R>`
                    }).catch(console.warn);

                    return game.collector.stop();

                } break;

                case "monpoly_start": {
                    if(interaction.user.id != game.starter.id) {
                        return interaction.reply({
                            ephemeral: true,
                            content: `❌ I'm sorry, but only the Game-Creator is allowed to start the Game!`
                        }).catch(console.warn);
                    }

                    await interaction.reply({
                        content: `... Now Starting the Game`
                    }).catch(console.warn);

                    game.started = true;

                    game.currentPlayerIndex = Math.floor(Math.random() * game.joinedPlayers.length); 
                    const curPlayerInfo = game.joinedPlayers[game.currentPlayerIndex]

                    // Update the Game-Message
                    const msgEdit = await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                    if(!msgEdit) {
                        return i.editReply({
                            ephemeral: true,
                            content: `❌ **Could not join the Game!**\n> I could not edit the Game-Message..`
                        }).catch(console.warn);
                    }

                    this.sendReminderPing(client, game);
                    
                    await interaction.editReply({
                        content: `✅ Started the Game, the first Player is: <@${curPlayerInfo.id}>`
                    }).catch(console.warn);

                    setTimeout(() => {
                        interaction.ephemeral ? null : interaction.deleteReply().catch(console.warn);
                    }, 5_000);

                } break;

                case "monpoly_dice": {
                    const curPlayerInfo = game.joinedPlayers[game.currentPlayerIndex]
                    if(interaction.user.id != curPlayerInfo.id) {
                        return interaction.reply({
                            ephemeral: true,
                            content: `❌ Bruh, it's not your turn.`
                        })
                    }
                    
                    game.rolling = true;

                    await interaction.update(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);

                    const RollingMessage = await interaction.followUp({
                        content: `${this.gameData.playerEmojis[game.currentPlayerIndex]} | Player ${game.currentPlayerIndex + 1} is rolling the Dice, this might take up to 5 Seconds ...`
                    });

                    // "Move for the rolled amount"
                    const rolled_Dice1 = this.rollDice(1);
                    const rolled_Dice2 = this.rollDice(1);
                    const rolled = rolled_Dice1 + rolled_Dice2;
    
                    if(rolled_Dice1 == rolled_Dice2) {
                        game.joinedPlayers[game.currentPlayerIndex].doubleThrows += 1;
                        // if they get out of jail
                        if(game.joinedPlayers[game.currentPlayerIndex].isJail) {
                            game.joinedPlayers[game.currentPlayerIndex].isJail = false;
                            game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter = 0;

                            game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition += rolled;
                            // set it back to the right value if it's too high, e.g.: 45 - 40 = field 5
                            if(game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition > 39) {
                                game.joinedPlayers[game.currentPlayerIndex].movedStart = true;
                                game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition -= 40;
                            }
                            
                            // update the game Message
                            await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                        
                            await this.delay(350);

                            await this.handleNewField(client, game, rolled, RollingMessage, `${this.gameData.playerEmojis[game.currentPlayerIndex]} | **Player ${game.currentPlayerIndex + 1}** rolled \`${rolled_Dice1}\` & \`${rolled_Dice2}\`, a Double-Throw and can now go out of Jail. They move to the Field **${this.gameData.fields[game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition].card}** (\`#${game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition}\`)`);
                            
                            game.rolling = false;

                            await this.delay(350);

                            if(game.joinedPlayers[game.currentPlayerIndex].money < 0) {
                                game.gameChannel.send({
                                    content: `STOPPING GAME, because <@${game.joinedPlayers[game.currentPlayerIndex].id}> ran out of Money!`
                                }).catch(console.warn)
                                return game.collector.stop();
                            }
        
                            game.currentPlayerIndex += 1;
                            if(game.currentPlayerIndex >= game.joinedPlayers.length) game.currentPlayerIndex = 0;
                            
                            // update the game Message
                            await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                    
                            // next player's turn
                            this.sendReminderPing(client, game);
                            
                            return;
                        } else {
                            // Move to jail
                            if(game.joinedPlayers[game.currentPlayerIndex].doubleThrows == 3) {
                                game.joinedPlayers[game.currentPlayerIndex].doubleThrows = 0;
                                game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition = 10;
                                game.joinedPlayers[game.currentPlayerIndex].isJail = true;
                                game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter = 0;

                                // update the game Message
                                await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                                
                                await this.delay(350);

                                await this.handleNewField(client, game, rolled, RollingMessage, `${this.gameData.playerEmojis[game.currentPlayerIndex]} | **Player ${game.currentPlayerIndex + 1}** rolled \`${rolled_Dice1}\` & \`${rolled_Dice2}\`, their third Double-Throw\n> They now need to go to JAIL for 3 Rounds / until they throw another Double-Throw!`);
                                
                                game.rolling = false;

                                await this.delay(350);

                                if(game.joinedPlayers[game.currentPlayerIndex].money < 0) {
                                    game.gameChannel.send({
                                        content: `STOPPING GAME, because <@${game.joinedPlayers[game.currentPlayerIndex].id}> ran out of Money!`
                                    }).catch(console.warn)
                                    return game.collector.stop();
                                }
            
                                game.currentPlayerIndex += 1;
                                if(game.currentPlayerIndex >= game.joinedPlayers.length) game.currentPlayerIndex = 0;
                                
                                // update the game Message
                                await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                                
                                // next player's turn
                                this.sendReminderPing(client, game);
                                
                                return;
                            }

                            game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition += rolled;
                            // set it back to the right value if it's too high, e.g.: 45 - 40 = field 5
                            if(game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition > 39) {
                                game.joinedPlayers[game.currentPlayerIndex].movedStart = true;
                                game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition -= 40;
                            }
                            
                            // update the game Message
                            await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                            
                            await this.delay(350);

                            await this.handleNewField(client, game, rolled, RollingMessage, `${this.gameData.playerEmojis[game.currentPlayerIndex]} | **Player ${game.currentPlayerIndex + 1}** rolled \`${rolled_Dice1}\` & \`${rolled_Dice2}\`, a Double-Throw and can roll again!`);
                            
                            game.rolling = false;

                            await this.delay(350);

                            if(game.joinedPlayers[game.currentPlayerIndex].money < 0) {
                                game.gameChannel.send({
                                    content: `STOPPING GAME, because <@${game.joinedPlayers[game.currentPlayerIndex].id}> ran out of Money!`
                                }).catch(console.warn)
                                return game.collector.stop();
                            }
        
                            // update the game Message
                            await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                            
                            // next player's turn
                            this.sendReminderPing(client, game);
                            
                            return;
                        }
                    }

                    game.joinedPlayers[game.currentPlayerIndex].doubleThrows = 0;

                    if(game.joinedPlayers[game.currentPlayerIndex].isJail) {
                        if(game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter < 3) {
                                
                            await RollingMessage.edit({
                                content: `${this.gameData.playerEmojis[game.currentPlayerIndex]} | **Player ${game.currentPlayerIndex + 1}** rolled \`${rolled_Dice1}\` & \`${rolled_Dice2}\` which means, they stay in Jail for another round. (Round ${game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter + 1} / 3)`
                            }).then(m => setTimeout(() => m.delete().catch(console.warn), 5_000))
                            
                            game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter += 1;
                            
                            game.currentPlayerIndex += 1;
                            if(game.currentPlayerIndex >= game.joinedPlayers.length) game.currentPlayerIndex = 0;
                            
                            // next player's turn
                            this.sendReminderPing(client, game);
                            
                            return true;
                        } else {
                            game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter = 0;
                            game.joinedPlayers[game.currentPlayerIndex].isJail = false;
                        }
                    }

                    game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition += rolled;
                    // set it back to the right value if it's too high, e.g.: 45 - 40 = field 5
                    if(game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition > 39) {
                        game.joinedPlayers[game.currentPlayerIndex].movedStart = true;
                        game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition -= 40;
                    }
                    
                    // update the game Message
                    await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                     
                    await this.delay(350);

                    await this.handleNewField(client, game, rolled, RollingMessage, `${this.gameData.playerEmojis[game.currentPlayerIndex]} | **Player ${game.currentPlayerIndex + 1}** rolled \`${rolled_Dice1}\` & \`${rolled_Dice2}\` and moved to the Field **${this.gameData.fields[game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition].card}** (\`#${game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition}\`)`);
                           
                    game.rolling = false;

                    await this.delay(350);
    
                    if(game.joinedPlayers[game.currentPlayerIndex].money < 0) {
                        game.gameChannel.send({
                            content: `STOPPING GAME, because <@${game.joinedPlayers[game.currentPlayerIndex].id}> ran out of Money!`
                        }).catch(console.warn)
                        return game.collector.stop();
                    }

                    game.currentPlayerIndex += 1;
                    if(game.currentPlayerIndex >= game.joinedPlayers.length) game.currentPlayerIndex = 0;
                    
                    // update the game Message
                    await game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                     
                    // next player's turn
                    this.sendReminderPing(client, game);
                    
                    return true;
                } break;

                case "monopoly_info_0": case "monopoly_info_1": case "monopoly_info_2": case "monopoly_info_3": {
                    const playerIndex = Number(interaction.customId.replace("monopoly_info_", ""));
                    interaction.reply({
                        ephemeral: true,
                        embeds: [
                            new MessageEmbed().setColor(this.gameData.embedColor)
                            .setTitle("Owned Fields")
                            .setDescription(game.joinedPlayers[playerIndex].ownedFields.length > 0 ? game.joinedPlayers[playerIndex].ownedFields.map(d => {
                                return `**${this.gameData.fields[d.position].card}** at \`#${d.position}\`\n> ${d.houses} Houses [${this.gameData.fields[d.position].costs[d.houses]} ${this.gameData.moneyEmoji} Price]`
                            }).join("\n\n").substring(0, 2048) : `Doesn't own any Field`)
                        ],
                        content: `Information about Player #${playerIndex + 1} | ${this.gameData.playerEmojis[playerIndex]}\n> Current Position: \`#${game.joinedPlayers[playerIndex].currentFieldPosition}\` **${this.gameData.fields[game.joinedPlayers[playerIndex].currentFieldPosition].card}**\nMoney: ${game.joinedPlayers[playerIndex].money} ${this.gameData.moneyEmoji}`
                    }).catch(console.warn);
                } break;
                
                default: {
                    interaction.reply({
                        ephemeral: true,
                        content: `❌ This Interaction_ID with \`${interaction.customId}\` is unkown!`
                    }).catch(console.warn);
                } break;
            }
        })
        // Once the Game ended send info to delete it
        game.collector.on("end", async () => {
            await game.gameChannel.send({
                content: `😁 **Game-Collector has ended!**\n${game.joinedPlayers.map(d => `<@${d.id}>`).join(" & ")} GG!\n> Deleting the Channel <t:${Math.floor((Date.now() + 60_000) / 1000)}:R>`,
                embed: [
                    new MessageEmbed()
                    .setColor(this.gameData.embedColor)
                    .setFooter({ text: "Monopoly-Game", iconURL: client.user.displayAvatarURL(), })
                    .addFields(game.joinedPlayers.map((d, index) => {
                            return {
                                name: `${this.gameData.playerEmojis[index]} | __Player ${index + 1}:__`, 
                                value: `<@${d.id}>\n> **Field**: \`#${d.currentFieldPosition}\`\n> **Money**: \`${d.money}\` ${this.gameData.moneyEmoji}`, 
                                inline: false
                            }
                    }))
                ]
            }).catch(console.warn);

            // delete the channel after 60_000
            setTimeout(() => game.gameChannel.delete().catch(console.warn), 60_000)
        })
    },


    async handleNewField(client, game, rolled, RollingMessage, extraText = "") {
        const newField = game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition;
        
        // land on START FIELD 
        if(newField == 0) {
            game.joinedPlayers[game.currentPlayerIndex].movedStart = false;
            await RollingMessage.edit({
                content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on \`${this.gameData.fields[newField].card}\` and will get __${this.gameData.fields[newField].price * 2}__ ${this.gameData.moneyEmoji}`,
                files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);

            game.joinedPlayers[game.currentPlayerIndex].money += this.gameData.fields[newField].price * 2;
            return true;
        } 

        // Move over the START FIELD  
        if(game.joinedPlayers[game.currentPlayerIndex].movedStart) {
            game.joinedPlayers[game.currentPlayerIndex].movedStart = false;
            await RollingMessage.edit({
                content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** moved over \`${this.gameData.fields[0].card}\` and will get __${this.gameData.fields[0].price}__ ${this.gameData.moneyEmoji}`,
                files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[0].image, "field_image.png")] : [],
            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);

            game.joinedPlayers[game.currentPlayerIndex].money += this.gameData.fields[newField].price 
        }

        // If Super Tax
        if(this.gameData.fields[newField].card.toLowerCase() == "super tax") {
            await RollingMessage.edit({
                content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** moved on \`${this.gameData.fields[newField].card}\` and will pay __${this.gameData.fields[newField].price}__ ${this.gameData.moneyEmoji} Taxes`,
                files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);

            game.joinedPlayers[game.currentPlayerIndex].money -= this.gameData.fields[newField].price 
            return true;
        }

        // If Income Tax
        if(this.gameData.fields[newField].card.toLowerCase() == "income tax") {
            await RollingMessage.edit({
                content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** moved on \`${this.gameData.fields[newField].card}\` and will pay __${this.gameData.fields[newField].price}__ ${this.gameData.moneyEmoji} Taxes`,
                files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);

            game.joinedPlayers[game.currentPlayerIndex].money -= this.gameData.fields[newField].price 
            return true;
        }

        // GO TO JAIL
        if(this.gameData.fields[newField].card.toLowerCase() == "go to jail") {
            game.joinedPlayers[game.currentPlayerIndex].currentFieldPosition = 10;
            game.joinedPlayers[game.currentPlayerIndex].isJail = true;
            game.joinedPlayers[game.currentPlayerIndex].jailRoundCounter = 0;
            
            await RollingMessage.edit({
                content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** is now in JAIL`,
                files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);

            return true;
        }

        // Free parking
        if(this.gameData.fields[newField].card.toLowerCase() == "free parking"){
            if(extraText.length > 1) {
                await RollingMessage.edit({
                    content: `${extraText}`,
                    files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
            }
            return true;
        }
        
        // Jail Just visiting
        if(this.gameData.fields[newField].card.toLowerCase() == "jail - just visiting") {
            if(extraText.length > 1) {
                await RollingMessage.edit({
                    content: `${extraText}`,
                    files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
            }
            return true;
        }

        // Land on ACTION FIELD
        if(!this.gameData.fields[newField].price) {
            if(this.gameData.fields[newField].card.toLowerCase() == "chance") {

            } else {

            }
            await RollingMessage.edit({
                content: `${extraText}\n\nLanded on ${this.gameData.fields[newField].card}, due to time Limitations of the Hackathon, I wasn't able to code this, so everyone who lands here get **150** ${this.gameData.moneyEmoji}`
            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn)
            game.joinedPlayers[game.currentPlayerIndex].money += 150;
            return true;
        }

        // Land on BUYING Field 
        if(this.gameData.fields[newField].price) {
            // if someone owns the fields, then they gotta pay for it
            const owner = game.joinedPlayers.find(d => d.ownedFields.map(d => d.position).includes(newField))
            if(owner) {
                // if he owns the field
                if(owner.id == game.joinedPlayers[game.currentPlayerIndex].id) {
                    if(game.joinedPlayers[game.currentPlayerIndex].ownedFields.find(d => d.position == newField).houses >= 4) {
                        if(extraText.length > 1) {
                            await RollingMessage.edit({
                                content: `${extraText}\n\nLanded on their own field, but has already 4 houses.`,
                                files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                            }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
                        }
                        return true;
                    }
                    if([5, 15, 25, 35].includes(newField)) {
                        await RollingMessage.edit({
                            content: `${extraText}\n\nLanded on own TRAIN-STATION`,
                            files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                        }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
                        return true;
                    }
                    const housePrice = this.gameData.fields[newField].houses_price || this.gameData.fields[newField].price
                    if(game.joinedPlayers[game.currentPlayerIndex].money < housePrice) {
                        return await RollingMessage.edit({
                            content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on \`${this.gameData.fields[newField].card}\` which costs ${housePrice} ${this.gameData.moneyEmoji}\n> Not enough money for it!`,
                        }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
                    }
                    
                    const msg = await RollingMessage.edit({
                        content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on \`${this.gameData.fields[newField].card}\` which they own!\n> Do they want to buy a house for ${housePrice} ${this.gameData.moneyEmoji}?`,
                        files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                        components: [
                            this.getComponentButtonRow([
                                { label: "Buy house", style: "PRIMARY", id: "buy_house" },
                                { label: "Don't buy house", style: "SECONDARY", id: "cancel_house" },
                            ])
                        ]
                    }).catch(console.warn);
                    if(!msg) return console.log("SOMETHING WENT WRONG");
                    const collected = await msg.awaitMessageComponent({filter: i => i.user.id == game.joinedPlayers[game.currentPlayerIndex].id, time: 60_000, max: 1}).catch(() => null)
                    
                    if(!collected) {
                        msg.edit({
                            content: "Time ran out - Move on.",
                            components: [],
                        }).catch(console.warn);
                        setTimeout(() => msg.delete().catch(console.warn), 5_000)
                        return true;
                    }


                    if(collected.customId == "buy_house") {
                        await collected.update({
                            content: "Bought a house, the costs are now more expensive!",
                            components: [],
                        }).catch(console.warn);
                        game.joinedPlayers[game.currentPlayerIndex].money -= housePrice;
                        const index = game.joinedPlayers[game.currentPlayerIndex].ownedFields.findIndex(d => d.position == newField);
                        game.joinedPlayers[game.currentPlayerIndex].ownedFields[index].houses += 1;
                    } else {
                        await collected.update({
                            content: "Moving on, didn't buy it",
                            components: [],
                        }).catch(console.warn)
                    }
                    setTimeout(() => msg.delete().catch(console.warn), 5_000)
                    return true;
                } else {
                    // if it's a train station
                    if([5, 15, 25, 35].includes(newField)) {
                        const trainStationsAmount = owner.ownedFields.filter(d => [5, 15, 25, 35].includes(d.position)).length;
                        await RollingMessage.edit({
                            content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on <@${owner.id}>'s Field, and payed ${this.gameData.fields[newField].costs[trainStationsAmount]} ${this.gameData.moneyEmoji}`,
                            files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                        }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
                        
                        game.joinedPlayers[game.joinedPlayers.findIndex(d => d.id == owner.id)].money += this.gameData.fields[newField].costs[trainStationsAmount];
                        game.joinedPlayers[game.currentPlayerIndex].money -= this.gameData.fields[newField].costs[trainStationsAmount];
                        return true;
                    } 
                    // if it's a electricity or water worker
                    else if (newField == 12 || newField == 28) {
                        const multiplier = game.joinedPlayers[game.currentPlayerIndex].ownedFields.filter(d => d.position != 12 && d.position != 28).length == 1 ? 4 : 10;

                        await RollingMessage.edit({
                            content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on <@${owner.id}>'s Field which is Electricity or Water Bill. The Price of the dice-eyes is multiplied with ${multiplier}x${rolled} the Dice Amount`
                        }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
                        
                        game.joinedPlayers[game.joinedPlayers.findIndex(d => d.id == owner.id)].money += rolled*multiplier;
                        game.joinedPlayers[game.currentPlayerIndex].money -= rolled*multiplier;
                        return true;
                    }
                    // if it's a normal field
                    else {
                        let multiplier = 1;
                        const { houses } = owner.ownedFields.find(d => d.position == newField);
                        const fieldValue = Object.values(this.gameData.fields).find(value => value.card == this.gameData.fields[newField].card)
                        // if the user owns all group objects, pay 2 times the value
                        if(fieldValue) {
                            var allGroupFields = Object.values(this.gameData.fields).filter(value => value.cat == fieldValue.cat).map(d => d.card);
                            var ownedGroupFields = owner.ownedFields.filter(v => allGroupFields.includes(this.gameData.fields[v.position].card));
                            if(allGroupFields.length == ownedGroupFields.length) multiplier = 2;
                        }

                        await RollingMessage.edit({
                            content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on <@${owner.id}>'s Field, and payed ${this.gameData.fields[newField].costs[houses] * multiplier} ${this.gameData.moneyEmoji}`,
                            files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                        }).then(m => setTimeout(() => m.delete().catch(console.warn), 4_000)).catch(console.warn);
                        
                        game.joinedPlayers[game.joinedPlayers.findIndex(d => d.id == owner.id)].money += this.gameData.fields[newField].costs[houses] * multiplier;
                        game.joinedPlayers[game.currentPlayerIndex].money -= this.gameData.fields[newField].costs[houses] * multiplier;
                        return true;
                    }
                }
            } else {
                if(game.joinedPlayers[game.currentPlayerIndex].money < this.gameData.fields[newField].price) {
                    return await RollingMessage.edit({
                        content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on \`${this.gameData.fields[newField].card}\` which costs ${this.gameData.fields[newField].price} ${this.gameData.moneyEmoji}\n> Not enough money for it!`,
                    }).catch(console.warn);
                }
                const msg = await RollingMessage.edit({
                    content: `${extraText}\n\n${this.gameData.playerEmojis[game.currentPlayerIndex]} **Player ${game.currentPlayerIndex + 1}** landed on \`${this.gameData.fields[newField].card}\` which costs ${this.gameData.fields[newField].price} ${this.gameData.moneyEmoji}\n> Do you want to buy it? (60 Seconds Decition time)`,
                    files: this.gameData.fields[newField].image?.length > 5 ? [new MessageAttachment(this.gameData.fields[newField].image, "field_image.png")] : [],
                    components: [
                        this.getComponentButtonRow([
                            { label: "Buy it", style: "PRIMARY", id: "buy_field" },
                            { label: "Don't buy it", style: "SECONDARY", id: "cancel_field" },
                        ])
                    ]
                }).catch(console.warn);
                if(!msg) return console.log("SOMETHING WENT WRONG");

                const collected = await msg.awaitMessageComponent({filter: i => i.user.id == game.joinedPlayers[game.currentPlayerIndex].id, time: 60_000, max: 1}).catch(() => null)
                if(!collected) {
                    msg.edit({
                        content: "Time ran out - Move on.",
                        components: [],
                    }).catch(console.warn);
                    setTimeout(() => msg.delete().catch(console.warn), 5_000);
                    return true;
                }
                if(collected.customId == "buy_field") {
                    await collected.update({
                        content: "Bought it, you can now place HOUSES on it, if you land there again!",
                        components: [],
                    }).catch(console.warn);
                    game.joinedPlayers[game.currentPlayerIndex].money -= this.gameData.fields[newField].price;
                    game.joinedPlayers[game.currentPlayerIndex].ownedFields.push({
                        houses: 0,
                        position: newField,
                    })
                } else {
                    await collected.update({
                        content: "Moving on, didn't buy it",
                        components: [],
                    }).catch(console.warn)
                }
                setTimeout(() => msg.delete().catch(console.warn), 5_000)
                return true;
            }
            return true;
        }
    },
    /**
     * Rolls a Specific Amount of Dices
     * @param {*} DiceAmount Amount of how many Dices to be rolled
     * @returns Number
     */
    rollDice(DiceAmount = 2) {
        return Math.floor(Math.random() * (DiceAmount * 6)) + 1;
    },

    /**
     * Send a Ping message of who is rolling the dice atm + delete it after ms
     * @param {*} game GameData 
     * @returns timeou
     */
    async sendReminderPing(client, game, timeout = 2_500) {
        if(game.rolling) {
            game.rolling = false;
            game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
        } else {
            game.gameMessage.fetch().then(async m => {
                if(m.components[0]?.components?.[0]?.disabled == true) {
                    game.rolling = false;
                    game.gameMessage.edit(this.getGameMessage(client, game, await this.getBoardAttachment(game))).catch(console.warn);
                }
            }).catch(console.warn);
        }
        return game.gameChannel.send(`<@${game.joinedPlayers[game.currentPlayerIndex].id}> Roll the Dice!`).then(m => setTimeout(() => m.delete().catch(console.warn), timeout)).catch(console.warn);
    },

    /**
     * @param {*} client Discord Client
     * @param {*} maxKeys maximum Keys for the Key
     * @returns a random String
     */
    getRandomUniqueKey(client, maxKeys = 8) {
        const newKey = randomBytes(maxKeys).toString("hex")
        if(client.gameMap.has(newKey)) return this.getRandomUniqueKey(client, maxKeys + 1);
        return newKey;
    },

    /**
     * @param {*} client Discord CLient
     * @param {*} game GameData
     * @param {*} attachment The Attachment for the Embed
     * @returns a MesageObject
     */
    getGameMessage(client, game, attachment) {
        const content = game.started ? `${this.gameData.monopolyEmoji} | <@${game.joinedPlayers[game.currentPlayerIndex].id}>'s Turn!\n> Waiting for him/her/they to roll the Dice` : `${this.gameData.monopolyEmoji} | ... **${game.joinedPlayers.length} / 4 Players joined, waiting for Players / Starting of the Game**\n> At least 2 Players are required`
        return {
            content,
            files: [attachment],
            embeds: [
                new MessageEmbed()
                .setColor(this.gameData.embedColor)
                .setImage(`attachment://board.png`)
                .setFooter({ text: "Monopoly-Game", iconURL: client.user.displayAvatarURL(), })
                .setAuthor({
                    name: `${game.starter.username}'s started it!`,
                    iconURL: `${game.starter.displayAvatarURL({dynamic: true})}`,
                })
                .addFields(game.joinedPlayers.map((d, index) => {
                        return {
                            name: `${this.gameData.playerEmojis[index]} | __Player ${index + 1}:__`, 
                            value: `<@${d.id}>\n> **Field**: \`#${d.currentFieldPosition}\`\n> **Money**: \`${d.money}\` ${this.gameData.moneyEmoji}`, 
                            inline: false
                        }
                }))
            ],
            components: game.started ? [this.getComponentButtonRow([
                    { emoji: this.gameData.diceEmoji, label: `Roll the Dice`, id: `monpoly_dice`, style: `SECONDARY`, disabled: game.rolling },
                    { label: `\u200b`, id: `monopoly_empty_frame_1`, style: `SECONDARY`, disabled: true },
                    { label: `\u200b`, id: `monopoly_empty_frame_2`, style: `SECONDARY`, disabled: true },
                    { label: `\u200b`, id: `monopoly_empty_frame_3`, style: `SECONDARY`, disabled: true },
                    { emoji: "❌", label: `Cancel the Game`, id: `monopoly_cancel`, style: `DANGER` },
                ]), this.getComponentButtonRow(game.joinedPlayers.map((d, i) => {
                        return { emoji: this.gameData.playerEmojis[i], label: `Player-${i + 1}-Info`, id: `monopoly_info_${i}`, style: "SECONDARY" }
                    }))
                ] : [this.getComponentButtonRow([
                    { emoji: this.gameData.startGameEmoji, label: `Start the Game`, id: `monpoly_start`, style: `SUCCESS`, disabled: game.joinedPlayers.length == 1 },
                    { label: `\u200b`, id: `monopoly_empty_frame_1`, style: `SECONDARY`, disabled: true },
                    { label: `\u200b`, id: `monopoly_empty_frame_2`, style: `SECONDARY`, disabled: true },
                    { label: `\u200b`, id: `monopoly_empty_frame_3`, style: `SECONDARY`, disabled: true },
                    { emoji: "❌", label: `Cancel the Game`, id: `monopoly_cancel`, style: `DANGER` },
                ])]
            
        }
    },

    /**
     * Renders the current canvas Attachment.
     * @param {*} game 
     * @returns Attachment
     */
    async getBoardAttachment(game) {
        if(!game.started) {
            return new MessageAttachment(this.gameData.boardImage, `board.png`);
        }
        else {
            if(!game.canvasImages) {
                game.canvasImages = {
                    board: "",
                    oldboard: "",
                    houseImage : "",
                    players: {
                        0: "",
                        1: "",
                        2: "",
                        3: ""
                    }
                }
            }

            const canvas = Canvas.createCanvas(1600, 1595);
            const ctx = canvas.getContext(`2d`);
            const bgimg = game.canvasImages.board || await Canvas.loadImage(this.gameData.boardImage);
            ctx.drawImage(bgimg, 0, 0, canvas.width, canvas.height);
            
            // render player fields
            for(const player of game.joinedPlayers) {
                const index = game.joinedPlayers.findIndex(d => d == player);
                if(player.ownedFields.length > 0) {
                    for(const field of player.ownedFields) {
                        const playerImage = game.canvasImages.players[index] || await Canvas.loadImage(this.gameData.playerImages[index]);
                        game.canvasImages.players[index] = playerImage; // save the canvas-loaded-Image, to save time later
                        ctx.drawImage(playerImage, this.gameData.fields[field.position].owned.x, this.gameData.fields[field.position].owned.y, 35, 35);
                    }
                }
            }

            // render player Pictures
            for(const player of game.joinedPlayers) {
                const index = game.joinedPlayers.findIndex(d => d == player);
                const playerImage = game.canvasImages.players[index] || await Canvas.loadImage(this.gameData.playerImages[index]);
                game.canvasImages.players[index] = playerImage; // save the canvas-loaded-Image, to save time later

                const x_Extra = player.currentFieldPosition >= 0 && player.currentFieldPosition <= 10 || player.currentFieldPosition >= 20 && player.currentFieldPosition <= 30 ? 15 : 0;
                const y_Extra = player.currentFieldPosition >= 10 && player.currentFieldPosition <= 20 || player.currentFieldPosition >= 30 && player.currentFieldPosition <= 40 ? 15 : 0;
                ctx.drawImage(playerImage, this.gameData.fields[player.currentFieldPosition].x + x_Extra * index, this.gameData.fields[player.currentFieldPosition].y + y_Extra * index, 50, 50);
            }

            // render houses and marked fields
            return new MessageAttachment(await canvas.toBuffer('image/png', { compressionLevel: 3 }), `board.png`);
        }
    },

    /**
     * @param {*} Buttons Required, if not provided null will be returned
     * @returns a button row of a given object
     */
    getComponentButtonRow(Buttons) {
        if(!Buttons) return null; // Returning so it doesn't crash
        return new MessageActionRow().addComponents(
            Buttons.map((d, index) => {
                if(!d.id || (!d.label && !d.emoji)) {
                    console.error(`Button Element with Index ${index} missing id and label/emoji`);
                    return null;
                }
                let Button = new MessageButton();
                if(d.label) Button.setLabel(d.label);
                if(d.emoji) Button.setEmoji(d.emoji);
                if(d.id) Button.setCustomId(d.id);
                if(d.disabled) Button.setDisabled(d.disabled);
                if(d.style) Button.setStyle(d.style); 
                else Button.setStyle(`SECONDARY`);
                return Button;
            }).filter(Boolean)
        )
    },

    /**
     * Sleeps/Awaits a specific amount of milliseconds
     * @param {*} ms 
     * @returns Promise
     */
    delay(ms) {
        return new Promise(r => setTimeout(() => r(2), ms))
    }
}