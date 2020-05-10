const uuid	= require("uuid/v1");

module.exports = function(socket, msg, callback, duration) {
		var promptToken = uuid();
		var fx = function(res){
			callback(res);
			socket.off(promptToken, fx);
		};
		socket.on(promptToken, fx);
		socket.emit("notification", {msg: msg, duration: duration, choice: !!callback, promptToken: promptToken})
	}
