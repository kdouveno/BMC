var socketEvents = {
	newUserId: function(uuid) {
		console.log("Event triggered");
		localStorage.userId = uuid;
	},
	notification: function(data) {
		console.log("Notification:", data.msg, "\n" + (data.choice ? "yes or no?" : ".") + "\n promptToken: " + data.promptToken);
	},
	roomJoined: function(roomId) {
		u.href.append("token", roomId);
		ui.displayGameUI();
	},
	playerJoined: function(data) {
		console.log("playerJoined Trigered: ", data);
	},
	updateSettings: function(data) {
		KDform.inject("#gameSettings", data);
	}
}