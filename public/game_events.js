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
	}
}
