const u			= require("./public/utils.js");
const request	= require("request");
const bu 		= require("./bmc_utils.js");
const ig		= require("./ingame.js");
const gr		= require("./game_runner.js");

module.exports = {
	playerUpdate: bu.playerUpdate,
	sendMessage: function(s, data) {
		console.log(data);
		s.broadcast.emit("alert", data);
	},
	updateSettings: function(s, data) {
		if (!cantContinue(s, "change game settings"))
			s.nsp.bmc.settings = data;
		bu.logged(s).emit("updateSettings", s.nsp.bmc.settings);
	},
	printSocket: function(s) {
		console.log(s);
		console.log("\n\n\n");
		console.log(s.nsp.bmc.decks);
	},
	updateDecks: function(s, decks) {
		if (cantContinue(s, "change decks")) {
			bu.logged(s).emit("updateDecks", bu.clientDeck(s.nsp.bmc.decks));
			return ;
		}
		Object.keys(decks).forEach(o => {
			loadDeck(s.nsp, o, decks[o]);
		});
	},
	startGame: function(s) {
		if (cantContinue(s, "start game"))
			return ;
		ig.buildPiles(s.nsp.bmc);
		ig.washHands(s.nsp);
		ig.setOrder(s.nsp);
		setImmediate(gr.fx.play, s.nsp);
	}
};




function cantContinue(s, modif) {
	if (s.bmc.data.role !== "owner" && s.bmc.data.role !== "modo"){
		s.emit("alert", "You are not allowed to "+ modif +". You must be owner or moderator of this room.");
		return 1;
	}
	if (s.nsp.bmc.data.status !== "setting" && s.nsp.bmc.settings.locked) {
		s.emit("alert", "You can't "+ modif +" of a locked game.");
		return 1;
	}
	return 0;
}

function loadDeck(ns, code, count) {
	if (!u.isndef(ns.bmc.decks[code])) {
		ns.bmc.decks[code].count = count;
		ns.to("logged").emit("updateDecks", bu.clientDeck(ns.bmc.decks));
		return ;
	}
	request("https://api.cardcastgame.com/v1/decks/" + code, function (err, response, body) {
		if (err)
			return ;
		var out;
		out = JSON.parse(body);
		if (out.id == "not_found") {
			ns.to("logged").emit("updateDecks", bu.clientDeck(ns.bmc.decks));
			return ;
		}
		ns.bmc.decks[code] = {
			count: count,
			name: out.name,
			description: out.description,
			author: out.author,
			call_count: out.call_count,
			response_count: out.response_count
		};
		ns.to("logged").emit("updateDecks", bu.clientDeck(ns.bmc.decks));
		request("https://api.cardcastgame.com/v1/decks/" + code + "/calls", function (err, response, body) {
			if (err)
				return ;
			ns.bmc.decks[code].calls = JSON.parse(body);
			request("https://api.cardcastgame.com/v1/decks/" + code + "/responses", function (err, response, body) {
				if (err)
					return ;
				ns.bmc.decks[code].res = JSON.parse(body);
			});
		});
	});
}
