const u				= require("../public/scripts/utils.js");
const notif			= require("./Notification.js");
const Room			= require("./Room.js");
const Session		= require("./Session.js");
module.exports = {
	knockRoom: function(data, s) { // optimisation
		var session = BMCs.sessions[data.sessionToken] // fecth session via session token
		if (u.isndef(session)) { // if given session id doesn't already exist 
			var room = BMCs.rooms[data.token]; // fecth room via roomToken
			if (u.isndef(room)) { // and so doesn't given room id
					room = new Room(data.token); //create room and session
					room.join(new Session(s, room, data));
			} else  // if the session doesn't exist but the room deos
				if (room.hasRoom(data.spectator)){
					room.join(new Session(s, room, data)); // try joining it
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
						delete BMCs.sessions[session.uuid];
						this.knockRoom(data, s);
					}
				});
			}
			else {
				notif(s, "you do not own this session");
			}
		}
		
	},
	playerUpdate: function(data, s) {
		// try {
			s.bmcSession.setInfos(data);
			s.bmcSession.update();
		// } catch (e) {
			// notif(s, e);
		// }
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
	},
	addDeck: function(data, s){
		var room = s.bmcSession.room; // RoomCards

		room.cards.addDeck(data, ()=>{
		console.log("test");

			room.cards.updateDecks();
		})
	},
	setMultiplier: function(data, s){
		var room = s.bmcSession.room;
		room.cards.setMultiplier(data.code5, parseInt(data.value.replace(/[^0-9]+/g, "")));
		room.cards.updateDecks();
	}
}