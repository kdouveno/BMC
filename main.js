const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v1");
const nse = require("./ns_events.js");

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
			maxSpectator: 10,
			nbrRound: 5,
			locked: true,
			canSurrender: false,
			AFKTime: 60000,
			AFKkick: false,
			gameMode: "1by1",
		},
		data: {
			round: 0,
			turn: 0,
			blackCard: undefined,
			status: "setting"
		},
		decks: {

		}
	}
	ns.on("connection", function(socket){
		if (cantConnect(ns))
			socket.disconnect(false);
		socket.bmc = {
			info: {
				displayName: "Anon",
				color: "FFFFFF",
			},
			data: {
				order: 0,
				status: "",
				onfocus: false,
				writing: false,
				spectator: false,
				role: "user",
				refInfo: {
					displayName: "anon",
					color: "FFFFFF"
				}
			},
		};
		Object.keys(nse).forEach(function(o){
			socket.on(o, function(data){
				nse[o](socket, data);
			});
		});
	});
	return id;
}

function cantConnect(nsp)
{
	var maxPlayer = nsp.bmc.settings.maxPlayers + nsp.bmc.settings.maxSpectator;
	if (Object.keys(nsp.connected).length > maxPlayer)
		return true;
	if (nsp.bmc.settings.locked && nsp.bmc.data.status == "ingame" && nsp.bmc.settings.maxSpectator)
}
