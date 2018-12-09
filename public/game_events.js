ge = {
	playerUpdate: function(data) {
		Object.assign(game.users[data.id], data.user);
		console.log(game.users[data.id].data.refInfo.displayName + " updated. (id: " + data.id + ")");
	},
	loadUser: function(data) {
		if (u.isndef(game.users[data.id]))
			game.users[data.id] = {};
		Object.assign(game.users[data.id], data.user);
		console.log(game.users[data.id].data.refInfo.displayName + " loaded. (id: " + data.id + ")");
	},
	alert: function(msg) {
		console.log(msg);
	},
	updateSettings: function(settings) {
		game.settings = settings;
	},
	updateDecks: function(decks) {
		game.decks = decks;
	},
	kickedOut: function(data) {
		console.log("you got kicked out of " + data.id + " for the following reason:\n");
		console.log(data.msg);
	},
	gameStatus: function(data) {
		console.log("GAMESTATUS");
		console.log(data);
		game.settings = data.settings;
		game.data = data.data;
	},
	updateHand: function(hand){
		me.hand = hand;
		console.log("HAND");
		console.log(hand);
	}
}
