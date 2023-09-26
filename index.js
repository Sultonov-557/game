const express = require("express");
const Server = require("ws").WebSocketServer;

const app = express();
const server = new Server({ port: 81 });

app.listen(80);
app.use(express.static(__dirname + "/public"));

const players = {};

server.on("connection", (socket) => {
	let id;
	randomID();
	function randomID() {
		id = Math.floor(Math.random() * 100);
		if (players[id]) {
			randomID();
		}
	}
	let startPacket = { name: "start", params: { id } };
	console.log("connected " + id);
	socket.send(JSON.stringify(startPacket));
	players[id] = new Player(id, new Position(50, 50));
	for (i in players) {
		let packet = {
			name: "position",
			params: { position: players[i].position, id: players[i].id },
		};
		socket.send(JSON.stringify(packet));
	}
	socket.on("message", (data) => {
		data = JSON.parse(data);
		if (data.name == "position") {
			let packet = {
				name: "position",
				params: { position: data.params.position, id: data.params.id },
			};
			broadcast(packet);
		}
	});
	socket.on("close", () => {
		delete players[id];
		broadcast({ name: "remove", params: { id } });
		console.log("disconnected " + id);
	});

	function broadcast(message) {
		server.clients.forEach((client) => {
			client.send(JSON.stringify(message));
		});
	}
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
