const express = require("express");
const Server = require("ws").WebSocketServer;

const app = express();
const server = new Server({ port: 81 });

app.listen(80);
app.use(express.static(__dirname + "/public"));

const players = [];

server.on("connection", (socket) => {
    console.log("connected");
    socket.send({ name: "start", params: { id: players.length } });
    players.push(new Player(players.length, new Position(50, 50)));
    for (i in players) {
        socket.send({ name: "position", params: players[i].position });
    }
    socket.on("message", (data) => {
        data = JSON.parse(data);
    });
});

class Player {
    constructor(id, position) {
        this.id = id;
        this.position = position;
    }
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
