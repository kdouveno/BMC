const express		= require("express");
const app			= express();
const http			= require("http").Server(app);
const io			= require("socket.io")(http);

BMCs = { //BMC Server
	users: {},
	sessions: {},
	rooms: {},
	io: io
}

const u				= require("../public/scripts/utils.js");
const Session		= require("./Session.js");
const User			= require("./User.js");
const userEvents	= require("./UserEvents.js");

app.use(express.static("public"));

io.sockets.on("connection", function(socket){
	var userId = socket.handshake.query.userId;
	var tmp;
	console.log("Io connection");
	
	if (u.isndef(BMCs.users[userId])) {
		console.log("New User Created");
		tmp = new User();
		BMCs.users[tmp.uuid] = tmp;
		userId = tmp.uuid;
		socket.emit("newUserId", tmp.uuid);
	} else {
		tmp = BMCs.users[userId];
		console.log("User Retreived")
	}
	socket.bmcUser = tmp;
	u.registerEvents(socket, userEvents);
});

http.listen(8080, function(){
	console.log("listening to 8080");
});