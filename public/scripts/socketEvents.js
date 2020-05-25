var socketEvents = {
	newUserId: function(uuid) {
		console.log("Event triggered");
		localStorage.userId = uuid;
	},
	notification: function(data) {
		console.log("Notification: \"" + data.msg + "\", " + (data.choice ? "yes or no?" : ".") + "\n promptToken: " + data.promptToken);
	},
	roomJoined: function() {
		ui.displayGameUI();
	},
	playerJoined: function(data) {
		console.log("playerJoined Trigered: ", data);
	}
	
}