const client = new WebSocket("ws://" + document.domain + ":81");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let id;
const players = [];

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
});

function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#151515";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "red";
    for (i in players) {
        const player = players[i];
        ctx.fillRect(player.position.x, player.position.y, 10, 10);
    }
}
