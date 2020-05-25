const u				= require("./public/scripts/utils.js");
const notif			= require("./Notification.js");
const Room			= require("./Room.js");
const Session		= require("./Session.js");
module.exports = {
	knockRoom: function(data, s) {
		var session = s.bmc.sessions[data.sessionToken]
		if (u.isndef(session)) { // if given session id doesn't already exist 
			var room = s.bmc.rooms[data.token];
			if (u.isndef(room)) { // and so doesn't given room id
				room = new Room(s, data.token); //create room and session
				room.join(new Session(s, room, data));
			} else  // if the session doesn't exist but the room deos
				if (room.hasRoom(data.spectator)){
					room.join(new Session(s, room, data)); // try joining it
				}
		} else {
			if (session.user == s.bmc_user) { //if given session exist and socket's user owns it
				notif(s, "Do you wanna resume this session ? (or kill it...)", function(res){ // prompt for directive
					if (res)
						session.resume(s);
					else
					{
						session.room.kick();
						delete s.bmc.sessions[session.uuid];
						this.knockRoom(s, data);
					}
				});
			}
			else {
				notif(s, "you do not own this session");
			}
		}
		
	},
	playerUpdate: function(data, s) {
		if (s.session.gameData.role === "admin")
			s.session.room.updateSettings(data);
		else (emit)
	}
}