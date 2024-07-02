const WebSocket = require("ws");
const http = require("http");

let defs = require("./definitions.json");
let config = { cycleSpeed: 100 }; // import

console.log("[goofy/clone] Initializing the server...");

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

let entities = [];

const cleanEntities = () => {
  entities = entities.filter((e) => {
    return !e.isDead;
  });
};

class Entity {
  constructor(pos) {
    this.x = pos.x;
    this.y = pos.y;
    this.velocity = new Vector(0, 0);

    this.bind = {
      is: () => {
        return this.entity === null;
      },
      entity: null,
      offset: {
        x: 0,
        y: 0,
      },
    };

    this.isDead = false;

    this.load("genericEntity");
    entities.push(this);
    return this;
  }
  load(set) {
    let obj = defs[set];
    for (let key in obj) {
      this[key] = obj[key];
    }
  }
  physics() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
  }
}

// Socket stuff
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Our clients
const clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    const data = JSON.parse(message);
    if (data.type === "input") {
      // Handle player input
      // Update game state based on input
    }
  });

  ws.on("close", () => {
    clients.delete(ws);
  });
});

const gameloop = (() => {
  let entitiesCycle = (e) => {
    if (e.bind.is()) {
      // Follow parents
      // Bind the entity to my master
      e.x = e.bind.offset.x + e.bind.entity.x;
      e.y = e.bind.offset.y + e.bind.entity.y;
    } else {
      // Think for myself
      // Follow the laws of physics
      e.physics();
    }
  };

  return () => {
    cleanEntities();
    entities.forEach(entitiesCycle);

    // Broadcast game state to all connected clients
    const gameState = {
      entities: entities.map((e) => ({
        x: e.x,
        y: e.y,
        body: e.body,
        guns: e.guns,
        turrets: e.turrets,
      })),
    };

    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "gameState", state: gameState }));
      }
    });
  };
})();

setInterval(gameloop, config.cycleSpeed);

server.listen(8080, () => {
  console.log("Server is running on https://tank-dev.glitch.me:8080");
});
