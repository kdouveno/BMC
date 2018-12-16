const ig	= require("./ingame.js");
const bu	= require("./bmc_utils.js");
const u		= require("./public/utils.js");

module.exports = {
	fx: {
		play: function(nsp) {
			if (nsp.bmc.data.round >= nsp.bmc.settings.nbrRound)
				return this.conclude(nsp);
			ig.fillHands(nsp);
			ig.draw(nsp, true);
			Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
				if (id == nsp.bmc.data.queue[nsp.bmc.data.selector])
					nsp.sockets[id].bmc.data.status = "calling";
				else nsp.sockets[id].bmc.data.status = "playing";
				nsp.sockets[id].emit("updateHand", nsp.sockets[id].bmc.hand);
				bu.playerUpdate(nsp.sockets[id]);
			});
			nsp.bmc.data.status = "respond";
			nsp.emit("gameStatus", {settings: nsp.bmc.settings, data: nsp.bmc.data, decks: bu.clientDeck(nsp.bmc.decks)});
			if (nsp.bmc.settings.afkTime)
			{
				nsp.to("players").emit("timerDate", Date.now() + nsp.bmc.settings.afkTime);
				nsp.bmc.timeout = setTimeout(this.resAfkTime, nsp.bmc.settings.afkTime, nsp);
			}
		},
		choose: function(nsp) {
			nsp.emit("playedWhites", whiteTabs(nsp));
			Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
				if (id == nsp.bmc.data.queue[nsp.bmc.data.selector])
					nsp.sockets[id].bmc.data.status = "choosing";
				else nsp.sockets[id].bmc.data.status = "waiting";
				bu.playerUpdate(nsp.sockets[id]);
			});
			nsp.bmc.data.status = "choosing";
			nsp.emit("gameStatus", {settings: nsp.bmc.settings, data: nsp.bmc.data, decks: bu.clientDeck(nsp.bmc.decks)});
		},
		win: function(nsp, id) {
			nsp.sockets[id].bmc.data.points++;
			nsp.sockets[id].emit("win", 0);
			nsp.sockets[id].broadcast.emit("win", id);
			bu.playerUpdate(nsp.sockets[id]);
			this.next(nsp);
		},
		next: function(nsp) {
			nsp.bmc.data.selector++;
			if (nsp.bmc.data.selector >= nsp.bmc.data.queue.length)
			{
				nsp.bmc.data.selector = 0;
				nsp.bmc.data.round++;
			}
			this.play(nsp);
		},
		conclude: function(nsp) {
			var sockets = Object.keys(nsp.adapter.rooms.players.sockets).map(id => {
				return (nsp.sockets[id]);
			});
			var highest = sockets.reduce((t, o) => {
				return (t < o.bmc.data.points ? o.bmc.data.points : t);
			}, 0);
			var out = sockets.filter(o => {
				return (o.bmc.data.points == highest)
			}).map(o => {
				return (o.id);
			});
			nsp.emit("gameWin", out);
		},
		resAfkTime: function(nsp){
			console.log("timeOut");
			this.choose(nsp);
		}
	},
	playWhite: function(s, ids) {
		if (s.nsp.bmc.data.status != "respond" || s.bmc.data.status != "playing" || ids.length != s.nsp.bmc.data.whiteCount)
			return s.emit("playWhiteRes", false);
		var error = false;
		s.bmc.response = ids.map(id => {
			var out = s.bmc.hand.find(o => {
				return (o.id == id);
			});
			if (u.isndef(out))
				error = true;
			return (out);
		});
		if (error) {
			s.bmc.response = [];
			return s.emit("playWhiteRes", false);
		}
		ids.forEach(id => {
			s.bmc.hand = s.bmc.hand.filter(o => {
				return (id != o.id);
			});
		});
		s.bmc.data.status = "played";
		s.emit("playWhiteRes", true);
		bu.playerUpdate(s);
		if (Object.keys(s.nsp.adapter.rooms.players.sockets).reduce((out, id) => {
			return (out && s.nsp.sockets[id].bmc.data.status != "playing")
		}, true)){
			clearInterval(s.nsp.bmc.timeout);
			this.fx.choose(s.nsp);
		}
	},
	choose: function(s, i){
		if (s.nsp.bmc.data.status != "choosing" || s.bmc.data.status != "choosing" || u.isndef(s.nsp.bmc.playedWhites[i]))
			return s.emit("chooseRes", false);
		this.fx.win(s.nsp, s.nsp.bmc.playedWhites[i].id);
		s.emit("chooseRes", true);
	}
}

function whiteTabs(nsp){
	var sockets = Object.keys(nsp.adapter.rooms.players.sockets).map(id => {
		return (nsp.sockets[id]);
	});
	var played = sockets.filter(o => {
		return (o.bmc.data.status == "played");
	});
	var out = played.map(o => {
		return ({id: o.id, res: o.bmc.response});
	});
	nsp.bmc.playedWhites = out;
	out = out.map(o => {
		return o.res;
	});
	return out;
}
