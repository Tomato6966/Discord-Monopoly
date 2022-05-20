const { Intents, Client, Collection } = require("discord.js");
const { readdirSync } = require(`fs`);

class DiscordBotClient {
    constructor() {
        this.client = new Client({
            intents: [
                Intents.FLAGS.GUILDS
            ]
        });
        this.client.slashCommands = new Collection();
        this.client.allCommands = [];
        this.client.gameMap = new Collection();
        this.loadSlash();
        this.loadEvents();
        return this;
    }


    /**
     * Loads all the SLASH-COMMANDS
     * @returns Boolean
     */
    loadSlash() {
        /*const cmds = readdirSync(`${process.cwd()}/src/commands`).filter((f) => f.endsWith(`.js`));
        for(const file of cmds) {
            const cmd = require(`${process.cwd()}/src/commands/ping.js`);
            this.client.allCommands.push(cmd.cmdData);
            this.client.slashCommands.set(cmd.cmdData.name, cmd);
        }*/
        const cmd = require(`${process.cwd()}/src/commands/ping.js`);
        this.client.allCommands.push(cmd.cmdData);
        this.client.slashCommands.set(cmd.cmdData.name, cmd);
        return true;
    }


    /**
     * Loads all the EVENTS
     * @returns Boolean
     */
    loadEvents() {
        
        var event = require(`${process.cwd()}/src/events/interactionCreate.js`)
        this.client.on(file.split(`.`)[0], event.bind(null, this.client));
        
        var event = require(`${process.cwd()}/src/events/ready.js`)
        this.client.on(file.split(`.`)[0], event.bind(null, this.client));
/*
        const events = readdirSync(`${process.cwd()}/src/events/`).filter((f) => f.endsWith(`.js`));
        for(const file of events) {
            const event = require(`${process.cwd()}/src/events/interactionCreate.js`)
            this.client.on(file.split(`.`)[0], event.bind(null, this.client));
        }
*/
        return true;
    }

    
    /**
     * Deploys all SLASH COMMANDS of this BOT
     * @returns Boolean
     */
    deploySlash() {
        return this.client.on("ready", () => {
            // log something
            console.log(` ... Deploying ${this.client.allCommands.length} Slash-Commands`);
            // set the cmds
            this.client.application.commands.set(this.client.allCommands).then(console.log(` + Deployed ${this.client.allCommands.length} Slash-Commands`)).catch(console.error)
        });
    }


    /**
     * 
     * @param {String} token Token to login with
     * @param {Boolean} deploySlash To load Slash Commands or not
     * @returns Boolean
     */
    async init(token, deploySlash) {
        deploySlash ? this.deploySlash() : null;
        return await this.client.login(token), true;
    }

}
module.exports = DiscordBotClient;


