const client = new WebSocket("ws://" + document.domain + ":81");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let id;
const players = {};

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
	if (data.name == "remove") {
		delete players[data.params.id];
		console.log("removed " + data.params.id);
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
	client.send(
		JSON.stringify({ name: "position", params: { id, position: players[id].position } })
	);
}, 10);

function frame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#151515";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	for (i in players) {
		const player = players[i];
		ctx.fillStyle = "red";
		ctx.fillRect(player.position.x * 10, player.position.y * 10, 80, 80);
		ctx.fillStyle = "blue";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.font = "60px arial";
		ctx.fillText(i, player.position.x * 10 + 40, player.position.y * 10 + 40);
	}
}
