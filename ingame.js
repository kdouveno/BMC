const u = require("./public/utils.js");

module.exports = {
	buildPiles: function(bmc) {
		bmc.piles = {res: [], calls: []};
		Object.keys(bmc.decks).forEach((o) => {
			for (var i = 0; i < bmc.decks[o].count; i++) {
				bmc.piles.res = bmc.piles.res.concat(bmc.decks[o].res);
				bmc.piles.calls = bmc.piles.calls.concat(bmc.decks[o].calls);
			}
		});
		bmc.piles.res = u.shuffle(bmc.piles.res);
	},
	giveCards: function(nsp) {
		for (let i = 0; i < nsp.bmc.settings.handLength; i++) {
			Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
				this.draw(nsp.sockets[id]);
			});
		}
	},
	draw: function(s) {
		s.bmc.hand.push(Object.assign({},s.nsp.bmc.piles.res.shift()));
	},
	washHands: function(nsp) {
		Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
			nsp.sockets[id].bmc.hand = [];
		});
	},
	setOrder: function(nsp) {
		nsp.bmc.playerQueue = {
			selector: 0,
			queue: u.shuffle(
				Object.keys(nsp.adapter.rooms.players.sockets)
			)
		};
	}
}
