const client = new WebSocket("ws://" + document.domain + ":81");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let id;
const players = {};

let gameover = false;
let loser;
let timer = 0;
const timerElm = document.querySelector("span");

setInterval(frame, 10);

client.addEventListener("message", (data) => {
	data = JSON.parse(data.data);
	if (data.name == "start") {
		id = data.params.id;
	}
	if (data.name == "position") {
		if (!players[data.params.id]) players[data.params.id] = {};
		players[data.params.id].position = data.params.position;
	}
	if (data.name == "bomb") {
		if (!players[data.params.id]) players[data.params.id] = {};
		players[data.params.id].bomb = data.params.bomb;
	}
	if (data.name == "remove") {
		delete players[data.params.id];
		console.log("removed " + data.params.id);
	}
	if (data.name == "timer") {
		timer = data.params.timer;
	}
	if (data.name == "gameover") {
		gameover = true;
		loser = data.params.loser;
		if (id == loser) {
			alert("you lose");
		} else {
			alert("you won");
		}
		document.querySelector("canvas").style.display = "none";
	}
});

document.addEventListener("keypress", (ev) => {
	if (ev.key == "w") {
		players[id].position.y -= 1;
	}
	if (ev.key == "s") {
		players[id].position.y += 1;
	}
	if (ev.key == "a") {
		players[id].position.x -= 1;
	}
	if (ev.key == "d") {
		players[id].position.x += 1;
	}
});

setInterval(() => {
	if (!gameover) {
		client.send(JSON.stringify({ name: "position", params: { id, position: players[id].position } }));
	}
}, 10);

function frame() {
	timerElm.innerText = parseInt(timer / 10);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#151515";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (i in players) {
		const player = players[i];
		if (player.bomb) {
			ctx.fillStyle = "red";
		} else {
			ctx.fillStyle = "blue";
		}
		ctx.fillRect(player.position.x * 10, player.position.y * 10, 80, 80);
	}
}
