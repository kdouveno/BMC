const u = require("./public/utils.js");
const request = require("request");

module.exports = {
	logIn: function(s, data) {
		if (!u.isndef(s.rooms.logged))
			return ;
		s.bmc.data.refInfo = {
			displayName: data.info.displayName,
			color: data.info.color};
		s.bmc.data.spectator = data.spec;
		data.spec ? s.join("spectators") : s.join("players");
		s.bmc.info = {
			displayName: data.info.displayName,
			color: data.info.color};
		var i = 0;
		Object.keys(s.nsp.connected).forEach(o => {
			if (s.nsp.connected[o] == s || u.isndef(s.nsp.connected[o].rooms.logged))
				return ;
			s.emit("loadUser", {user: s.nsp.connected[o].bmc, id: o})
			i++;
		});

		s.broadcast.in("logged").emit("loadUser", {user: s.bmc, id: s.id});
		s.emit("updateSettings", s.nsp.bmc.settings);
		var out = Object.assign({}, s.nsp.bmc.decks);
		Object.keys(s.nsp.bmc.decks).forEach(o => {
			out[o] = s.nsp.bmc.decks[o].used;
		});
		s.emit("updateDecks", out);
		if (!i) {
			s.bmc.data.role = "owner";
			this.playerUpdate(s);
			s.emit("alert", "You're the only one in there, you were made this room's owner.");
		}
		s.join("logged");
	},
	playerUpdate: function(s, info) {
		if (!u.isndef(info))
			s.bmc.info = info;
		out = {info: s.bmc.info, data: s.bmc.data};
		s.emit("playerUpdate", {user: out, id: 0});
		s.broadcast.in("logged").emit("playerUpdate", {user: out, id: s.id});
	},
	sendMessage: function(s, data) {
		console.log("data:");
		console.log(data);
		s.broadcast.emit("alert", data);
	},
	updateSettings: function(s, data) {
		if (cantContinue(s, "change game settings"))
			return ;
		s.nsp.bmc.settings = data;
		s.broadcast.emit("updateSettings", s.nsp.bmc.settings);
	},
	printSocket: function(s) {
		console.log(s);
		console.log("\n\n\n");
		console.log(s.nsp.bmc.decks);
	},
	updateDecks: function(s, decks) {
		if (cantContinue(s, "change decks"))
			return ;
		var d = s.nsp.bmc.decks;
		Object.keys(decks).forEach(o => {
			loadDeck(s.nsp, o, decks[o]);
		});
		s.broadcast.emit("updateDecks", decks);
	},
	startGame: function(s) {
		s.nsp.bmc.data.status = "ingame";
		out = []
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

function loadDeck(ns, code, used) {
	if (!u.isndef(ns.bmc.decks[code])) {
		ns.bmc.decks[code].used = used;
		return ;
	}
	request("https://api.cardcastgame.com/v1/decks/" + code, function (err, response, body) {
		if (err)
			return ;
		var out;
		out = JSON.parse(body);
		if (out.id == "not_found")
			return ;
		ns.bmc.decks[code] = {
			used: used,
			name: out.name,
			description: out.description,
			author: out.author,
			call_count: out.call_count,
			response_count: out.response_count
		};
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
