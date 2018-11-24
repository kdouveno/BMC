const u = require("./public/utils.js");

module.exports = {
	logIn: function(s, data) {
		if (s.bmc.serverData.logged)
			return ;
		s.bmc.data.refInfo = {
			displayName: data.info.displayName,
			color: data.info.color};
		s.bmc.data.spectator = data.spec;
		s.bmc.info = {
			displayName: data.info.displayName,
			color: data.info.color};
		var i = 0;
		Object.keys(s.nsp.connected).forEach((o) => {
			if (s.nsp.connected[o] == s)
				return ;
			var out = Object.assign({}, s.nsp.connected[o].bmc);
			out.serverData = undefined;
			s.emit("loadUser", {user: out, id: o})
			i++;
		});
		if (!i) {
			s.bmc.data.role = "owner";
			this.playerUpdate(s);
			s.emit("receiveMessage", "You're the only one in there, you were made this room's owner.");
		}
		var out = Object.assign({}, s.bmc);
		out.serverData = undefined;
		s.broadcast.emit("loadUser", {user: out, id: s.id});
		s.bmc.serverData.logged = true;
	},
	playerUpdate: function(s, info) {
		if (!u.isndef(info))
			s.bmc.info = info;
		out = {info: s.bmc.info, data: s.bmc.data};
		s.emit("playerUpdate", {user: out, id: 0});
		s.broadcast.emit("playerUpdate", {info: info, id: s.id});
	},
	sendMessage: function(s, data) {
		console.log("data:");
		console.log(data);
		s.broadcast.emit("receiveMessage", data);
	}
};
