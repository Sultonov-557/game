const express = require("express");
const Server = require("ws").WebSocketServer;

const app = express();
const server = new Server({ port: 81 });

app.listen(80);
app.use(express.static(__dirname + "/public"));

const players = [];

server.on("connection", (socket) => {
    console.log("connected");
    let packet = { name: "start", params: { id: players.length } };
    socket.send(JSON.stringify(packet));
    players.push(new Player(players.length, new Position(50, 50)));
    for (i in players) {
        let packet = { name: "position", params: { position: players[i].position, id: players[i].id } };
        socket.send(JSON.stringify(packet));
    }
    socket.on("message", (data) => {
        data = JSON.parse(data);
        console.log(data);
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
