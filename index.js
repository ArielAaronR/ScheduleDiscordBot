const fs = require("fs");
const Discord = require("discord.js");

const { prefix, token } = require("./config.json");

const client = new Discord.Client();

const Status = require("./models/status");

client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.info(`Logged in as ${client.user.tag}!`);
  
});

client.on("message", msg => {
  /*
  Splicing the commands with the prefix
   */
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).split(/ +/);

  const commandName = args.shift().toLowerCase();

  //Dynamically execute commands
  if (!client.commands.has(commandName)) return;
  const command = client.commands.get(commandName);
  if (command.args && !args.length) {
    return msg.channel.send(`You didn't have any argument, ${msg.author}`);
  }
  try {
    command.execute(msg, args);
  } catch (error) {
    console.error(error);
    msg.reply("there was an error trying to execute that command!");
  }
});

client.login(token);
