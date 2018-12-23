const express	= require("express");
const app		= express();
const http		= require("http").Server(app);
const io		= require("socket.io")(http);
const uuid		= require("uuid/v1");
const nse		= require("./ns_events.js");
const bu		= require("./bmc_utils.js");
const gr		= require("./game_runner.js");

app.use(express.static("public"));
io.on("connection", function(socket){
	socket.on("newGame", function(){
		socket.emit("newGame", initGame());
	});
});

http.listen(8080, function(){
	console.log("listening to 8080");
});

function initGame()
{
	var id = uuid();
	var ns = io.of("/" + id);
	ns.bmc = {
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
			round: 0,
			turn: 0,
			blackCard: undefined,
			status: "setting",
			time: 0
		},
		decks: {

		},
		piles: {
			res: [],
			calls: []
		}
	}
	ns.on("connection", function(socket) {
		if (cantConnect(ns))
			bu.kick(socket, "There is not enough space remaining for you in this room.");
		if (u.isndef(socket.bmc)){
			socket.join("logging");
			socket.bmc = {
				info: {
					displayName: "Anon",
					color: "FFFFFF",
				},
				data: {
					order: 0,
					status: "waiting",
					role: "user",
					refInfo: {
						displayName: "anon",
						color: "FFFFFF"
					}
				},
				hand: []
			};
		} else {
			socket.leave("afk");
			console.log("reconnection: " + socket.id);
		}
		socket.on("disconnect", (r) => {
			console.log("deconnection: " + socket.id);
			socket.join("afk");
			if (/calling|choosing/.test(socket.bmc.data.status))
				gr.fx.next(ns);
		});
		var data = JSON.parse(socket.handshake.query.data);
		bu.logIn(socket, {info: data, spec: data.spectator});
		Object.keys(nse).forEach(function(o){
			socket.on(o, function(data){
				nse[o](socket, data);
			});
		});
		Object.keys(gr).forEach(function(o){
			if (o == "fx")
				return ;
			socket.on(o, function(data){
				gr[o](socket, data);
			});
		});
	});
	return id;
}

function cantConnect(nsp)
{
	var maxUsers = nsp.bmc.settings.maxPlayers + nsp.bmc.settings.maxSpectators;
	if (Object.keys(nsp.connected).length > maxUsers)
		return (true);
	return (false);
}
