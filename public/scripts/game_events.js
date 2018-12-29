ge = {
	playerUpdate: function(data) {
		Object.assign(game.users[data.id], data.user);
		if (/modo|owner/.test(me.data.role))
			$("fieldset.modOnly").removeAttr("disabled");
		else {
			$("fieldset.modOnly").attr("disabled", true);
		}
	},
	loadUser: function(data) {
		if (u.isndef(game.users[data.id]))
			game.users[data.id] = {};
		Object.assign(game.users[data.id], data.user);
	},
	alert: function(msg) {
		alert(msg);
	},
	updateSettings: function(settings) {
		game.settings = settings;
		KDform.inject("#gameSettings", game.settings);
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
		game.settings = data.settings;
		game.data = data.data;
	},
	updateHand: function(hand){
		me.hand = hand;
		console.log("HAND");
	},


	playWhiteRes: function(res) {
		console.log(res ? "play white confirmed" : "play white rejected");
	},
	chooseRes: function(res) {
		console.log(res ? "choose confirmed" : "choose rejected");
	},
	timerDate: function(time) {
		console.log("TIMER");
		console.log(time);
	},
	playedWhites: function(tab) {
		game.playedWhites = tab;
	},
	win: function(id) {
		console.log(game.users[id].info.displayName + " WINS the round");
	},
	gameWin: function(tab) {
		tab.forEach(id => {
			if (id == gameSocket.id)
				console.log("YOU WIN the game");
			else
				console.log(game.users[id].info.displayName + " WINS the game");
		});
	}
}
