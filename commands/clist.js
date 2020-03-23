module.exports = {
  name: "clist",
  description: "A list of available commands",

  execute(message) {
    message.channel.send(
      "Hi here is a list of the available commands! \`\`\` $reg : register yourself to the database \n $clockin : clock in \n $clockout : clock out \n $status : update your current status \`\`\`"
    );
  }
};
