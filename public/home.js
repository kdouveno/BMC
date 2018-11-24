const socket = io("/");
console.log(io);
socket.on("newGame", initGame);
game = {};
function initGame(id) {
	gameSocket = io("/" + id, {forceNew: true});
	var timeout = true;
	gameSocket.on("connect", function(){
		timeout = false;
		console.log("Connected to " + id + ".");
		game = {
			settings: {
				
			},
			data: {
				status: "",
			},
			users: {
				0: {
					info: {
						displayName: "anon",
						color: "FFFFFF",
					},
					data: {
						order: 0,
						status: "",
						onfocus: false,
						writing: false,
						spectator: false,
						role: "",
						refInfo: {
							displayName: "anon",
							color: "FFFFFF"
						}
					}
				}
			}
		}
		Object.keys(ge).forEach(function(o) {
			gameSocket.on(o, function(data) {
				ge[o](data);
			});
		});
	});
	setTimeout(function(){
		if (timeout)
			console.log("connection to game room failed");
	}, 5000);
}

function newGame() {
	socket.emit("newGame");
}

function joinGame(id){
	initGame(id);
}

function playerUpdate() {
	gameSocket.emit("playerUpdate", game.users[0].info);
}

function logIn(spec) {
	gameSocket.emit("logIn", {info: game.users[0].info, spec: spec});
}

function sendMessage(msg) {
	gameSocket.emit("sendMessage", msg);
}
