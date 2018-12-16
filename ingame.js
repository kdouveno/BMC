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
		bmc.piles.calls = u.shuffle(bmc.piles.calls);
	},
	fillHands: function(nsp) {
		Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
			while (nsp.sockets[id].bmc.hand.length <  nsp.bmc.settings.handLength)
				this.draw(nsp.sockets[id]);
		});
	},
	draw: function(s, black) {
		if (black){
			s.bmc.data.blackCard = Object.assign({}, s.bmc.piles.calls.shift());
			s.bmc.data.whiteCount = s.bmc.data.blackCard.text.length - 1;
		}
		else
			s.bmc.hand.push(Object.assign({}, s.nsp.bmc.piles.res.shift()));
	},
	washHands: function(nsp) {
		Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
			nsp.sockets[id].bmc.hand = [];
		});
	},
	setOrder: function(nsp) {
		nsp.bmc.data.selector = 0;
		nsp.bmc.data.queue = u.shuffle(
			Object.keys(nsp.adapter.rooms.players.sockets)
		);
		Object.keys(nsp.adapter.rooms.players.sockets).forEach(id => {
			nsp.sockets[id].bmc.data.points = 0;
		});
	}
}
