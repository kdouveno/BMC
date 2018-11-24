const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const uuid = require("uuid/v1");
const ns = require("./ns_events.js");

app.use(express.static("public"));
io.on("connection", function(socket){
	socket.on("newGame", function(){
		socket.emit("newGame", initGame());
	});
});

http.listen(8080, function(){
	console.log("listening to 8080");
});
