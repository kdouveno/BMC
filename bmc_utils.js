const u	= require("./public/scripts/utils.js");

bu = {
	kick: function(s, msg){
		s.emit("kickedOut", {id: s.nsp.name, msg: msg}).disconnect();
	},
	playerUpdate: function(s, info) {
		if (!u.isndef(info))
			s.bmc.info = info;
		out = {info: s.bmc.info, data: s.bmc.data};
		s.emit("playerUpdate", {user: out, id: 0});
		s.broadcast.in("logged").emit("playerUpdate", {user: out, id: s.id});
	},
	logged: function(s) {
		return (s.nsp.in("logged"));
	},
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
		if (!i) {
			s.bmc.data.role = "owner";
			s.bmc.data.status = "setting";
			s.emit("alert", "You're the only one in there, you were made this room's owner.");
		}
		this.playerUpdate(s);
		s.emit("updateSettings", s.nsp.bmc.settings);
		s.emit("updateDecks", bu.clientDeck(s.nsp.bmc.decks));

		s.leave("logging");
		s.join("logged");
	},
	clientDeck: function(decks) {
		var out = {};
		Object.keys(decks).forEach((id) => {
			out[id] = decks[id].count;
		});
		return out;
	}
}

module.exports = bu;

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
		bu.kick(s, "There is not enough space remaining for you in this room.");
		return true;
	}
	return false;
}
