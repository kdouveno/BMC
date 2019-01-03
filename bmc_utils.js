const u	= require("./public/scripts/utils.js");

bu = {
	kick: function(s, msg){
		s.emit("kickedOut", {id: s.nsp.name, msg: msg}).disconnect();
	},
	playerUpdate: function(s, info) {
		if (!u.isndef(info))
			s.bmc.info = info;
		var out = {info: s.bmc.info, data: s.bmc.data};
		s.broadcast.in("logged").emit("playerUpdate", {user: out, id: s.id});
		out.hand = s.bmc.hand;
		s.emit("playerUpdate", {user: out, id: 0});
	},
	logged: function(s) {
		return (s.nsp.in("logged"));
	},
	logIn: function(s, data) {
		if (!u.isndef(s.rooms.logged) || assignRole(s, data))
			return ;
		s.leave("logging");
		s.join("logged");
		s.bmc.data.refInfo = {
			displayName: data.info.displayName,
			color: data.info.color};
		s.bmc.info = Object.assign({}, s.bmc.data.refInfo);
		var tab = s.nsp.connected;
		for (o in tab) {
			var out = {info: tab[o].bmc.info, data: tab[o].bmc.data};
			if (tab[o] == s){
				if (Object.keys(tab).length == 1){
					s.bmc.data.role = "owner";
					s.bmc.data.status = "setting";
					s.emit("alert", "You're the only one in there, you were made this room's owner.");
				}
				s.broadcast.emit("loadUser", {user: out, id: o});
				s.emit("loadUser", {user: out, id: 0})
			} else if (u.isndef(tab[o].rooms.logged))
				return ;
			else
				s.emit("loadUser", {user: out, id: o})
		}
		s.emit("updateSettings", s.nsp.bmc.settings);
		s.emit("updateDecks", bu.clientDeck(s.nsp.bmc.decks));
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
		s.bmc.data.spec = true;
	}
	else {
		bu.kick(s, "There is not enough space remaining for you in this room.");
		return true;
	}
	return false;
}
