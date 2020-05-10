socketEvents = {
	newUserId: function(s, uuid) {
		console.log("Event triggered");
		localStorage.userId = uuid;
	},
	notification: function(s, data) {
		console.log("Notification: \"" + data.msg + "\", " + (data.choice ? "yes or no?" : ".") + "\n promptToken: " + data.promptToken);
	}
	
}