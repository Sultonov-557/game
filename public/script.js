const client = new WebSocket("ws://" + document.domain + ":81");

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

const me = {};
const players = [];

setInterval(frame, 10);

client.

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
