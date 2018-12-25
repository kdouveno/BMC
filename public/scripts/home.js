const socket = io("/");

userPrefs = {
	displayName: "Anon",
	color: "",
}

$(document).ready(function() {
	login.login();
	socket.on("newGame", initGame);
});

function enter(){
	userPrefs.displayName = $("#refDisplayName").attr("value");
	userPrefs.color = $("#refColor").attr("value");
	if ($(".enter").hasClass("join"))
		initGame($("#tokenInput").attr("value"));
	else
		newGame();
}

function getToken(){
	return window.location.href.split("?")[1];
}

function initGame(id) {
	socket.emit("joinNsp", id, (res)=>{
		if (!res)
			return console.log("there's no Room with this token id...");
		gameSocket = io("/" + id, {forceNew: true, query: {data: JSON.stringify(userPrefs)}});
		var timeout = true;
		gameSocket.on("connect", function(){
			timeout = false;
			console.log('joinGame("'+id+'")');
			//afficher l'interface de login display name et colo, spectator
			game = {
				settings: {
					maxPlayers: 10,
					maxSpectators: 10,
					nbrRound: 5,
					locked: true,
					canSurrender: false,
					AFKTime: 60000,
					AFKkick: false,
					gameMode: "1by1",
					handLength: 7
				},
				data: {
					status: "setting",
				},
				users: {
					0: {
						info: {
							displayName: "anon",
							color: "FFFFFF",
						},
						data: {
							order: 0,
							status: "waiting",
							onfocus: false,
							writing: false,
							spectator: false,
							role: "user",
							refInfo: {
								displayName: "anon",
								color: "FFFFFF"
							}
						}
					}
				},
				decks: {
				}
			}
			me = game.users[0];
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
	});
}

function newGame() {
	socket.emit("newGame");
}

function joinGame(id) {
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

function updateSettings() {
	gameSocket.emit("updateSettings", game.settings);
}

function updateDecks() {
	gameSocket.emit("updateDecks", game.decks);
}

function startGame() {
	gameSocket.emit("startGame");
}
