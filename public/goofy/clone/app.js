import { renderEntity } from "./modules/render.js";
import { print } from "./modules/util.js";

let socket;
let gameState = {
  entities: [
    {
      x: 40,
      y: 40,
      body: {
        color: "_blue",
      },
      guns: [
        {
          position: {
            x: 0,
            y: 0,
            length: 0.9,
            width: 0.45,
          },
          attributes: {
            result: "bullet",
          },
        },
      ],
      turrets: [
        {
          position: {
            x: 1,
            y: 0,
            size: 0.5,
            rotation: 0,
          },
          attributes: {},
          turret: {
            body: {
              color: "_gunColor",
            },
            guns: [
              {
                position: {
                  x: 0,
                  y: 0,
                  length: 0.9,
                  width: 0.45,
                },
                attributes: {
                  result: "bullet",
                },
              },
            ],
          },
        },
      ],
    },
  ],
};

function connectToServer() {
  socket = new WebSocket("wss://tank-dev.glitch.me:8080");

  print("Attempting to connect to the server...");
  document.getElementById("connection-status").innerHTML =
    "<i>Connecting...</i>";
  document.getElementById("connection-status").classList.add("connecting");
  document.getElementById("connection-status").classList.remove("none");

  socket.onopen = () => {
    print("Connected to server");
    document.getElementById("connection-status").innerText = "Connected";
    document.getElementById("connection-status").classList.add("connected");
    document
      .getElementById("connection-status")
      .classList.remove("disconnected");
    document.getElementById("connection-status").classList.remove("none");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "gameState":
        gameState = data.state;
        break;
    }
  };

  socket.onclose = () => {
    print("Disconnected from server");
    document.getElementById("connection-status").innerText =
      "Disconnected (Unknown network error.)";
    document.getElementById("connection-status").classList.add("disconnected");
    document.getElementById("connection-status").classList.remove("connected");
    document.getElementById("connection-status").classList.remove("none");
  };
}

document
  .getElementById("connect-button")
  .addEventListener("click", connectToServer);

function gameLoop() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  gameState.entities.forEach((entity) => {
    renderEntity(entity, entity.x, entity.y);
  });

  requestAnimationFrame(gameLoop);
}

gameLoop();

export function sendInput(input) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "input", data: input }));
  }
}
