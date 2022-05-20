/**
 * 
 * node index.js host # Starts the Bot in the "host" Mode
 * node index.js deploy # Deploys the Commands for sure!
 * node index.js deploy host # starts the bot in the "host" Mode + deploys the Slash Commands
 */
const inquirer = require('inquirer'), fs = require("fs"), DiscordBotClient = require("./src/bot.js"), processOptions = process.argv.map(d => d.toLowerCase());
// start the first question
askBootup();
// ask Bootup thingy
function askBootup() {
    const configExist = fs.existsSync(`${process.cwd()}/config.json`);
    console.log(`${process.cwd()}/config.json`)
    // ask question
    const questions = !configExist ? [{
            type: "input", name: "token", message: "No Config File - What is your BOT-TOKEN? Please insert it!",
            validate: (value) => value.length < 50 ? "Please enter a valid Discord-Bot-TOKEN, which is longer then 50 characters!" : true
        }] : [{
            type: "list", name: "bootup", message: "What do you want to do?",
            choices: ["start", "start & deploy slashcmds", "cancel"]
        }];

    // to instant boot type: node index.js host, or: pm2 start . --name "z_monopoly" -- host
    if(configExist && processOptions.includes("host")) return console.log("Insta - Starting"), startBot();
    

    /**
     * Function which "starts" the bot
     */
    function startBot (answer = {}) {
        // set the global config file
        const { token } = JSON.parse(fs.readFileSync(`${process.cwd()}/config.json`, "utf-8")); 
        if(answer?.bootup == "cancel") return;
        // deploy slash
        const botClient = new DiscordBotClient();
        // initialize the bot
        return botClient.init(token, answer?.bootup == questions?.[0]?.choices?.[1] || processOptions.includes("deploy")).catch(console.error);
    }

    // show the prompt
    inquirer.prompt(questions).then((answer) => {
        if(answer.token) {
            try {
                // create the config.json file and ask again;
                return fs.writeFileSync(`${process.cwd()}/config.json`, JSON.stringify({ token: answer.token }, null, 3)), askBootup();
            } catch (e) {
                return console.error(e);
            }
        } else {
            return startBot(answer);
        }
    }).catch((e) => e.isTtyError ? console.error(`Prompt couldn't be rendered in the current environment`) : console.error(e));
}