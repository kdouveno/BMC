const express		= require("express");
const app			= express();
const http			= require("http").Server(app);
const io			= require("socket.io")(http);
const u				= require("./public/scripts/utils.js");
const Session		= require("./Session.js");
const User			= require("./User.js");
const userEvents	= require("./UserEvents.js");

var bmc = {
	users: {},
	sessions: {},
	rooms: {},
	io: io
}

app.use(express.static("public"));

io.sockets.on("connection", function(socket){
	var userId = socket.handshake.query.userId;
	var tmp;
	console.log("Io connection");
	
	if (u.isndef(bmc.users[userId])) {
		console.log("New User Created");
		tmp = new User();
		bmc.users[tmp.uuid] = tmp;
		userId = tmp.uuid;
		socket.emit("newUserId", tmp.uuid);
	} else {
		tmp = bmc.users[userId];
		console.log("User Retreived")
	}
	socket.bmcUser = tmp;
	socket.bmc = bmc;
	u.registerEvents(socket, userEvents);
});

http.listen(25565, function(){
	console.log("listening to 25565");
});