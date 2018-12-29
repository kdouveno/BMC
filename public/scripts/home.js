const socket = io("/");

userPrefs = {
	displayName: "Anon",
	color: "",
}
alertTimer = undefined;

$(document).ready(function() {
	login.login();
	KDformInit();
	socket.on("newGame", initGame);
});

function enter(){
	userPrefs = KDform.objForm("#login");
	if ($("#enter").hasClass("join"))
		initGame(userPrefs.token);
	else
		newGame();
}

function getToken(){
	return window.location.href.split("?")[1];
}

function initGame(id) {
	socket.emit("joinNsp", id, (res)=>{
		if (!res)
			return alert("there's no Room with this token id...");
		gameSocket = io("/" + id, {forceNew: true, query: {data: JSON.stringify(userPrefs)}});
		gameSocket.on("connect", function(){
			window.history.pushState("", "", "?" + id);
			console.log('joinGame("'+id+'")');
			ui.displayGameUI();
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
	game.settings = KDform.objForm("#gameSettings");
	console.log(game.settings);
	gameSocket.emit("updateSettings", game.settings);
}

function updateDecks() {
	gameSocket.emit("updateDecks", game.decks);
}

function startGame() {
	gameSocket.emit("startGame");
}
function alert(msg) {
	console.log(msg);
	$("#alertContainer h2").text(msg);
	$("#alertContainer").addClass("shown");

	if (!u.isndef(alertTimer))
		clearTimeout(alertTimer);
	alertTimer = setTimeout(() => {
		$("#alertContainer").removeClass("shown");
	}, 4000);
}
