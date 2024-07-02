module.exports = [
  {
    key: process.env.MLG,
    discordID: "imnotgivingyouthisinformationlol",
    nameColor: "#00ff00",
    class: "developer",
    infiniteLevelUp: true,
    name: "MLG",
    note: "That one unofficial community manager from the sandbox server #wpd. Also a co-developer of tank-dev.glitch.me.",
  },
  {
    key: process.env.FLOWEY,
    discordID: "hmmm",
    nameColor: "#1da6ac",
    class: "developer",
    infiniteLevelUp: true,
    name: "Flowey",
    note: "F",
  },
  {
    key: process.env.TESTING,
    discordID: undefined,
    nameColor: (() => {
      // Select random color
      let hex = Math.floor(Math.random() * 16777216).toString(16) + "";
      while (hex.length < 6) {
        // Make it 6 digit
        hex = "0" + hex;
      }
      // Return it
      return "#" + hex;
    })(),
    class: "developer",
    infiniteLevelUp: true,
    name: "testing",
    note: undefined,
  },
  {
    key: process.env.event,
    discordID: "0",
    nameColor: "#ffffff",
    class: "developer",
    infiniteLevelUp: true,
    name: "unnamed#0000",
    note: "note here",
  },
];
