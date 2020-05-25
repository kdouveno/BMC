const uuid	= require("uuid/v1");

module.exports = function(socket, msg, callback, duration) {
		var promptToken = uuid();
		var fx = function(res){
			// insecure: anybody can possibly trigger this event
			callback(res);
			socket.off(promptToken, fx);
		};
		socket.on(promptToken, fx);
		socket.emit("notification", {msg: msg, duration: duration, choice: !!callback, promptToken: promptToken})
	}
