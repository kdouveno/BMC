const uuid	= require("uuid/v1");
const u		= require("../public/scripts/utils.js");

module.exports = function(socket, msg, callback, duration) {
		var promptToken = uuid();
		var fx = function(res){
			// insecure: anybody can possibly trigger this event
			callback(res);
			socket.off(promptToken, ()=>null);
		};
		socket.on(promptToken, fx);
		socket.emit("notification", {msg: msg, duration: duration, choice: !!callback, promptToken: promptToken})
	}
