const u				= require("./public/scripts/utils.js");
const notif			= require("./Notification.js");
const Room			= require("./Room.js");
const Session		= require("./Session.js");
module.exports = {
	knockRoom: function(data, s) { // optimisation
		var session = s.bmc.sessions[data.sessionToken]
		if (u.isndef(session)) { // if given session id doesn't already exist 
			var room = s.bmc.rooms[data.token];
			if (u.isndef(room)) { // and so doesn't given room id
				try {
					room = new Room(s, data.token); //create room and session
					room.join(new Session(s, room, data));
				} catch (e) {
					delete room;
					notif(s, e);
				}
			} else  // if the session doesn't exist but the room deos
				if (room.hasRoom(data.spectator)){
					try {
						room.join(new Session(s, room, data)); // try joining it
					} catch (e) {
						notif(s, e);
					}
				}
		} else {
			if (session.user == s.bmc_user) { //if given session exist and socket's user owns it
				if (session.socket && session.socket.connected) {
					notif(s, "Session currently in use");
					return ;
				}
				notif(s, "Do you wanna resume this session ? (or kill it...)", (res) => { // prompt for directive
					if (res)
						session.resume(s);
					else
					{
						session.kick();
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
		try {
			s.session.setInfos(data)
			s.session.update();
		} catch (e) {
			notif(s, e);
		}
	},
	settingsUpdate: function(data, s) {
		if (s.bmcSession.gameData.role == "admin") {
			// try {
				s.bmcSession.room.updateSettings(data);
			// } catch (e) {
				// console.log("caca 2");
				// notif(s, e);
			// }
		} else {
			notif(s, "You have no permission to change settings.");
		}
	}
}