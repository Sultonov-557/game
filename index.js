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
	players[id] = new Player(id, new Position(Math.floor(Math.random() * 180), Math.floor(Math.random() * 80)));
	let bombs = 0;

	for (i in players) {
		if (players[i].bomb) {
			if (bombs == 0) {
				bombs++;
			} else {
				players[i].bomb = false;
			}
		}
	}
	if (bombs == 0) {
		players[id].bomb = true;
	}

	for (i in players) {
		let packet = {
			name: "bomb",
			params: { bomb: players[i].bomb, id: players[i].id },
		};
		broadcast(packet);
	}
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
			players[data.params.id].position = data.params.position;
			let packet = {
				name: "position",
				params: { position: data.params.position, id: data.params.id },
			};
			broadcast(packet);
		}
		if (data.name == "bomb") {
			players[data.id].bomb = data.bomb;
			broadcast({ name: "bomb", params: { bomb: data.params.bomb, id: data.params.id } });
		}
	});
	socket.on("close", () => {
		delete players[id];
		broadcast({ name: "remove", params: { id } });
		console.log("disconnected " + id);
	});

	setInterval(() => {
		for (i in players) {
			let packet = {
				name: "bomb",
				params: { bomb: players[i].bomb, id: i },
			};
			broadcast(packet);
		}
	}, 100);

	function broadcast(message) {
		server.clients.forEach((client) => {
			client.send(JSON.stringify(message));
		});
	}
});
let lastBomb;
let lastBombTimer;
let bombTimer = 1200;
function tick() {
	let bomber;
	for (i in players) {
		if (players[i].bomb) {
			bomber = players[i];
			bomber.id = i;
			if (bombTimer == 0) {
				console.log("game over");
				server.clients.forEach((socket) => {
					socket.send(JSON.stringify({ name: "gameover", params: { loser: bomber.id } }));
					socket.close();
				});
				process.exit(1);
			}
		}
	}
	for (i in players) {
		if (i != lastBomb) {
			const playerPos = { x: players[i].position.x * 10 + 40, y: players[i].position.y * 10 + 40 };
			const bombPos = { x: bomber.position.x * 10 + 40, y: bomber.position.y * 10 + 40 };
			const dis = Math.floor(Math.sqrt(Math.sqrt((playerPos.x - bombPos.x) * (playerPos.x - bombPos.x) + (playerPos.y - bombPos.y) * (playerPos.y - bombPos.y))));
			if (dis == 0) continue;
			if (dis < 10) {
				lastBomb = bomber.id;
				lastBombTimer = 30;
				bombTimer = 1200;
				players[bomber.id].bomb = false;
				players[i].bomb = true;
			}
		} else {
			lastBombTimer--;
			if (lastBombTimer == 0) {
				lastBomb = undefined;
			}
		}
	}
	bombTimer--;
	server.clients.forEach((socket) => {
		socket.send(JSON.stringify({ name: "timer", params: { timer: bombTimer } }));
	});
}
setInterval(tick, 100);

class Player {
	constructor(id, position) {
		this.id = id;
		this.position = position;
		this.bomb = false;
	}
}

class Position {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
}
