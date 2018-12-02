const u			= require("./public/utils.js");
const request	= require("request");
const dunno 	= require("./dunno_yet.js");
const ig		= require("./ingame.js");

module.exports = {
	logIn: function(s, data) {
		if (!u.isndef(s.rooms.logged) || assignRole(s, data))
			return ;
		s.bmc.data.refInfo = {
			displayName: data.info.displayName,
			color: data.info.color};
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
		s.leave("logging");
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
		console.log(data);
		s.broadcast.emit("alert", data);
	},
	updateSettings: function(s, data) {
		if (!cantContinue(s, "change game settings"))
			s.nsp.bmc.settings = data;
		logged(s).emit("updateSettings", s.nsp.bmc.settings);
	},
	printSocket: function(s) {
		console.log(s);
		console.log("\n\n\n");
		console.log(s.nsp.bmc.decks);
	},
	updateDecks: function(s, decks) {
		if (cantContinue(s, "change decks")) {
			logged(s).emit("updateDecks", clientDeck(s.nsp.bmc.decks));
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
		ig.giveCards(s.nsp);
		ig.setOrder(s.nsp);
		s.nsp.in("logged")
	}
};

function clientDeck(decks) {
	var out = {};
	Object.keys(decks).forEach((id) => {
		out[id] = decks[id].count;
	});
	console.log(out);
	return out;
}

function logged(s) {
	return (s.nsp.in("logged"));
}

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
		return ;
	}
	request("https://api.cardcastgame.com/v1/decks/" + code, function (err, response, body) {
		if (err)
			return ;
		var out;
		out = JSON.parse(body);
		if (out.id == "not_found") {
			ns.to("logged").emit("updateDecks", clientDeck(ns.bmc.decks));
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
		ns.to("logged").emit("updateDecks", clientDeck(ns.bmc.decks));
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

function assignRole(s, data) {
	var nbrPl = u.isndef(s.nsp.adapter.rooms.players) ? 0 : s.nsp.adapter.rooms.players.length;
	var nbrSp = u.isndef(s.nsp.adapter.rooms.spectators) ? 0 : s.nsp.adapter.rooms.spectators.length;

	if (!data.spec && !(s.nsp.bmc.settings.locked && s.nsp.bmc.data.status == "ingame") && nbrPl < s.nsp.bmc.settings.maxPlayers) {
		s.emit("alert", "You are a player.");
		s.join("players");
	}
	else if (nbrSp < s.nsp.bmc.settings.maxSpectators) {
		s.emit("alert", "You are a spactator.");
		s.join("spectators");
	}
	else {
		dunno.kick(s, "There is not enough space remaining for you in this room.");
		return true;
	}
	return false;
}
